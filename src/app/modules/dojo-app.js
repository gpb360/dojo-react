// Dojo-based Task Manager implementation

// Log when the module is loaded
console.log('[dojo-app] Module loaded and initialized');

// Debug function to check Dojo presence and configuration
function debugDojoStatus() {
  console.log('[dojo-app] Dojo availability status:');
  console.log('  - window.dojo:', typeof window.dojo, window.dojo ? 'Available' : 'Not available');
  console.log('  - window.dijit:', typeof window.dijit, window.dijit ? 'Available' : 'Not available');
  console.log('  - window.dojoConfig:', typeof window.dojoConfig, window.dojoConfig ? 'Configured' : 'Not configured');
  
  if (window.dojo) {
    console.log('  - Dojo version:', window.dojo.version ? window.dojo.version.toString() : 'Unknown');
    console.log('  - Dojo base path:', window.dojo.baseUrl || 'Unknown');
    console.log('  - Dojo ready state:', window.dojo.ready ? 'Has ready function' : 'No ready function');
    console.log('  - Dojo require function:', typeof window.dojo.require);
    console.log('  - Available packages:');
    if (window.dojo.config && window.dojo.config.packages) {
      window.dojo.config.packages.forEach(pkg => console.log(`    - ${pkg.name}: ${pkg.location}`));
    } else {
      console.log('    No package information available');
    }
  }
  
  // Check if AMD loader is available
  console.log('  - AMD require:', typeof window.require);
  if (window.require && window.require.toUrl) {
    console.log('  - AMD detected, baseUrl:', window.require.toUrl('./'));
  }
}

// Bootstrap phase - just initialize resources
export async function bootstrap() {
  console.log('[dojo-app] Bootstrap started');
  debugDojoStatus();
  return Promise.resolve();
}

// Mount phase - render the app to the DOM
export async function mount(props) {
  console.log('[dojo-app] Mount started', props);
  debugDojoStatus();
  
  // Add a timeout to ensure the mount function doesn't hang
  return new Promise((resolve, reject) => {
    // Create a timeout that will reject the promise after 2.5 seconds
    const timeoutId = setTimeout(() => {
      console.error('[dojo-app] Mount timed out after 2.5 seconds');
      reject(new Error('Mount timed out after 2.5 seconds'));
    }, 2500);
    
    // The actual mount implementation
    const mountPromise = performMount(props);
    
    // Handle the mount promise
    mountPromise.then(
      // Success case
      () => {
        clearTimeout(timeoutId);
        console.log('[dojo-app] Mount resolved successfully');
        resolve();
      },
      // Error case
      (error) => {
        clearTimeout(timeoutId);
        console.error('[dojo-app] Mount rejected with error:', error);
        reject(error);
      }
    );
  });
}

