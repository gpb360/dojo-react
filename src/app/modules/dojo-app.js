// Dojo-based Task Manager implementation with single-spa lifecycle integration

// Configure AMD loader timeout
if (window.require && window.require.config) {
  try {
    console.log('[dojo-app] Configuring AMD loader');
    
    // Try to detect if Dojo paths are already configured
    if (window.dojoConfig) {
      console.log('[dojo-app] Found existing dojoConfig:', window.dojoConfig);
    }
    
    // Configure with multiple potential paths to increase chances of success
    window.require.config({
      waitSeconds: 15, // Increase timeout to 15 seconds
      baseUrl: '/',
      packages: [
        { name: 'dojo', location: '/node_modules/dojo' },
        { name: 'dijit', location: '/node_modules/dijit' },
        { name: 'dojox', location: '/node_modules/dojox' }
      ],
      // Add these paths to help resolve modules
      paths: {
        'dojo': '/node_modules/dojo',
        'dijit': '/node_modules/dijit',
        'dojox': '/node_modules/dojox'
      },
      async: true,
      parseOnLoad: false,
      isDebug: true
    });
    console.log('[dojo-app] AMD loader configured with extended timeout');
    
    // Check if we can access the configuration
    if (window.require.rawConfig) {
      console.log('[dojo-app] AMD loader raw config:', window.require.rawConfig);
    }
  } catch (e) {
    console.warn('[dojo-app] Could not configure AMD loader:', e);
  }
}

// Alternative direct access to check if dojo/dom is already loaded
if (window.dojo && window.dojo.byId) {
  console.log('[dojo-app] Found global dojo.byId function');
}

// Add better webpack logging
console.log('[dojo-app] Webpack environment information:');
console.log('- NODE_ENV:', typeof process !== 'undefined' && process.env ? process.env.NODE_ENV : 'not available in browser');
console.log('- Webpack mode:', typeof process !== 'undefined' && process.env ? (process.env.WEBPACK_MODE || 'unknown') : 'not available in browser');
console.log('- Current URL:', window.location.href);
console.log('- Base URL:', document.baseURI);

// Log when the module is loaded
console.log('[dojo-app] Module loaded and initialized');

// Debug helper to check Dojo availability
function debugDojoStatus() {
  console.group('[dojo-app] Dojo Environment Status');
  
  // Check global dojo object
  console.log('Global dojo object:', window.dojo ? 'Available' : 'Not available');
  if (window.dojo) {
    console.log('dojo version:', window.dojo.version || 'Unknown');
    console.log('dojo.byId:', typeof window.dojo.byId === 'function' ? 'Function' : 'Not a function');
    console.log('dojo.query:', typeof window.dojo.query === 'function' ? 'Function' : 'Not a function');
    console.log('dojo.create:', typeof window.dojo.create === 'function' ? 'Function' : 'Not a function');
    console.log('dojo.ready:', typeof window.dojo.ready === 'function' ? 'Function' : 'Not a function');
  }
  
  // Check AMD loader
  const requireFn = window.dojoRequire || window.require;
  console.log('AMD loader:', requireFn ? 'Available' : 'Not available');
  if (requireFn) {
    console.log('AMD loader type:', typeof requireFn);
    console.log('AMD config function:', typeof requireFn.config === 'function' ? 'Available' : 'Not available');
    
    // Log any config we can find
    if (window.dojoConfig) {
      console.log('dojoConfig found:', window.dojoConfig);
    }
    if (window.require && window.require.config) {
      console.log('require.config available');
    }
  }
  
  // Check Dijit
  console.log('Global dijit object:', window.dijit ? 'Available' : 'Not available');
  if (window.dijit) {
    console.log('dijit.form:', window.dijit.form ? 'Available' : 'Not available');
    if (window.dijit.form) {
      console.log('dijit.form.Button:', window.dijit.form.Button ? 
        (typeof window.dijit.form.Button === 'function' ? 'Function' : 'Not a function') : 
        'Not available');
      console.log('dijit.form.TextBox:', window.dijit.form.TextBox ? 
        (typeof window.dijit.form.TextBox === 'function' ? 'Function' : 'Not a function') : 
        'Not available');
      console.log('dijit.form.CheckBox:', window.dijit.form.CheckBox ? 
        (typeof window.dijit.form.CheckBox === 'function' ? 'Function' : 'Not a function') : 
        'Not available');
    }
  }
  
  // Check DOM
  console.log('app container in DOM:', document.getElementById('app') ? 'Found' : 'Not found');
  
  // Try to detect potential path issues
  if (requireFn && typeof requireFn === 'function') {
    console.log('Checking potential module paths...');
    
    // Log the current page URL and base href
    console.log('Current URL:', window.location.href);
    const baseElement = document.querySelector('base');
    console.log('Base href:', baseElement ? baseElement.getAttribute('href') : 'No base element');
    
    // Check for script tags that might load Dojo
    const scriptTags = Array.from(document.querySelectorAll('script[src]'))
      .filter(script => script.src.includes('dojo') || script.src.includes('require'));
    
    console.log('Dojo/Require script tags found:', scriptTags.length);
    scriptTags.forEach(script => {
      console.log('Script source:', script.src);
    });
    
    // Add a check for webpack modules
    console.log('Webpack built modules check:');
    if (window.webpackJsonp) {
      console.log('- webpackJsonp is available');
    } else if (window.__webpack_require__) {
      console.log('- __webpack_require__ is available');
    } else {
      console.log('- No webpack runtime detected in global scope');
    }
  }
  
  console.groupEnd();
}

