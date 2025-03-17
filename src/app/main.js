// Import single-spa properly
import * as singleSpa from 'single-spa';

// Immediately make single-spa available globally to ensure it's accessible
window.singleSpa = singleSpa;

// Log application initialization
console.log('[INIT] Application initialization started');
console.log('[INIT] Single-spa availability:', typeof singleSpa);

// Create a global reference to track registered apps
window.registeredApps = window.registeredApps || [];

// Explicitly expose single-spa navigation globally
if (!window.singleSpaNavigate) {
  window.singleSpaNavigate = (url) => {
    console.log('[SINGLE-SPA] Navigating to:', url);
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
}

// Define route activation functions here at the top for clarity
function isDojoRoute(location) {
  console.log('[ROUTE] Checking Dojo route:', location.hash);
  const result = location.hash.startsWith('#/dojo') || !location.hash || location.hash === '#/';
  console.log('[ROUTE] Dojo route match:', result);
  return result;
}

function isReactRoute(location) {
  console.log('[ROUTE] Checking React route:', location.hash);
  const result = location.hash.startsWith('#/react');
  console.log('[ROUTE] React route match:', result);
  return result;
}

function isHybridRoute(location) {
  console.log('[ROUTE] Checking Hybrid route:', location.hash);
  const result = location.hash.startsWith('#/hybrid');
  console.log('[ROUTE] Hybrid route match:', result);
  return result;
}

// Load Dojo through SystemJS
async function loadDojo() {
  try {
    console.log('[INIT] Loading Dojo through SystemJS');
    const dojo = await System.import('dojo');
    console.log('[INIT] Dojo loaded successfully through SystemJS');
    return dojo;
  } catch (error) {
    console.error('[INIT] Error loading Dojo through SystemJS:', error);
    console.log('[INIT] Falling back to global Dojo');
    return window.dojo;
  }
}

// Create a simple app object for each app type
const dojoApp = {
  bootstrap: async () => {
    console.log('[DOJO] Bootstrap started');
    try {
      // Ensure Dojo is loaded
      await loadDojo();
      console.log('[DOJO] Dojo loaded during bootstrap');
      return Promise.resolve();
    } catch (error) {
      console.error('[DOJO] Error during bootstrap:', error);
      return Promise.reject(error);
    }
  },
  
  mount: async (props) => {
    console.log('[DOJO] Mount started', props);
    
    try {
      // Mark that single-spa is handling navigation
      window.spaNavSuccessful = true;
      
      // Get container
      const container = document.getElementById('app');
      console.log('[DOJO] Container element:', container);
      
      if (!container) {
        throw new Error('Container element not found');
      }
      
      console.log('[DOJO] Rendering content to container');
      
      // Simple Dojo-style task manager with vanilla JS
      container.innerHTML = `
        <div class="dojo-task-manager">
          <h1>Dojo Task Manager</h1>
          <p>Simple Task Management App (mounted by single-spa)</p>
          <div style="margin: 20px 0;">
            <input type="text" id="task-input" placeholder="Enter a task" style="padding: 8px; width: 60%; margin-right: 10px;">
            <button id="add-button" style="padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">Add Task</button>
          </div>
          <ul id="task-list" style="list-style: none; padding: 0;"></ul>
        </div>
      `;
      
      console.log('[DOJO] Setting up event handlers');
      
      // Try using Dojo's parser if available
      try {
        const dojo = await loadDojo();
        if (dojo && dojo.parser) {
          console.log('[DOJO] Parsing content with Dojo parser');
          await new Promise(resolve => {
            window.dojoRequire(['dojo/parser', 'dojo/domReady!'], function(parser) {
              parser.parse(container).then(resolve);
            });
          });
          console.log('[DOJO] Dojo parser completed');
        }
      } catch (e) {
        console.warn('[DOJO] Could not use Dojo parser, falling back to direct DOM:', e);
      }
      
      // Set up event handlers
      const addButton = document.getElementById('add-button');
      const taskInput = document.getElementById('task-input');
      const taskList = document.getElementById('task-list');
      
      if (addButton && taskInput && taskList) {
        console.log('[DOJO] Found all UI elements, setting up listeners');
        
        // Add task function
        const addTask = () => {
          const text = taskInput.value.trim();
          if (!text) return;
          
          console.log('[DOJO] Adding task:', text);
          
          // Create task item
          const li = document.createElement('li');
          li.style.margin = '10px 0';
          li.style.padding = '10px';
          li.style.backgroundColor = '#f8f8f8';
          li.style.borderRadius = '4px';
          li.style.display = 'flex';
          li.style.alignItems = 'center';
          
          // Create checkbox
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.style.marginRight = '10px';
          
          // Create text
          const span = document.createElement('span');
          span.textContent = text;
          span.style.flexGrow = '1';
          
          // Create delete button
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Delete';
          deleteBtn.style.padding = '4px 8px';
          deleteBtn.style.backgroundColor = '#dc3545';
          deleteBtn.style.color = 'white';
          deleteBtn.style.border = 'none';
          deleteBtn.style.borderRadius = '4px';
          deleteBtn.style.cursor = 'pointer';
          
          // Add event listeners
          checkbox.addEventListener('change', function() {
            span.style.textDecoration = this.checked ? 'line-through' : 'none';
          });
          
          deleteBtn.addEventListener('click', function() {
            taskList.removeChild(li);
          });
          
          // Add elements to task item
          li.appendChild(checkbox);
          li.appendChild(span);
          li.appendChild(deleteBtn);
          
          // Add to list and clear input
          taskList.appendChild(li);
          taskInput.value = '';
          taskInput.focus();
        };
        
        // Add click handler
        addButton.addEventListener('click', addTask);
        
        // Add enter key handler
        taskInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            addTask();
          }
        });
        
        console.log('[DOJO] Event handlers set up successfully');
      } else {
        console.warn('[DOJO] Could not find all UI elements', { addButton, taskInput, taskList });
      }
      
      console.log('[DOJO] Mount completed successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('[DOJO] Error during mount:', error);
      return Promise.reject(error);
    }
  },
  
  unmount: async () => {
    console.log('[DOJO] Unmount started');
    
    try {
      // Clean up
      const container = document.getElementById('app');
      if (container) {
        container.innerHTML = '';
        console.log('[DOJO] Container cleared');
      }
      
      console.log('[DOJO] Unmount completed');
      return Promise.resolve();
    } catch (error) {
      console.error('[DOJO] Error during unmount:', error);
      return Promise.resolve();
    }
  }
};