// Separate function to perform the actual mounting
async function performMount(props) {
  try {
    // Check for Dojo availability
    console.log('[dojo-app] Checking Dojo availability:', {
      dojo: typeof window.dojo,
      dojoRequire: typeof window.dojoRequire,
      require: typeof window.require
    });
    
    // Try a direct approach first - if Dojo is loaded globally
    if (window.dojo) {
      console.log('[dojo-app] Dojo is available globally, using direct approach');
      try {
        return mountWithGlobalDojo();
      } catch (error) {
        console.error('[dojo-app] Error with global Dojo approach:', error);
        // Continue to other approaches
      }
    }
    
    const reqFunc = window.dojoRequire || window.require;
    if (!reqFunc) {
      console.warn("[dojo-app] Neither dojoRequire nor require is available");
      return mountWithVanillaJS();
    }
    
    // Create a promise for the module loading
    return new Promise((resolve, reject) => {
      // Add a timeout for module loading - increased to 10 seconds
      const loadTimeoutId = setTimeout(() => {
        console.error('[dojo-app] Dojo modules loading timed out');
        // Fall back to vanilla JS instead of rejecting
        console.log('[dojo-app] Falling back to vanilla JS due to timeout');
        clearTimeout(loadTimeoutId); // Clear timeout to be safe
        mountWithVanillaJS().then(resolve, reject);
      }, 10000); // Increased from 2 seconds to 10 seconds
      
      // First, try loading just dojo/dom to see if basic modules work
      console.log('[dojo-app] Attempting to load single basic module: dojo/dom');
      reqFunc(["dojo/dom", "dojo/domReady!"], function(dom) {
        console.log('[dojo-app] Successfully loaded dojo/dom', dom ? 'Available' : 'Unavailable');
        
        // If we get here, we can at least load one module
        clearTimeout(loadTimeoutId);
        
        // Try the rest of the mounting process
        continueWithDojoLoading(reqFunc, resolve, reject);
      }, function(error) {
        console.error('[dojo-app] Error loading basic dojo/dom module:', error);
        clearTimeout(loadTimeoutId);
        
        // Try direct AMD approach as fallback
        console.log('[dojo-app] Trying direct AMD approach');
        if (window.require && typeof window.require === 'function') {
          try {
            window.require(["dojo/dom"], function(dom) {
              console.log('[dojo-app] Direct AMD succeeded to load dojo/dom');
              continueWithDojoLoading(window.require, resolve, reject);
            }, function(err) {
              console.error('[dojo-app] Direct AMD failed:', err);
              mountWithVanillaJS().then(resolve, reject);
            });
          } catch (e) {
            console.error('[dojo-app] Exception in direct AMD approach:', e);
            mountWithVanillaJS().then(resolve, reject);
          }
        } else {
          mountWithVanillaJS().then(resolve, reject);
        }
      });
    });
  } catch (error) {
    console.error('[dojo-app] Mount error:', error);
    return mountWithVanillaJS();
  }
}

// Function to mount using global dojo instance directly
function mountWithGlobalDojo() {
  return new Promise((resolve, reject) => {
    console.log('[dojo-app] Using global Dojo instance');
    
    // Make sure document is ready first
    if (window.dojo.ready) {
      window.dojo.ready(function() {
        setupSimpleDojo().then(resolve, reject);
      });
    } else {
      // No dojo.ready function, try direct setup
      setupSimpleDojo().then(resolve, reject);
    }
  });
}