// Map of active widgets for cleanup
const activeWidgets = new Map();

// Export the lifecycle functions for Single-SPA
export function bootstrap(props) {
  console.log('[dojo-app] Bootstrap called with props:', props);
  
  // Call our internal bootstrap function
  return bootstrapImplementation(props);
}

export function mount(props) {
  console.log('[dojo-app] Mount called with props:', props);
  return mountImplementation(props);
}

export function unmount(props) {
  console.log('[dojo-app] Unmount called with props:', props);
  
  // Use try/catch to ensure we always resolve the promise 
  // even if there are errors during unmount
  return new Promise((resolve) => {
    try {
      // Clear the container
      const container = document.getElementById('app');
      if (container) {
        console.log('[dojo-app] Clearing container');
        container.innerHTML = '';
      }
      
      // Clean up any active widgets if they exist
      if (activeWidgets) {
        console.log('[dojo-app] Cleaning up active widgets');
        
        // Destroy all active widgets
        activeWidgets.forEach((widget, key) => {
          try {
            if (widget && typeof widget.destroy === 'function') {
              widget.destroy();
            }
          } catch (e) {
            console.warn(`[dojo-app] Error destroying widget ${key}:`, e);
          }
        });
        
        // Clear the map
        activeWidgets.clear();
      }
      
      console.log('[dojo-app] Unmount completed successfully');
      resolve();
    } catch (error) {
      console.error('[dojo-app] Error during unmount:', error);
      // Resolve anyway to avoid hanging the application
      resolve();
    }
  });
}

// Internal implementation of bootstrap logic
function bootstrapImplementation(props) {
  return new Promise((resolve) => {
    console.log('[dojo-app] Bootstrapping Dojo application...');
    
    // Debug Dojo status
    debugDojoStatus();
    
    // First check if global dojo is already available
    if (window.dojo) {
      console.log('[dojo-app] Global dojo object found, proceeding with bootstrap');
      resolve();
      return;
    }
    
    // Check if we have AMD loader available
    const requireFn = window.dojoRequire || window.require;
    
    if (requireFn && typeof requireFn === 'function') {
      console.log('[dojo-app] AMD loader found, configuring...');
      
      // Check if we have require.config
      if (typeof requireFn.config === 'function') {
        console.log('[dojo-app] Configuring AMD loader...');
        
        try {
          // Log existing dojoConfig if it exists
          if (window.dojoConfig) {
            console.log('[dojo-app] Existing dojoConfig:', window.dojoConfig);
          }
          
          // Configure AMD loader with multiple path possibilities
          requireFn.config({
            // Try multiple possible paths for modules
            paths: {
              'dojo': ['/js/dojo/dojo', '/dojo/dojo', '/node_modules/dojo/dojo'],
              'dijit': ['/js/dijit', '/dijit', '/node_modules/dijit'],
              'dojox': ['/js/dojox', '/dojox', '/node_modules/dojox']
            },
            // Set async to true
            async: true,
            // Set timeout to 15 seconds
            waitSeconds: 15,
            // Debug options
            parseOnLoad: false,
            isDebug: true
          });
          
          console.log('[dojo-app] AMD loader configured');
          
          // Try to log raw config if accessible
          if (requireFn._config) {
            console.log('[dojo-app] Raw AMD config:', requireFn._config);
          }
        } catch (e) {
          console.error('[dojo-app] Error configuring AMD loader:', e);
        }
      }
    } else {
      console.warn('[dojo-app] No AMD loader found');
    }
    
    // Check if we already have dojo.byId
    if (window.dojo && typeof window.dojo.byId === 'function') {
      console.log('[dojo-app] dojo.byId already loaded');
    }
    
    console.log('[dojo-app] Bootstrap completed');
    resolve();
  });
}

// Internal implementation of mount logic
function mountImplementation(props) {
  console.log('[dojo-app] Starting mount process');
  
  return new Promise((resolve, reject) => {
    // Set a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.warn('[dojo-app] Mount timeout triggered - defaulting to vanilla JS implementation');
      mountWithVanillaJS(props.domElementGetter && typeof props.domElementGetter === 'function' ? props.domElementGetter() : document.getElementById('app'))
        .then(resolve)
        .catch(reject);
    }, 5000);
    
    try {
      // Try mounting with global Dojo or AMD Dojo first
      mountWithLifecycleIntegration(props)
        .then(() => {
          clearTimeout(timeoutId);
          console.log('[dojo-app] Mount completed successfully');
          resolve();
        })
        .catch(error => {
          console.error('[dojo-app] Error during mountWithLifecycleIntegration:', error);
          clearTimeout(timeoutId);
          
          // Fall back to vanilla JS implementation
          console.log('[dojo-app] Falling back to vanilla JS implementation');
          mountWithVanillaJS(props.domElementGetter && typeof props.domElementGetter === 'function' ? props.domElementGetter() : document.getElementById('app'))
            .then(resolve)
            .catch(reject);
        });
    } catch (error) {
      console.error('[dojo-app] Exception during mount process:', error);
      clearTimeout(timeoutId);
      
      // Fall back to vanilla JS implementation
      console.log('[dojo-app] Falling back to vanilla JS implementation');
      mountWithVanillaJS(props.domElementGetter && typeof props.domElementGetter === 'function' ? props.domElementGetter() : document.getElementById('app'))
        .then(resolve)
        .catch(reject);
    }
  });
}