// React app
const reactApp = {
  bootstrap: async () => {
    console.log('[REACT] Bootstrap started');
    return Promise.resolve();
  },
  
  mount: async () => {
    console.log('[REACT] Mount started');
    
    try {
      // Mark that single-spa is handling navigation
      window.spaNavSuccessful = true;
      
      // Get container
      const container = document.getElementById('app');
      console.log('[REACT] Container element:', container);
      
      if (!container) {
        throw new Error('Container element not found');
      }
      
      console.log('[REACT] Rendering content to container');
      
      // Simple React-style UI with vanilla JS
      container.innerHTML = `
        <div class="react-ui" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <h1>React Task Manager</h1>
          <p>Modern Task Management App (mounted by single-spa)</p>
          <div style="margin: 20px 0;">
            <div class="input-group" style="display: flex; margin-bottom: 16px;">
              <input type="text" id="react-task-input" placeholder="What needs to be done?" 
                style="padding: 12px; flex-grow: 1; border: 1px solid #e0e0e0; border-radius: 4px; margin-right: 8px; font-size: 16px;">
              <button id="react-add-button" 
                style="padding: 12px 24px; background: #61dafb; color: #282c34; border: none; border-radius: 4px; 
                cursor: pointer; font-weight: bold; font-size: 16px;">Add</button>
            </div>
            <div id="react-tasks" style="background: white; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="padding: 16px; text-align: center; color: #888;">
                Your tasks will appear here
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add event listener for the Add button
      const addButton = document.getElementById('react-add-button');
      const taskInput = document.getElementById('react-task-input');
      const tasksList = document.getElementById('react-tasks');
      
      if (addButton && taskInput && tasksList) {
        // Function to add a new task
        const addTask = () => {
          const taskText = taskInput.value.trim();
          if (taskText) {
            // Create a new task item
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.style.padding = '12px 16px';
            taskItem.style.borderBottom = '1px solid #f0f0f0';
            taskItem.style.display = 'flex';
            taskItem.style.alignItems = 'center';
            
            // Add checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.marginRight = '12px';
            
            // Add task text
            const text = document.createElement('span');
            text.textContent = taskText;
            text.style.flexGrow = '1';
            
            // Add delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.style.background = 'none';
            deleteBtn.style.border = 'none';
            deleteBtn.style.fontSize = '20px';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.color = '#999';
            
            // Add event listeners
            checkbox.addEventListener('change', function() {
              if (this.checked) {
                text.style.textDecoration = 'line-through';
                text.style.color = '#888';
              } else {
                text.style.textDecoration = 'none';
                text.style.color = '';
              }
            });
            
            deleteBtn.addEventListener('click', function() {
              taskItem.remove();
              // If no tasks left, show placeholder
              if (tasksList.children.length === 0) {
                tasksList.innerHTML = `
                  <div style="padding: 16px; text-align: center; color: #888;">
                    Your tasks will appear here
                  </div>
                `;
              }
            });
            
            // Assemble and append the task item
            taskItem.appendChild(checkbox);
            taskItem.appendChild(text);
            taskItem.appendChild(deleteBtn);
            
            // Clear existing placeholder if present
            if (tasksList.children.length === 1 && 
                tasksList.children[0].textContent.includes('Your tasks will appear here')) {
              tasksList.innerHTML = '';
            }
            
            tasksList.appendChild(taskItem);
            taskInput.value = '';
          }
        };
        
        // Add the task when clicking the Add button
        addButton.addEventListener('click', addTask);
        
        // Also add the task when pressing Enter in the input field
        taskInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            addTask();
          }
        });
      }
      
      console.log('[REACT] React app mounted successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('[REACT] Error during mount:', error);
      return Promise.reject(error);
    }
  },
  
  unmount: async () => {
    console.log('[REACT] Unmount started');
    
    try {
      // Clear the container
      const container = document.getElementById('app');
      if (container) {
        container.innerHTML = '';
      }
      
      console.log('[REACT] React app unmounted successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('[REACT] Error during unmount:', error);
      return Promise.reject(error);
    }
  }
};

// Hybrid app
const hybridApp = {
  bootstrap: async () => {
    console.log('[HYBRID] Bootstrap started');
    await loadDojo();
    console.log('[HYBRID] Dojo loaded for hybrid app');
    return Promise.resolve();
  },
  
  mount: async () => {
    console.log('[HYBRID] Mount started');
    
    try {
      // Mark that single-spa is handling navigation
      window.spaNavSuccessful = true;
      
      // Get container
      const container = document.getElementById('app');
      console.log('[HYBRID] Container element:', container);
      
      if (!container) {
        throw new Error('Container element not found');
      }
      
      console.log('[HYBRID] Rendering content to container');
      
      // Hybrid UI combining Dojo and React styles
      container.innerHTML = `
        <div class="hybrid-app">
          <h1>Hybrid Application</h1>
          <p>Combining Dojo and React components (mounted by single-spa)</p>
          
          <div class="app-container" style="display: flex; margin-top: 20px;">
            <div class="dojo-section" style="flex: 1; padding: 20px; background: #f5f5f5; border-radius: 4px; margin-right: 10px;">
              <h2>Dojo Components</h2>
              <div id="dojo-container">
                <div style="padding: 15px; background: white; border-radius: 4px;">
                  <p>Dojo checkbox component will be loaded here</p>
                  <div id="dojo-checkbox"></div>
                </div>
              </div>
            </div>
            
            <div class="react-section" style="flex: 1; padding: 20px; background: #f0f7fa; border-radius: 4px;">
              <h2>React Style</h2>
              <div id="react-container">
                <div style="padding: 15px; background: white; border-radius: 4px;">
                  <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="react-checkbox" style="margin-right: 10px;">
                    <span>React-style checkbox</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 20px; background: #eeeeff; border-radius: 4px;">
            <h2>Integration Area</h2>
            <p>This area demonstrates communication between Dojo and React components.</p>
            <div class="status-area" style="margin-top: 15px; padding: 10px; background: white; border-radius: 4px;">
              <p>Status: <span id="component-status">No interaction yet</span></p>
            </div>
          </div>
        </div>
      `;
      
      // Add a event listener for the React checkbox
      const reactCheckbox = document.getElementById('react-checkbox');
      const statusArea = document.getElementById('component-status');
      
      if (reactCheckbox && statusArea) {
        reactCheckbox.addEventListener('change', function() {
          statusArea.textContent = this.checked ? 
            'React checkbox checked!' : 
            'React checkbox unchecked!';
        });
      }
      
      // Try to load a Dojo checkbox if Dojo is available
      try {
        if (window.dojoRequire) {
          window.dojoRequire(['dijit/form/CheckBox'], function(CheckBox) {
            const dojoCheckboxContainer = document.getElementById('dojo-checkbox');
            if (dojoCheckboxContainer) {
              // Create a Dojo checkbox
              const checkbox = new CheckBox({
                id: 'dojoCheck',
                checked: false,
                onChange: function(checked) {
                  if (statusArea) {
                    statusArea.textContent = checked ? 
                      'Dojo checkbox checked!' : 
                      'Dojo checkbox unchecked!';
                  }
                }
              });
              
              // Add a label
              const label = document.createElement('label');
              label.setAttribute('for', 'dojoCheck');
              label.style.marginLeft = '10px';
              label.textContent = 'Dojo checkbox';
              
              // Place the checkbox in the container
              checkbox.placeAt(dojoCheckboxContainer);
              checkbox.startup();
              
              // Add the label after the checkbox
              dojoCheckboxContainer.appendChild(label);
              
              console.log('[HYBRID] Dojo checkbox created successfully');
            }
          });
        } else {
          console.warn('[HYBRID] dojoRequire not available, skipping Dojo checkbox creation');
          document.getElementById('dojo-checkbox').innerHTML = '<p>Dojo not available</p>';
        }
      } catch (error) {
        console.error('[HYBRID] Error creating Dojo checkbox:', error);
        document.getElementById('dojo-checkbox').innerHTML = '<p>Error loading Dojo components</p>';
      }
      
      console.log('[HYBRID] Hybrid app mounted successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('[HYBRID] Error during mount:', error);
      return Promise.reject(error);
    }
  },
  
  unmount: async () => {
    console.log('[HYBRID] Unmount started');
    
    try {
      // Clean up Dojo widgets if any were created
      try {
        if (window.dijit && window.dijit.registry) {
          const dojoCheckbox = window.dijit.byId('dojoCheck');
          if (dojoCheckbox) {
            dojoCheckbox.destroy();
            console.log('[HYBRID] Dojo checkbox destroyed');
          }
        }
      } catch (error) {
        console.error('[HYBRID] Error destroying Dojo widgets:', error);
      }
      
      // Clear the container
      const container = document.getElementById('app');
      if (container) {
        container.innerHTML = '';
      }
      
      console.log('[HYBRID] Hybrid app unmounted successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('[HYBRID] Error during unmount:', error);
      return Promise.reject(error);
    }
  }
};

// IMPORTANT: Register the applications immediately after they are defined
// This ensures they are registered before any other code might access them
console.log('[INIT] Registering applications with single-spa');

try {
  // Register Dojo app
  singleSpa.registerApplication({
    name: 'dojo-app',
    app: dojoApp,
    activeWhen: isDojoRoute
  });
  console.log('[INIT] Dojo app registered successfully');
  window.registeredApps.push({ name: 'dojo-app', app: dojoApp, activeWhen: isDojoRoute });

  // Register React app
  singleSpa.registerApplication({
    name: 'react-app',
    app: reactApp,
    activeWhen: isReactRoute
  });
  console.log('[INIT] React app registered successfully');
  window.registeredApps.push({ name: 'react-app', app: reactApp, activeWhen: isReactRoute });

  // Register Hybrid app
  singleSpa.registerApplication({
    name: 'hybrid-app',
    app: hybridApp,
    activeWhen: isHybridRoute
  });
  console.log('[INIT] Hybrid app registered successfully');
  window.registeredApps.push({ name: 'hybrid-app', app: hybridApp, activeWhen: isHybridRoute });

  // Log registration status
  const registeredAppNames = singleSpa.getAppNames();
  console.log('[INIT] Registered apps:', registeredAppNames);
  
  // Start single-spa immediately to ensure it's running
  console.log('[INIT] Starting single-spa');
  singleSpa.start({
    urlRerouteOnly: true
  });
  console.log('[INIT] single-spa started successfully');
  
  // Set a global flag to indicate single-spa is ready
  window.singleSpaInitialized = true;
} catch (error) {
  console.error('[INIT] Error during single-spa initialization:', error);
  window.singleSpaInitialized = false;
}

// Now expose all the app objects globally AFTER registration
// Expose app objects globally for direct access
window.dojoApp = dojoApp;
window.reactApp = reactApp;
window.hybridApp = hybridApp;

// Define mount functions
const mountDojoApp = async function() {
  console.log('[GLOBAL] Manual mounting of Dojo App');
  try {
    await dojoApp.bootstrap();
    return dojoApp.mount();
  } catch (e) {
    console.error('[GLOBAL] Error mounting Dojo App:', e);
    throw e;
  }
};

const unmountDojoApp = async function() {
  console.log('[GLOBAL] Manual unmounting of Dojo App');
  try {
    return dojoApp.unmount();
  } catch (e) {
    console.error('[GLOBAL] Error unmounting Dojo App:', e);
    throw e;
  }
};

const mountReactApp = async function() {
  console.log('[GLOBAL] Manual mounting of React App');
  try {
    await reactApp.bootstrap();
    return reactApp.mount();
  } catch (e) {
    console.error('[GLOBAL] Error mounting React App:', e);
    throw e;
  }
};

const unmountReactApp = async function() {
  console.log('[GLOBAL] Manual unmounting of React App');
  try {
    return reactApp.unmount();
  } catch (e) {
    console.error('[GLOBAL] Error unmounting React App:', e);
    throw e;
  }
};

const mountHybridApp = async function() {
  console.log('[GLOBAL] Manual mounting of Hybrid App');
  try {
    await hybridApp.bootstrap();
    return hybridApp.mount();
  } catch (e) {
    console.error('[GLOBAL] Error mounting Hybrid App:', e);
    throw e;
  }
};

const unmountHybridApp = async function() {
  console.log('[GLOBAL] Manual unmounting of Hybrid App');
  try {
    return hybridApp.unmount();
  } catch (e) {
    console.error('[GLOBAL] Error unmounting Hybrid App:', e);
    throw e;
  }
};

// Expose mount functions globally
window.mountDojoApp = mountDojoApp;
window.unmountDojoApp = unmountDojoApp;
window.mountReactApp = mountReactApp;
window.unmountReactApp = unmountReactApp;
window.mountHybridApp = mountHybridApp;
window.unmountHybridApp = unmountHybridApp;

// Store all the apps in a single object for easy access
window.__spaApps = {
  dojoApp,
  reactApp,
  hybridApp,
  mountDojoApp,
  unmountDojoApp,
  mountReactApp,
  unmountReactApp,
  mountHybridApp,
  unmountHybridApp
};

// Log that global app objects are registered
console.log('[INIT] Global app objects registered', {
  dojoApp: !!window.dojoApp,
  reactApp: !!window.reactApp,
  hybridApp: !!window.hybridApp,
  mountFunctions: {
    mountDojoApp: !!window.mountDojoApp,
    mountReactApp: !!window.mountReactApp,
    mountHybridApp: !!window.mountHybridApp
  },
  __spaApps: !!window.__spaApps
});

// Export for module systems using ES modules style
export {
  dojoApp,
  reactApp,
  hybridApp,
  mountDojoApp,
  unmountDojoApp,
  mountReactApp,
  unmountReactApp,
  mountHybridApp,
  unmountHybridApp
};

// Add more detailed routing event listeners
window.addEventListener('single-spa:app-change', (evt) => {
  console.log('[SINGLE-SPA] App change event:', {
    detail: evt.detail,
    newAppStatus: evt.detail.newAppStatus,
    appName: evt.detail.appName,
    timestamp: new Date().toISOString()
  });
});

window.addEventListener('single-spa:routing-event', (evt) => {
  console.log('[SINGLE-SPA] Routing event triggered', {
    currentUrl: window.location.href,
    timestamp: new Date().toISOString()
  });
});

window.addEventListener('single-spa:before-routing-event', (evt) => {
  console.log('[SINGLE-SPA] Before routing event triggered', {
    currentUrl: window.location.href,
    timestamp: new Date().toISOString()
  });
});

window.addEventListener('single-spa:before-mount-routing-event', (evt) => {
  console.log('[SINGLE-SPA] Before mount routing event triggered', {
    currentUrl: window.location.href,
    timestamp: new Date().toISOString()
  });
});

// Set default route if needed
if (!window.location.hash) {
  console.log('[INIT] Setting default route to #/dojo');
  window.location.hash = '#/dojo';
}

// Force initial routing after a short delay
setTimeout(() => {
  console.log('[INIT] Forcing initial routing for URL:', window.location.href);
  window.dispatchEvent(new PopStateEvent('popstate'));
}, 200);

// Add event listeners to nav links to help with debugging
document.addEventListener('DOMContentLoaded', () => {
  console.log('[INIT] DOM fully loaded, setting up navigation events');
  
  // Set up SPA status panel with current values
  if (typeof updateSpaStatusPanel === 'function') {
    updateSpaStatusPanel();
  }
  
  // Set up event listeners for debug buttons
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = e.target.getAttribute('href');
      console.log(`[NAV] Navigation to ${e.target.textContent} (${href})`);
      if (window.singleSpaNavigate) {
        console.log('[NAV] Using singleSpaNavigate for routing');
        window.singleSpaNavigate(href);
      } else {
        console.log('[NAV] singleSpaNavigate not found, falling back to direct navigation');
        window.location.href = href;
      }
    });
  });
});

// Function to update the SPA status panel
function updateSpaStatusPanel() {
  const initializedEl = document.getElementById('spa-initialized');
  const activeAppEl = document.getElementById('spa-active-app');
  const registeredAppsEl = document.getElementById('spa-registered-apps');
  const currentUrlEl = document.getElementById('spa-current-url');
  
  if (!initializedEl || !activeAppEl || !registeredAppsEl || !currentUrlEl) {
    console.warn('[STATUS] SPA status panel elements not found');
    return;
  }
  
  // Update status values
  initializedEl.textContent = window.singleSpaInitialized ? 'Yes' : 'No';
  currentUrlEl.textContent = window.location.href;
  
  // Get registered apps
  if (window.singleSpa && window.singleSpa.getAppNames) {
    const appNames = window.singleSpa.getAppNames();
    registeredAppsEl.textContent = appNames.length > 0 ? appNames.join(', ') : 'None';
    
    // Get active app
    const activeApps = appNames.filter(name => {
      try {
        const status = window.singleSpa.getAppStatus(name);
        return status === 'MOUNTED';
      } catch (e) {
        return false;
      }
    });
    
    if (activeApps.length > 0) {
      activeAppEl.textContent = activeApps.join(', ');
    } else {
      activeAppEl.textContent = 'None';
    }
  } else {
    registeredAppsEl.textContent = 'API not available';
    activeAppEl.textContent = 'API not available';
  }
}

// Check if the app is mounted after a delay
setTimeout(() => {
  console.log('[INIT] Checking if app is mounted');
  const container = document.getElementById('app');
  if (container) {
    console.log('[INIT] Container content:', container.innerHTML.substring(0, 100) + '...');
    
    // Update status panel
    updateSpaStatusPanel();
    
    if (container.innerHTML.includes('Loading Application')) {
      console.log('[INIT] App still showing loading, forcing Dojo app mount');
      dojoApp.bootstrap().then(() => dojoApp.mount()).then(() => {
        console.log('[INIT] Force mount completed');
      }).catch(error => {
        console.error('[INIT] Force mount failed:', error);
      });
    } else {
      console.log('[INIT] App already mounted');
    }
  } else {
    console.log('[INIT] Container not found during check');
  }
}, 2000); 