// Function to set up a simple Dojo app without complex modules
function setupSimpleDojo() {
  return new Promise((resolve, reject) => {
    try {
      const container = document.getElementById('app');
      if (!container) {
        console.error('[dojo-app] Container not found');
        return reject(new Error('Container not found'));
      }
      
      console.log('[dojo-app] Setting up minimal Dojo implementation');
      
      // Create a basic HTML structure
      container.innerHTML = `
        <div class="dojo-task-manager">
          <h1>Dojo Task Manager</h1>
          <p>Task Manager (Basic Dojo)</p>
          
          <div style="margin-bottom: 20px; display: flex; align-items: center;">
            <input id="taskInput" 
                  type="text" 
                  style="width: 250px; margin-right: 10px; padding: 8px;">
            <button id="addTaskButton" 
                  style="padding: 8px 12px; background: #0066cc; color: white; border: none; cursor: pointer;">
              Add Task
            </button>
          </div>
          
          <ul id="task-list" style="list-style: none; padding: 0;"></ul>
        </div>
      `;
      
      // Use basic Dojo functionality
      const dojo = window.dojo;
      
      // Basic setup with dojo methods if available, fallback to DOM if not
      const byId = dojo.byId || document.getElementById.bind(document);
      const create = dojo.create || function(tag, attrs, refNode) {
        const elem = document.createElement(tag);
        for (const key in attrs) {
          if (key === 'style' && typeof attrs[key] === 'object') {
            Object.assign(elem.style, attrs[key]);
          } else {
            elem[key] = attrs[key];
          }
        }
        if (refNode) refNode.appendChild(elem);
        return elem;
      };
      const connect = dojo.connect || function(obj, event, fn) {
        obj.addEventListener(event, fn);
        return { remove: function() { obj.removeEventListener(event, fn); } };
      };
      
      const taskInput = byId('taskInput');
      const addTaskButton = byId('addTaskButton');
      const taskList = byId('task-list');
      
      if (!taskInput || !addTaskButton || !taskList) {
        console.error('[dojo-app] Could not find required elements');
        return reject(new Error('Required elements not found'));
      }
      
      // Set up add task functionality
      function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) return;
        
        // Create the task item using dojo if available
        const taskItem = create("li", {
          style: {
            display: 'flex',
            alignItems: 'center',
            margin: '10px 0',
            padding: '10px',
            background: '#f8f8f8',
            borderRadius: '4px'
          }
        }, taskList);
        
        // Create checkbox
        const checkbox = create("input", {
          type: "checkbox",
          style: { margin: '0 10px 0 0' }
        }, taskItem);
        
        // Create text span
        const taskTextSpan = create("span", {
          innerHTML: taskText,
          style: {
            flexGrow: '1'
          }
        }, taskItem);
        
        // Create delete button
        const deleteBtn = create("button", {
          innerHTML: "Delete",
          style: {
            padding: '5px 10px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        }, taskItem);
        
        // Add event listeners
        const checkboxHandle = connect(checkbox, "change", function() {
          taskTextSpan.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
        });
        
        const deleteBtnHandle = connect(deleteBtn, "click", function() {
          // Remove event listeners if dojo.disconnect is available
          if (dojo.disconnect) {
            dojo.disconnect(checkboxHandle);
            dojo.disconnect(deleteBtnHandle);
          }
          
          // Remove the task item
          taskList.removeChild(taskItem);
        });
        
        // Clear and focus the input
        taskInput.value = '';
        taskInput.focus();
      }
      
      // Connect events
      connect(addTaskButton, "click", addTask);
      
      connect(taskInput, "keypress", function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
          e.preventDefault();
          addTask();
        }
      });
      
      console.log('[dojo-app] Basic Dojo setup complete');
      resolve();
      
    } catch (error) {
      console.error('[dojo-app] Error setting up simple Dojo:', error);
      reject(error);
    }
  });
}

// Continue with the regular Dojo loading approach
function continueWithDojoLoading(reqFunc, resolve, reject) {
  console.log('[dojo-app] Continuing with Dojo loading process');
  
  // First check if Dojo has already loaded the parser
  if (window.dojo && window.dojo.parser) {
    console.log('[dojo-app] Using already loaded Dojo parser');
    try {
      mountWithDojo(window.dojo.dom || window.dojo, 
                    window.dojo.dom && window.dojo.dom.construct || window.dojo, 
                    window.dojo.dom && window.dojo.dom.class || window.dojo, 
                    window.dojo.on || window.dojo, 
                    window.dojo.parser)
        .then(resolve, reject);
    } catch (error) {
      console.error('[dojo-app] Error using pre-loaded Dojo:', error);
      mountWithVanillaJS().then(resolve, reject);
    }
    return;
  }
  
  // First load only the minimal set needed
  console.log('[dojo-app] Loading core Dojo modules');
  reqFunc([
    "dojo/parser",
    "dojo/dom",
    "dojo/domReady!"
  ], function(parser, dom) {
    console.log('[dojo-app] Core Dojo modules loaded successfully');
    
    // Now load the remaining modules with a separate timeout
    const secondaryLoadTimeoutId = setTimeout(() => {
      console.warn('[dojo-app] Secondary module loading timed out, proceeding with basic functionality');
      // Continue with what we have instead of timing out
      mountWithDojo(dom, dom, dom, {on: function(){}}, parser).then(resolve, reject);
    }, 5000);
    
    reqFunc([
      "dojo/dom-construct",
      "dojo/dom-class",
      "dojo/on",
      "dijit/form/Form",
      "dijit/form/Button",
      "dijit/form/TextBox",
      "dijit/form/CheckBox"
    ], function(domConstruct, domClass, on) {
      clearTimeout(secondaryLoadTimeoutId);
      console.log('[dojo-app] All Dojo modules loaded successfully');
      
      mountWithDojo(dom, domConstruct, domClass, on, parser)
        .then(resolve, reject);
    }, function(error) {
      clearTimeout(secondaryLoadTimeoutId);
      console.warn('[dojo-app] Error loading secondary modules:', error);
      // Try to continue with the basic modules we already have
      mountWithDojo(dom, dom, dom, {on: function(){}}, parser).then(resolve, reject);
    });
  }, function(error) {
    console.error('[dojo-app] Error loading core Dojo modules:', error);
    // Fall back to vanilla JS
    mountWithVanillaJS().then(resolve, reject);
  });
}