// Primary mount implementation with lifecycle integration
function mountWithLifecycleIntegration(props) {
  return new Promise((resolve, reject) => {
    // First, check if global Dojo is already available
    if (window.dojo && typeof window.dojo.byId === 'function') {
      console.log('[dojo-app] Using global dojo object instead of AMD loading');
      
      try {
        // Get references to global Dojo functions
        const dom = {
          byId: window.dojo.byId
        };
        
        const domConstruct = {
          create: window.dojo.create || function(tag, attrs, refNode) {
            const elem = document.createElement(tag);
            if (attrs) {
              for (const key in attrs) {
                if (key === 'className') {
                  elem.className = attrs[key];
                } else if (key === 'innerHTML') {
                  elem.innerHTML = attrs[key];
                } else if (key === 'style' && typeof attrs[key] === 'object') {
                  Object.assign(elem.style, attrs[key]);
                } else {
                  elem.setAttribute(key, attrs[key]);
                }
              }
            }
            if (refNode) {
              refNode.appendChild(elem);
            }
            return elem;
          }
        };
        
        const on = window.dojo.on || function(node, event, callback) {
          node.addEventListener(event, callback);
          return {
            remove: function() {
              node.removeEventListener(event, callback);
            }
          };
        };
        
        const domClass = {
          add: window.dojo.addClass || function(node, className) {
            node.classList.add(className);
          },
          remove: window.dojo.removeClass || function(node, className) {
            node.classList.remove(className);
          }
        };
        
        // Use direct DOM access as fallback if global dojo.byId fails
        let container;
        try {
          container = dom.byId('app');
        } catch (e) {
          console.warn('[dojo-app] dom.byId failed, using direct DOM access');
          container = document.getElementById('app');
        }
        
        if (!container) {
          console.error('[dojo-app] Container #app not found in DOM');
          throw new Error('Container element not found');
        }
        
        console.log('[dojo-app] Found container element with global Dojo');
        
        // Create simpler DOM structure with vanilla JS since we don't have Dojo widgets
        container.innerHTML = '';
        
        const mainDiv = domConstruct.create("div", {
          className: "dojo-task-manager claro",
          style: { 
            padding: "24px", 
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            maxWidth: "600px",
            margin: "0 auto"
          }
        }, container);
        
        domConstruct.create("h2", {
          innerHTML: "Tasks",
          style: { 
            marginTop: "0",
            marginBottom: "20px",
            color: "#2c3e50"
          }
        }, mainDiv);
        
        // Create form container
        const formDiv = domConstruct.create("div", {
          style: { 
            display: "flex", 
            alignItems: "center",
            marginBottom: "20px",
            gap: "10px"
          }
        }, mainDiv);
        
        // Create input
        const input = domConstruct.create("input", {
          type: "text",
          placeholder: "What needs to be done?",
          className: "dijitInputField",
          style: {
            flex: "1",
            padding: "10px 12px",
            fontSize: "16px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            outline: "none"
          }
        }, formDiv);
        
        // Create button
        const button = domConstruct.create("button", {
          innerHTML: "Add",
          className: "dijitButton",
          style: {
            background: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px 16px",
            cursor: "pointer",
            fontSize: "16px",
            transition: "background 0.2s"
          }
        }, formDiv);
        
        // Create task list
        const taskList = domConstruct.create("ul", {
          id: "task-list",
          style: {
            listStyle: "none",
            padding: 0
          }
        }, mainDiv);
        
        // Create empty state
        let emptyState;
        try {
          emptyState = domConstruct.create("div", {
            style: {
              textAlign: "center",
              padding: "20px",
              color: "#777",
              backgroundColor: "#f9f9f9",
              borderRadius: "4px",
              margin: "20px 0",
              display: "block"
            }
          }, mainDiv);
          
          domConstruct.create("p", {
            innerHTML: "No tasks added yet. Add your first task above!"
          }, emptyState);
          
          domConstruct.create("span", {
            innerHTML: "📝",
            style: {
              fontSize: "24px"
            }
          }, emptyState);
        } catch (e) {
          emptyState = document.createElement('div');
          emptyState.style.textAlign = "center";
          emptyState.style.padding = "20px";
          emptyState.style.color = "#777";
          emptyState.style.backgroundColor = "#f9f9f9";
          emptyState.style.borderRadius = "4px";
          emptyState.style.margin = "20px 0";
          emptyState.style.display = "block";
          
          const emptyText = document.createElement('p');
          emptyText.innerHTML = "No tasks added yet. Add your first task above!";
          emptyState.appendChild(emptyText);
          
          const emptyIcon = document.createElement('span');
          emptyIcon.innerHTML = "📝";
          emptyIcon.style.fontSize = "24px";
          emptyState.appendChild(emptyIcon);
          
          mainDiv.appendChild(emptyState);
        }
        
        // Add task function
        function addTask() {
          const taskText = input.value.trim();
          if (!taskText) return;
          
          // Hide empty state when tasks are added
          if (emptyState) {
            emptyState.style.display = "none";
          }
          
          // Create task item
          const taskItem = domConstruct.create("li", {
            style: {
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
              padding: "12px",
              borderRadius: "4px",
              backgroundColor: "#f5f5f5",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }
          }, taskList);
          
          // Create checkbox
          const checkbox = domConstruct.create("input", {
            type: "checkbox",
            style: { marginRight: "12px" }
          }, taskItem);
          
          // Create text node
          const taskTextNode = domConstruct.create("span", {
            innerHTML: taskText,
            style: { 
              flexGrow: "1",
              fontWeight: "500",
              color: "#333"
            }
          }, taskItem);
          
          // Create delete button
          const deleteBtn = domConstruct.create("button", {
            innerHTML: "Delete",
            className: "dijitButton",
            style: {
              background: "#ff5252",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "14px",
              transition: "background 0.2s"
            }
          }, taskItem);
          
          // Add event listeners
          checkbox.addEventListener("change", function() {
            if (this.checked) {
              domClass.add(taskTextNode, "completed-task");
              taskTextNode.style.textDecoration = "line-through";
              taskTextNode.style.fontWeight = "normal";
              taskTextNode.style.color = "#777";
              taskItem.style.opacity = "0.7";
            } else {
              domClass.remove(taskTextNode, "completed-task");
              taskTextNode.style.textDecoration = "none";
              taskTextNode.style.fontWeight = "500";
              taskTextNode.style.color = "#333";
              taskItem.style.opacity = "1";
            }
          });
          
          deleteBtn.addEventListener("click", function() {
            taskList.removeChild(taskItem);
            
            // Show empty state when all tasks are removed
            if (taskList.children.length === 0 && emptyState) {
              emptyState.style.display = "block";
            }
          });
          
          // Add hover effects
          try {
            on(deleteBtn, "mouseover", function() {
              this.style.background = "#ff1744";
            });
            
            on(deleteBtn, "mouseout", function() {
              this.style.background = "#ff5252";
            });
          } catch (e) {
            deleteBtn.addEventListener("mouseover", function() {
              this.style.background = "#ff1744";
            });
            
            deleteBtn.addEventListener("mouseout", function() {
              this.style.background = "#ff5252";
            });
          }
          
          // Clear input and focus
          input.value = "";
          input.focus();
        }
        
        // Connect events
        button.addEventListener("click", addTask);
        input.addEventListener("keypress", function(e) {
          if (e.key === "Enter" || e.keyCode === 13) {
            addTask();
          }
        });
        
        // Add CSS for completed tasks
        const style = document.createElement("style");
        style.textContent = ".completed-task { text-decoration: line-through; color: #888; }";
        document.head.appendChild(style);
        
        // Focus input
        input.focus();
        
        console.log("[dojo-app] Global Dojo UI setup complete");
        resolve();
        return;
      } catch (error) {
        console.error("[dojo-app] Error using global Dojo:", error);
        // Continue to AMD loading attempt
      }
    }
    
    // If global Dojo didn't work, try AMD loading
    // Get the dojoRequire function
    const dojoRequire = window.dojoRequire || window.require;
    
    if (!dojoRequire || typeof dojoRequire !== 'function') {
      console.error('[dojo-app] AMD loader not available');
      reject(new Error('AMD loader not available'));
      return;
    }
    
    // Debug what modules are available
    console.log('[dojo-app] Using require function:', typeof dojoRequire);
    
    try {
      // Make sure Dojo is properly initialized first - this is crucial
      if (window.dojo) {
        console.log('[dojo-app] Using global dojo object');
        
        // Create wrapper functions for the modules we need
        const dom = {
          byId: typeof window.dojo.byId === 'function' ? 
            window.dojo.byId : 
            function(id) { return document.getElementById(id); }
        };
        
        const domConstruct = {
          create: typeof window.dojo.create === 'function' ? 
            window.dojo.create : 
            function(tag, attrs, refNode) {
              const elem = document.createElement(tag);
              if (attrs) {
                for (const key in attrs) {
                  if (key === 'className') {
                    elem.className = attrs[key];
                  } else if (key === 'innerHTML') {
                    elem.innerHTML = attrs[key];
                  } else if (key === 'style' && typeof attrs[key] === 'object') {
                    Object.assign(elem.style, attrs[key]);
                  } else {
                    elem.setAttribute(key, attrs[key]);
                  }
                }
              }
              if (refNode) {
                refNode.appendChild(elem);
              }
              return elem;
            }
        };
        
        const on = typeof window.dojo.on === 'function' ? 
          window.dojo.on : 
          function(node, event, callback) {
            node.addEventListener(event, callback);
            return {
              remove: function() {
                node.removeEventListener(event, callback);
              }
            };
          };
        
        const domClass = {
          add: typeof window.dojo.addClass === 'function' ? 
            window.dojo.addClass : 
            function(node, className) { node.classList.add(className); },
          remove: typeof window.dojo.removeClass === 'function' ? 
            window.dojo.removeClass : 
            function(node, className) { node.classList.remove(className); }
        };
        
        console.log('[dojo-app] Created module wrappers for dom, domConstruct, on, and domClass');
        afterModulesLoaded(dom, domConstruct, on, domClass)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      // If global dojo is not available, try individual AMD loading
      // This approach will load each module separately to avoid potential issues
      console.log('[dojo-app] Attempting individual module loads');
      
      // We'll create our own module containers
      let dom = null;
      let domConstruct = null;
      let on = null;
      let domClass = null;
      
      // Load the modules one by one - this is more reliable than loading them all at once
      dojoRequire(["dojo/dom"], function(domModule) {
        console.log('[dojo-app] Loaded dom module:', typeof domModule);
        dom = domModule;
        
        // Load the next module
        dojoRequire(["dojo/dom-construct"], function(domConstructModule) {
          console.log('[dojo-app] Loaded dom-construct module:', typeof domConstructModule);
          domConstruct = domConstructModule;
          
          // Load the next module
          dojoRequire(["dojo/on"], function(onModule) {
            console.log('[dojo-app] Loaded on module:', typeof onModule);
            on = onModule;
            
            // Load the final module
            dojoRequire(["dojo/dom-class"], function(domClassModule) {
              console.log('[dojo-app] Loaded dom-class module:', typeof domClassModule);
              domClass = domClassModule;
              
              // Now check if we have valid modules or if we need fallbacks
              let useFallbacks = false;
              
              // Check the dom module
              if (!dom || typeof dom.byId !== 'function') {
                console.warn('[dojo-app] dom.byId not available, using fallback');
                dom = {
                  byId: function(id) { return document.getElementById(id); }
                };
                useFallbacks = true;
              }
              
              // Check the domConstruct module
              if (!domConstruct || typeof domConstruct.create !== 'function') {
                console.warn('[dojo-app] domConstruct.create not available, using fallback');
                domConstruct = {
                  create: function(tag, attrs, refNode) {
                    const elem = document.createElement(tag);
                    if (attrs) {
                      for (const key in attrs) {
                        if (key === 'className') {
                          elem.className = attrs[key];
                        } else if (key === 'innerHTML') {
                          elem.innerHTML = attrs[key];
                        } else if (key === 'style' && typeof attrs[key] === 'object') {
                          Object.assign(elem.style, attrs[key]);
                        } else {
                          elem.setAttribute(key, attrs[key]);
                        }
                      }
                    }
                    if (refNode) {
                      refNode.appendChild(elem);
                    }
                    return elem;
                  }
                };
                useFallbacks = true;
              }
              
              // Check the on module
              if (!on || typeof on !== 'function') {
                console.warn('[dojo-app] on not available, using fallback');
                on = function(node, event, callback) {
                  node.addEventListener(event, callback);
                  return {
                    remove: function() {
                      node.removeEventListener(event, callback);
                    }
                  };
                };
                useFallbacks = true;
              }
              
              // Check the domClass module
              if (!domClass || typeof domClass.add !== 'function') {
                console.warn('[dojo-app] domClass.add not available, using fallback');
                domClass = {
                  add: function(node, className) { node.classList.add(className); },
                  remove: function(node, className) { node.classList.remove(className); }
                };
                useFallbacks = true;
              }
              
              console.log('[dojo-app] Module loading complete, using fallbacks:', useFallbacks);
              afterModulesLoaded(dom, domConstruct, on, domClass)
                .then(resolve)
                .catch(reject);
            });
          });
        });
      });
    } catch (error) {
      console.error('[dojo-app] Exception during AMD require call:', error);
      
      // Final fallback to vanilla JS implementation
      console.log('[dojo-app] Falling back to vanilla JS implementation');
      mountWithVanillaJS(props.domElementGetter && typeof props.domElementGetter === 'function' ? props.domElementGetter() : document.getElementById('app'))
        .then(resolve)
        .catch(reject);
    }
  });
}

// Function to handle the modules after they are loaded (either real Dojo modules or fallbacks)
function afterModulesLoaded(dom, domConstruct, on, domClass) {
  return new Promise((resolve, reject) => {
    try {
      // Verify that we have the necessary module functions
      console.log('[dojo-app] Using modules:',
        'dom.byId:', typeof dom.byId === 'function' ? 'function' : 'not a function',
        'domConstruct.create:', typeof domConstruct.create === 'function' ? 'function' : 'not a function'
      );
      
      // Get container element
      let container;
      try {
        // Try using dom.byId first
        container = dom.byId('app');
        console.log('[dojo-app] Container found using dom.byId');
      } catch (e) {
        // Fall back to document.getElementById
        console.warn('[dojo-app] Error using dom.byId, falling back to document.getElementById:', e);
        container = document.getElementById('app');
      }
      
      // If still no container, use other methods to find it
      if (!container) {
        console.warn('[dojo-app] Container #app not found, trying alternate methods');
        container = document.querySelector('#app') || document.querySelector('[id="app"]');
      }
      
      // Final check for container
      if (!container) {
        console.error('[dojo-app] Container #app not found in DOM');
        // Rather than throwing, create the container
        console.log('[dojo-app] Creating #app container');
        container = document.createElement('div');
        container.id = 'app';
        document.body.appendChild(container);
      }
      
      console.log('[dojo-app] Found or created container element');
      
      // Create UI
      // Clear container first
      container.innerHTML = '';
      
      // Create main div
      let mainDiv;
      try {
        mainDiv = domConstruct.create("div", {
          className: "dojo-task-manager claro",
          style: { 
            padding: "24px", 
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            maxWidth: "600px",
            margin: "0 auto"
          }
        }, container);
      } catch (e) {
        console.warn('[dojo-app] Error using domConstruct.create, falling back to DOM API:', e);
        mainDiv = document.createElement('div');
        mainDiv.className = "dojo-task-manager claro";
        mainDiv.style.padding = "24px";
        mainDiv.style.backgroundColor = "white";
        mainDiv.style.borderRadius = "8px";
        mainDiv.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
        mainDiv.style.maxWidth = "600px";
        mainDiv.style.margin = "0 auto";
        container.appendChild(mainDiv);
      }
      
      // Add title with appropriate fallbacks
      try {
        domConstruct.create("h2", {
          innerHTML: "Tasks",
          style: { 
            marginTop: "0",
            marginBottom: "20px",
            color: "#2c3e50"
          }
        }, mainDiv);
      } catch (e) {
        const h2 = document.createElement('h2');
        h2.innerHTML = "Tasks";
        h2.style.marginTop = "0";
        h2.style.marginBottom = "20px";
        h2.style.color = "#2c3e50";
        mainDiv.appendChild(h2);
      }
      
      // Create form container with appropriate fallbacks
      let formDiv;
      try {
        formDiv = domConstruct.create("div", {
          style: { 
            display: "flex", 
            alignItems: "center",
            marginBottom: "20px",
            gap: "10px"
          }
        }, mainDiv);
      } catch (e) {
        formDiv = document.createElement('div');
        formDiv.style.display = "flex";
        formDiv.style.alignItems = "center";
        formDiv.style.marginBottom = "20px";
        formDiv.style.gap = "10px";
        mainDiv.appendChild(formDiv);
      }
      
      // Create input with appropriate fallbacks
      let input;
      try {
        input = domConstruct.create("input", {
          type: "text",
          placeholder: "What needs to be done?",
          className: "dijitInputField",
          style: {
            flex: "1",
            padding: "10px 12px",
            fontSize: "16px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            outline: "none"
          }
        }, formDiv);
      } catch (e) {
        input = document.createElement('input');
        input.type = "text";
        input.placeholder = "What needs to be done?";
        input.className = "dijitInputField";
        input.style.flex = "1";
        input.style.padding = "10px 12px";
        input.style.fontSize = "16px";
        input.style.border = "1px solid #ddd";
        input.style.borderRadius = "4px";
        input.style.outline = "none";
        formDiv.appendChild(input);
      }
      
      // Create button with appropriate fallbacks
      let button;
      try {
        button = domConstruct.create("button", {
          innerHTML: "Add",
          className: "dijitButton",
          style: {
            background: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px 16px",
            cursor: "pointer",
            fontSize: "16px",
            transition: "background 0.2s"
          }
        }, formDiv);
      } catch (e) {
        button = document.createElement('button');
        button.innerHTML = "Add";
        button.className = "dijitButton";
        button.style.background = "#4caf50";
        button.style.color = "white";
        button.style.border = "none";
        button.style.borderRadius = "4px";
        button.style.padding = "10px 16px";
        button.style.cursor = "pointer";
        button.style.fontSize = "16px";
        button.style.transition = "background 0.2s";
        formDiv.appendChild(button);
      }
      
      // Create task list with appropriate fallbacks
      let taskList;
      try {
        taskList = domConstruct.create("ul", {
          id: "task-list",
          style: {
            listStyle: "none",
            padding: 0
          }
        }, mainDiv);
      } catch (e) {
        taskList = document.createElement('ul');
        taskList.id = "task-list";
        taskList.style.listStyle = "none";
        taskList.style.padding = "0";
        mainDiv.appendChild(taskList);
      }
      
      // Create empty state
      let emptyState;
      try {
        emptyState = domConstruct.create("div", {
          style: {
            textAlign: "center",
            padding: "20px",
            color: "#777",
            backgroundColor: "#f9f9f9",
            borderRadius: "4px",
            margin: "20px 0",
            display: "block"
          }
        }, mainDiv);
        
        domConstruct.create("p", {
          innerHTML: "No tasks added yet. Add your first task above!"
        }, emptyState);
        
        domConstruct.create("span", {
          innerHTML: "📝",
          style: {
            fontSize: "24px"
          }
        }, emptyState);
      } catch (e) {
        emptyState = document.createElement('div');
        emptyState.style.textAlign = "center";
        emptyState.style.padding = "20px";
        emptyState.style.color = "#777";
        emptyState.style.backgroundColor = "#f9f9f9";
        emptyState.style.borderRadius = "4px";
        emptyState.style.margin = "20px 0";
        emptyState.style.display = "block";
        
        const emptyText = document.createElement('p');
        emptyText.innerHTML = "No tasks added yet. Add your first task above!";
        emptyState.appendChild(emptyText);
        
        const emptyIcon = document.createElement('span');
        emptyIcon.innerHTML = "📝";
        emptyIcon.style.fontSize = "24px";
        emptyState.appendChild(emptyIcon);
        
        mainDiv.appendChild(emptyState);
      }
      
      // Add task function with appropriate fallbacks
      function addTask() {
        const taskText = input.value.trim();
        if (!taskText) return;
        
        // Hide empty state when tasks are added
        if (emptyState) {
          emptyState.style.display = "none";
        }
        
        // Create task item
        let taskItem;
        try {
          taskItem = domConstruct.create("li", {
            style: {
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
              padding: "12px",
              borderRadius: "4px",
              backgroundColor: "#f5f5f5",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }
          }, taskList);
        } catch (e) {
          taskItem = document.createElement('li');
          taskItem.style.display = "flex";
          taskItem.style.alignItems = "center";
          taskItem.style.marginBottom = "10px";
          taskItem.style.padding = "12px";
          taskItem.style.borderRadius = "4px";
          taskItem.style.backgroundColor = "#f5f5f5";
          taskItem.style.transition = "all 0.2s ease";
          taskItem.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
          taskList.appendChild(taskItem);
        }
        
        // Create checkbox with appropriate fallbacks
        let checkbox;
        try {
          checkbox = domConstruct.create("input", {
            type: "checkbox",
            style: { marginRight: "12px" }
          }, taskItem);
        } catch (e) {
          checkbox = document.createElement('input');
          checkbox.type = "checkbox";
          checkbox.style.marginRight = "12px";
          taskItem.appendChild(checkbox);
        }
        
        // Create text node with appropriate fallbacks
        let taskTextNode;
        try {
          taskTextNode = domConstruct.create("span", {
            innerHTML: taskText,
            style: { 
              flexGrow: "1",
              fontWeight: "500",
              color: "#333"
            }
          }, taskItem);
        } catch (e) {
          taskTextNode = document.createElement('span');
          taskTextNode.innerHTML = taskText;
          taskTextNode.style.flexGrow = "1";
          taskTextNode.style.fontWeight = "500";
          taskTextNode.style.color = "#333";
          taskItem.appendChild(taskTextNode);
        }
        
        // Create delete button with appropriate fallbacks
        let deleteBtn;
        try {
          deleteBtn = domConstruct.create("button", {
            innerHTML: "Delete",
            className: "dijitButton",
            style: {
              background: "#ff5252",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "14px",
              transition: "background 0.2s"
            }
          }, taskItem);
        } catch (e) {
          deleteBtn = document.createElement('button');
          deleteBtn.innerHTML = "Delete";
          deleteBtn.className = "dijitButton";
          deleteBtn.style.background = "#ff5252";
          deleteBtn.style.color = "white";
          deleteBtn.style.border = "none";
          deleteBtn.style.borderRadius = "4px";
          deleteBtn.style.padding = "6px 12px";
          deleteBtn.style.cursor = "pointer";
          deleteBtn.style.fontSize = "14px";
          deleteBtn.style.transition = "background 0.2s";
          taskItem.appendChild(deleteBtn);
        }
        
        // Add event listeners with appropriate fallbacks
        try {
          on(checkbox, "change", function() {
            if (this.checked) {
              domClass.add(taskTextNode, "completed-task");
              taskTextNode.style.textDecoration = "line-through";
              taskTextNode.style.fontWeight = "normal";
              taskTextNode.style.color = "#777";
              taskItem.style.opacity = "0.7";
            } else {
              domClass.remove(taskTextNode, "completed-task");
              taskTextNode.style.textDecoration = "none";
              taskTextNode.style.fontWeight = "500";
              taskTextNode.style.color = "#333";
              taskItem.style.opacity = "1";
            }
          });
        } catch (e) {
          checkbox.addEventListener("change", function() {
            if (this.checked) {
              taskTextNode.classList.add("completed-task");
              taskTextNode.style.textDecoration = "line-through";
              taskTextNode.style.fontWeight = "normal";
              taskTextNode.style.color = "#777";
              taskItem.style.opacity = "0.7";
            } else {
              taskTextNode.classList.remove("completed-task");
              taskTextNode.style.textDecoration = "none";
              taskTextNode.style.fontWeight = "500";
              taskTextNode.style.color = "#333";
              taskItem.style.opacity = "1";
            }
          });
        }
        
        try {
          on(deleteBtn, "click", function() {
            taskList.removeChild(taskItem);
            
            // Show empty state when all tasks are removed
            if (taskList.children.length === 0 && emptyState) {
              emptyState.style.display = "block";
            }
          });
        } catch (e) {
          deleteBtn.addEventListener("click", function() {
            taskList.removeChild(taskItem);
            
            // Show empty state when all tasks are removed
            if (taskList.children.length === 0 && emptyState) {
              emptyState.style.display = "block";
            }
          });
        }
        
        // Add hover effects
        try {
          on(deleteBtn, "mouseover", function() {
            this.style.background = "#ff1744";
          });
          
          on(deleteBtn, "mouseout", function() {
            this.style.background = "#ff5252";
          });
        } catch (e) {
          deleteBtn.addEventListener("mouseover", function() {
            this.style.background = "#ff1744";
          });
          
          deleteBtn.addEventListener("mouseout", function() {
            this.style.background = "#ff5252";
          });
        }
        
        // Clear input and focus
        input.value = "";
        input.focus();
      }
      
      // Connect events with appropriate fallbacks
      try {
        on(button, "click", addTask);
      } catch (e) {
        button.addEventListener("click", addTask);
      }
      
      try {
        on(input, "keypress", function(e) {
          if (e.key === "Enter" || e.keyCode === 13) {
            addTask();
          }
        });
      } catch (e) {
        input.addEventListener("keypress", function(e) {
          if (e.key === "Enter" || e.keyCode === 13) {
            addTask();
          }
        });
      }
      
      // Add CSS for completed tasks
      const style = document.createElement("style");
      style.textContent = ".completed-task { text-decoration: line-through; color: #888; }";
      document.head.appendChild(style);
      
      // Focus input
      input.focus();
      
      console.log("[dojo-app] Dojo UI setup complete (with fallbacks as needed)");
      resolve();
      
    } catch (error) {
      console.error('[dojo-app] Error in Dojo UI setup:', error);
      reject(error);
    }
  });
}

// Plain vanilla JS implementation as a fallback when Dojo is not available
function mountWithVanillaJS(domElement) {
  return new Promise((resolve) => {
    console.log('[dojo-app] Using vanilla JS implementation');
    
    // Get container element
    const container = document.getElementById('app') || domElement;
    
    if (!container) {
      console.error('[dojo-app] No container element found for vanilla JS implementation');
      resolve(); // Resolve anyway to not block application
      return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Add CSS to head
    const style = document.createElement('style');
    style.textContent = `
      .task-manager-vanilla {
        font-family: Arial, sans-serif;
        padding: 24px;
        max-width: 600px;
        margin: 0 auto;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      }
      .task-manager-vanilla h2 {
        color: #2c3e50;
        margin-top: 0;
        margin-bottom: 20px;
      }
      .task-form {
        display: flex;
        margin-bottom: 20px;
        gap: 10px;
      }
      .task-input {
        flex: 1;
        padding: 10px 12px;
        font-size: 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        outline: none;
      }
      .add-button {
        background: #4caf50;
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background 0.2s;
      }
      .add-button:hover {
        background: #3d8b40;
      }
      .task-list {
        list-style: none;
        padding: 0;
      }
      .task-item {
        display: flex;
        align-items: center;
        background: #f5f5f5;
        padding: 12px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        transition: all 0.2s ease;
      }
      .task-checkbox {
        margin-right: 12px;
      }
      .task-text {
        flex-grow: 1;
        font-weight: 500;
        color: #333;
      }
      .delete-button {
        background: #ff5252;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
      }
      .delete-button:hover {
        background: #ff1744;
      }
      .completed {
        text-decoration: line-through;
        color: #777;
        font-weight: normal;
      }
      .empty-state {
        text-align: center;
        padding: 20px;
        color: #777;
        background-color: #f9f9f9;
        border-radius: 4px;
        margin: 20px 0;
      }
      .task-item.completed {
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);
    
    // Create app structure
    const appDiv = document.createElement('div');
    appDiv.className = 'task-manager-vanilla';
    
    // Add header
    const header = document.createElement('h2');
    header.textContent = 'Tasks';
    appDiv.appendChild(header);
    
    // Create form
    const form = document.createElement('div');
    form.className = 'task-form';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-input';
    input.placeholder = 'What needs to be done?';
    form.appendChild(input);
    
    const addButton = document.createElement('button');
    addButton.className = 'add-button';
    addButton.textContent = 'Add';
    form.appendChild(addButton);
    
    appDiv.appendChild(form);
    
    // Create empty state
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    
    const emptyText = document.createElement('p');
    emptyText.textContent = 'No tasks added yet. Add your first task above!';
    emptyState.appendChild(emptyText);
    
    const emptyIcon = document.createElement('span');
    emptyIcon.textContent = '📝';
    emptyIcon.style.fontSize = '24px';
    emptyState.appendChild(emptyIcon);
    
    appDiv.appendChild(emptyState);
    
    // Create task list
    const taskList = document.createElement('ul');
    taskList.className = 'task-list';
    appDiv.appendChild(taskList);
    
    // Add to container
    container.appendChild(appDiv);
    
    // Add task function
    function addTask() {
      const taskText = input.value.trim();
      if (!taskText) return;
      
      // Hide empty state
      emptyState.style.display = 'none';
      
      // Create task item
      const taskItem = document.createElement('li');
      taskItem.className = 'task-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      taskItem.appendChild(checkbox);
      
      const textSpan = document.createElement('span');
      textSpan.className = 'task-text';
      textSpan.textContent = taskText;
      taskItem.appendChild(textSpan);
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-button';
      deleteButton.textContent = 'Delete';
      taskItem.appendChild(deleteButton);
      
      // Add event listeners
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          textSpan.classList.add('completed');
          taskItem.classList.add('completed');
        } else {
          textSpan.classList.remove('completed');
          taskItem.classList.remove('completed');
        }
      });
      
      deleteButton.addEventListener('click', function() {
        taskList.removeChild(taskItem);
        
        // Show empty state if no tasks
        if (taskList.children.length === 0) {
          emptyState.style.display = 'block';
        }
      });
      
      // Add to list
      taskList.appendChild(taskItem);
      
      // Clear input
      input.value = '';
      input.focus();
    }
    
    // Connect events
    addButton.addEventListener('click', addTask);
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' || e.keyCode === 13) {
        addTask();
      }
    });
    
    // Focus input
    input.focus();
    
    console.log('[dojo-app] Vanilla JS implementation mounted successfully');
    resolve();
  });
}

// Export the app for single-spa
export default { bootstrap, mount, unmount }; 