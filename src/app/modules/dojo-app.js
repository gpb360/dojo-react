// Dojo app implementation based on the successful manual rendering approach

// Log when the module is loaded
console.log('[dojo-app] Module loaded and initialized');

// Bootstrap phase - just initialize resources
export async function bootstrap() {
  console.log('[dojo-app] Bootstrap started');
  return Promise.resolve();
}

// Mount phase - render the app to the DOM
export async function mount(props) {
  console.log('[dojo-app] Mount started', props);
  
  try {
    // Get the app container
    const container = document.getElementById('app');
    if (!container) {
      console.error('[dojo-app] Container not found');
      return Promise.reject(new Error('Container not found'));
    }
    
    console.log('[dojo-app] Found container, rendering content');
    
    // Use the exact same markup that works in the manual render
    container.innerHTML = `
      <div class="dojo-task-manager">
        <h1>Dojo Task Manager</h1>
        <p>Task Manager (Single-SPA Mount)</p>
        <div id="task-form" style="margin-bottom: 20px;">
          <input type="text" id="task-input" placeholder="Enter a task" style="padding: 8px; width: 250px;">
          <button id="add-task-button" style="padding: 8px 12px; background: #0066cc; color: white; border: none; cursor: pointer;">Add Task</button>
        </div>
        <ul id="task-list" style="list-style: none; padding: 0;"></ul>
      </div>
    `;
    
    console.log('[dojo-app] HTML structure created');
    
    // Set up the event handlers - exactly like in the manual render
    const addButton = document.getElementById('add-task-button');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    
    if (addButton && taskInput && taskList) {
      // Add task handler
      addButton.addEventListener('click', function() {
        const taskText = taskInput.value.trim();
        if (taskText) {
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
          
          // Clear input
          taskInput.value = '';
          taskInput.focus();
        }
      });
      
      // Enable Enter key
      taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          addButton.click();
        }
      });
    }
    
    console.log('[dojo-app] Event handlers set up');
    console.log('[dojo-app] Mount completed successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('[dojo-app] Mount error:', error);
    return Promise.reject(error);
  }
}

// Unmount phase - clean up
export async function unmount() {
  console.log('[dojo-app] Unmount started');
  
  try {
    // Clean up
    const container = document.getElementById('app');
    if (container) {
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