// Function to mount the app using Dojo
function mountWithDojo(dom, domConstruct, domClass, on, parser) {
  return new Promise((resolve, reject) => {
    try {
      console.log('[dojo-app] Starting Dojo mount process');
      
      // Get the app container
      const container = dom.byId ? dom.byId('app') : document.getElementById('app');
      if (!container) {
        console.error('[dojo-app] Container not found');
        reject(new Error('Container not found'));
        return;
      }
      
      console.log('[dojo-app] Found container, rendering content with Dojo');
      
      // Create the HTML structure for the Dojo form
      container.innerHTML = `
        <div class="dojo-task-manager">
          <h1>Dojo Task Manager</h1>
          <p>Task Manager (Using Dojo)</p>
          
          <form id="taskForm" data-dojo-type="dijit/form/Form">
            <div style="margin-bottom: 20px; display: flex; align-items: center;">
              <input id="taskInput" 
                     type="text" 
                     name="taskInput" 
                     data-dojo-type="dijit/form/TextBox" 
                     data-dojo-props="placeHolder:'Enter a task', intermediateChanges:true"
                     style="width: 250px; margin-right: 10px;">
                     
              <button id="addTaskButton" 
                      type="button" 
                      name="addTaskButton" 
                      data-dojo-type="dijit/form/Button">
                Add Task
              </button>
            </div>
          </form>
          
          <ul id="task-list" style="list-style: none; padding: 0;"></ul>
        </div>
      `;
      
      // Parse the DOM to create all Dojo widgets
      try {
        console.log('[dojo-app] Parsing page with Dojo parser');
        
        // Add a timeout for parsing - increased to 5 seconds
        const parseTimeoutId = setTimeout(() => {
          console.error('[dojo-app] Parser timed out');
          clearTimeout(parseTimeoutId);
          // Try to continue anyway with manual setup
          try {
            setupWithoutParsing(dom, domConstruct, domClass, on);
            resolve();
          } catch (setupError) {
            mountWithVanillaJS().then(resolve, reject);
          }
        }, 5000); // Increased from 1.5 seconds to 5 seconds
        
        // Check if parser has a promise-based API
        if (parser.parse && typeof parser.parse === 'function') {
          // Determine if parser returns a promise
          const parseResult = parser.parse(container);
          if (parseResult && typeof parseResult.then === 'function') {
            // Use the parser promise
            parseResult.then(
              function() {
                // Clear the timeout once parsing is done
                clearTimeout(parseTimeoutId);
                
                console.log('[dojo-app] Page parsed successfully');
                
                try {
                  // Set up the event handlers
                  setupTaskManager(dom, domConstruct, domClass, on);
                  
                  console.log('[dojo-app] Event handlers set up');
                  console.log('[dojo-app] Mount completed successfully');
                  resolve();
                } catch (setupError) {
                  console.error('[dojo-app] Error setting up task manager:', setupError);
                  // Fall back to vanilla JS
                  mountWithVanillaJS().then(resolve, reject);
                }
              }, 
              function(error) {
                // Clear the timeout if parsing fails
                clearTimeout(parseTimeoutId);
                
                console.error('[dojo-app] Error parsing page:', error);
                // Fall back to vanilla JS
                mountWithVanillaJS().then(resolve, reject);
              }
            );
          } else {
            // Traditional synchronous parser
            clearTimeout(parseTimeoutId);
            console.log('[dojo-app] Using synchronous parser');
            
            try {
              setupTaskManager(dom, domConstruct, domClass, on);
              console.log('[dojo-app] Event handlers set up');
              console.log('[dojo-app] Mount completed successfully');
              resolve();
            } catch (setupError) {
              console.error('[dojo-app] Error setting up task manager:', setupError);
              // Fall back to vanilla JS
              mountWithVanillaJS().then(resolve, reject);
            }
          }
        } else {
          // No parser available
          clearTimeout(parseTimeoutId);
          console.warn('[dojo-app] No parser available, setting up without parsing');
          setupWithoutParsing(dom, domConstruct, domClass, on);
          resolve();
        }
      } catch (parserError) {
        console.error('[dojo-app] Error setting up Dojo parsing:', parserError);
        // Fall back to vanilla JS
        mountWithVanillaJS().then(resolve, reject);
      }
    } catch (setupError) {
      console.error('[dojo-app] Error in Dojo setup:', setupError);
      // Fall back to vanilla JS
      mountWithVanillaJS().then(resolve, reject);
    }
  });
}

// Function to set up the task manager without relying on the parser
function setupWithoutParsing(dom, domConstruct, domClass, on) {
  console.log('[dojo-app] Setting up without Dojo parser');
  
  // Get the container
  const container = dom.byId ? dom.byId('app') : document.getElementById('app');
  const taskList = dom.byId ? dom.byId('task-list') : document.getElementById('task-list');
  
  if (!container || !taskList) {
    throw new Error('Container or task list not found');
  }
  
  // Set up a simple form without relying on Dojo widgets
  const form = container.querySelector('form') || document.createElement('form');
  form.id = 'taskForm';
  
  // Create the input field
  const inputDiv = container.querySelector('input') || document.createElement('input');
  inputDiv.id = 'taskInput';
  inputDiv.type = 'text';
  inputDiv.placeholder = 'Enter a task';
  inputDiv.style.width = '250px';
  inputDiv.style.marginRight = '10px';
  inputDiv.style.padding = '8px';
  
  // Create the button
  const button = container.querySelector('button') || document.createElement('button');
  button.id = 'addTaskButton';
  button.textContent = 'Add Task';
  button.style.padding = '8px 12px';
  button.style.background = '#0066cc';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  
  // Make sure the elements are in the DOM
  if (!container.contains(form)) {
    container.appendChild(form);
  }
  
  if (!form.contains(inputDiv)) {
    form.appendChild(inputDiv);
  }
  
  if (!form.contains(button)) {
    form.appendChild(button);
  }
  
  // Add event listeners
  function addTask() {
    const taskText = inputDiv.value.trim();
    if (!taskText) return;
    
    // Create task item
    const taskItem = document.createElement('li');
    taskItem.style.display = 'flex';
    taskItem.style.alignItems = 'center';
    taskItem.style.margin = '10px 0';
    taskItem.style.padding = '10px';
    taskItem.style.background = '#f8f8f8';
    taskItem.style.borderRadius = '4px';
    
    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style.margin = '0 10px 0 0';
    
    // Create text span
    const taskTextSpan = document.createElement('span');
    taskTextSpan.style.flexGrow = '1';
    taskTextSpan.textContent = taskText;
    
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.padding = '5px 10px';
    deleteBtn.style.background = '#dc3545';
    deleteBtn.style.color = 'white';
    deleteBtn.style.border = 'none';
    deleteBtn.style.borderRadius = '4px';
    deleteBtn.style.cursor = 'pointer';
    
    // Add event listeners
    checkbox.addEventListener('change', function() {
      taskTextSpan.style.textDecoration = this.checked ? 'line-through' : 'none';
    });
    
    deleteBtn.addEventListener('click', function() {
      taskList.removeChild(taskItem);
    });
    
    // Add elements to task item
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskTextSpan);
    taskItem.appendChild(deleteBtn);
    
    // Add task to list
    taskList.appendChild(taskItem);
    
    // Clear and focus the input
    inputDiv.value = '';
    inputDiv.focus();
  }
  
  // Add click event to button
  button.addEventListener('click', addTask);
  
  // Add Enter key support on the input
  inputDiv.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      addTask();
    }
  });
  
  // Add some CSS for completed tasks
  const style = document.createElement('style');
  style.textContent = '.completed-task { text-decoration: line-through; color: #888; }';
  document.head.appendChild(style);
  
  console.log('[dojo-app] Basic setup complete without parser');
}

// Sets up the task manager functionality
function setupTaskManager(dom, domConstruct, domClass, on) {
  // Get the form and input widgets
  const taskForm = dijit.byId("taskForm");
  const taskInput = dijit.byId("taskInput");
  const addTaskButton = dijit.byId("addTaskButton");
  const taskList = dom.byId("task-list");
  
  if (!taskForm || !taskInput || !addTaskButton || !taskList) {
    console.error('[dojo-app] Could not find all required elements');
    throw new Error('Required widgets not found');
  }
  
  // Function to add a task
  function addTask() {
    const taskText = taskInput.get('value').trim();
    if (!taskText) return;
    
    // Create task item
    const taskItem = domConstruct.create('li', {
      style: {
        display: 'flex',
        alignItems: 'center',
        margin: '10px 0',
        padding: '10px',
        background: '#f8f8f8',
        borderRadius: '4px'
      }
    }, taskList);
    
    // Create checkbox container and widget
    const checkBoxContainer = domConstruct.create('div', {}, taskItem);
    const checkbox = new dijit.form.CheckBox({
      onChange: function(checked) {
        domClass.toggle(taskTextNode, "completed-task");
      }
    }).placeAt(checkBoxContainer);
    
    // Create text node
    const taskTextNode = domConstruct.create('span', {
      innerHTML: taskText,
      style: {
        flexGrow: '1',
        margin: '0 10px'
      }
    }, taskItem);
    
    // Create delete button container and widget
    const buttonContainer = domConstruct.create('div', {}, taskItem);
    const deleteBtn = new dijit.form.Button({
      label: "Delete",
      onClick: function() {
        // Clean up widgets properly
        checkbox.destroyRecursive();
        deleteBtn.destroyRecursive();
        domConstruct.destroy(taskItem);
      }
    }).placeAt(buttonContainer);
    
    // Start both widgets
    checkbox.startup();
    deleteBtn.startup();
    
    // Clear input and focus
    taskInput.set('value', '');
    taskInput.focus();
  }
  
  // Connect the button click event
  addTaskButton.on("click", addTask);
  
  // Handle form submission and enter key
  taskForm.on("submit", function(e) {
    e.preventDefault();
    addTask();
  });
  
  // Add Enter key support on the input
  on(taskInput.domNode, "keypress", function(e) {
    if (e.keyCode === 13) {
      addTask();
    }
  });
  
  // Add some CSS for completed tasks
  const style = document.createElement('style');
  style.textContent = '.completed-task { text-decoration: line-through; color: #888; }';
  document.head.appendChild(style);
}

// Fallback implementation using vanilla JavaScript - returns a Promise
function mountWithVanillaJS() {
  return new Promise((resolve, reject) => {
    try {
      // Get the app container
      const container = document.getElementById('app');
      if (!container) {
        console.error('[dojo-app] Container not found');
        reject(new Error('Container not found'));
        return;
      }
      
      console.log('[dojo-app] Using vanilla JS fallback');
      
      // Create the task manager UI with standard DOM
      container.innerHTML = `
        <div class="dojo-task-manager">
          <h1>Dojo Task Manager</h1>
          <p>Task Manager (Vanilla JS Fallback)</p>
          <div id="task-form" style="margin-bottom: 20px;">
            <input type="text" id="task-input" placeholder="Enter a task" style="padding: 8px; width: 250px;">
            <button id="add-task-button" style="padding: 8px 12px; background: #0066cc; color: white; border: none; cursor: pointer;">Add Task</button>
          </div>
          <ul id="task-list" style="list-style: none; padding: 0;"></ul>
        </div>
      `;
      
      // Function to add a task
      const createTask = function(taskText) {
        if (!taskText.trim()) return;
        
        const taskList = document.getElementById('task-list');
        if (!taskList) return;
        
        // Create task item
        const taskItem = document.createElement('li');
        taskItem.style.display = 'flex';
        taskItem.style.alignItems = 'center';
        taskItem.style.margin = '10px 0';
        taskItem.style.padding = '10px';
        taskItem.style.background = '#f8f8f8';
        taskItem.style.borderRadius = '4px';
        
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.margin = '0 10px 0 0';
        
        // Create text span
        const taskTextSpan = document.createElement('span');
        taskTextSpan.style.flexGrow = '1';
        taskTextSpan.textContent = taskText;
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.padding = '5px 10px';
        deleteBtn.style.background = '#dc3545';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '4px';
        deleteBtn.style.cursor = 'pointer';
        
        // Add event listeners
        checkbox.addEventListener('change', function() {
          taskTextSpan.style.textDecoration = this.checked ? 'line-through' : 'none';
        });
        
        deleteBtn.addEventListener('click', function() {
          taskList.removeChild(taskItem);
        });
        
        // Add elements to task item
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskTextSpan);
        taskItem.appendChild(deleteBtn);
        
        // Add task to list
        taskList.appendChild(taskItem);
      };
      
      // Set up event handlers
      const addButton = document.getElementById('add-task-button');
      const taskInput = document.getElementById('task-input');
      
      if (addButton && taskInput) {
        addButton.addEventListener('click', function() {
          const taskText = taskInput.value.trim();
          if (taskText) {
            createTask(taskText);
            taskInput.value = '';
            taskInput.focus();
          }
        });
        
        taskInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            addButton.click();
          }
        });
      }
      
      console.log('[dojo-app] Vanilla JS setup complete');
      resolve();
    } catch (error) {
      console.error('[dojo-app] Error in vanilla JS mount:', error);
      reject(error);
    }
  });
}

// Unmount phase - clean up
export async function unmount() {
  console.log('[dojo-app] Unmount started');
  
  try {
    // Clean up
    const container = document.getElementById('app');
    if (container) {
      // Try to clean up any Dojo widgets if possible
      if (window.dijit) {
        try {
          console.log('[dojo-app] Cleaning up Dijit widgets');
          
          // Clean up form widgets
          const taskForm = dijit.byId("taskForm");
          if (taskForm && typeof taskForm.destroyRecursive === 'function') {
            taskForm.destroyRecursive();
          }
          
          // Clean up any other widgets that might be left
          if (dijit.registry) {
            const widgets = dijit.registry.toArray();
            console.log('[dojo-app] Found', widgets.length, 'widgets to destroy');
            
            widgets.forEach(widget => {
              if (widget && typeof widget.destroyRecursive === 'function') {
                widget.destroyRecursive();
              }
            });
          }
        } catch (e) {
          console.warn('[dojo-app] Error cleaning up widgets:', e);
        }
      }
      
      // Clear the container
      container.innerHTML = '';
      console.log('[dojo-app] Container cleared');
    }
    
    console.log('[dojo-app] Unmount completed');
    return Promise.resolve();
  } catch (error) {
    console.error('[dojo-app] Unmount error:', error);
    return Promise.resolve();
  }
} 