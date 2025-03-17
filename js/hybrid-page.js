// js/hybrid-page.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import TaskInput from './components/TaskInput';
import TaskItem from './components/TaskItem';

// Function to safely destroy Dojo widgets
function cleanupDojoWidgets(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Find widgets in container and destroy them
  if (window.dijit && dijit.registry) {
    dijit.registry.forEach(widget => {
      if (container.contains(widget.domNode)) {
        if (widget.destroyRecursive) {
          widget.destroyRecursive();
        }
      }
    });
  }
}

// Function to extract tasks from Dojo DOM
function extractTasksFromDojo() {
  const tasks = [];
  const taskItems = document.querySelectorAll('#taskList .task-item');
  
  taskItems.forEach((item, index) => {
    const textNode = item.querySelector('.task-text');
    const checkbox = dijit.registry.findWidgets(item)[0]; // Find the checkbox widget
    
    if (textNode) {
      tasks.push({
        id: `dojo-task-${index}`,
        text: textNode.textContent,
        completed: checkbox ? checkbox.get('checked') : false
      });
    }
  });
  
  return tasks;
}

// Hybrid component that replaces parts of the Dojo UI with React
const HybridTaskManager = ({ domElement }) => {
  const [tasks, setTasks] = useState([]);
  const [usingReactInput, setUsingReactInput] = useState(false);
  const [usingReactList, setUsingReactList] = useState(false);
  
  // On mount, extract tasks from Dojo
  useEffect(() => {
    const dojoTasks = extractTasksFromDojo();
    setTasks(dojoTasks);
  }, []);
  
  // Replace Dojo input with React input
  const switchToReactInput = () => {
    const taskForm = document.getElementById('taskForm');
    
    // Clean up Dojo widgets
    cleanupDojoWidgets('taskForm');
    
    // Clear form
    taskForm.innerHTML = '';
    
    // Render React component
    ReactDOM.render(
      <TaskInput onAddTask={addTask} />,
      taskForm
    );
    
    setUsingReactInput(true);
  };
  
  // Replace Dojo task list with React task list
  const switchToReactList = () => {
    const taskList = document.getElementById('taskList');
    
    // Extract tasks before cleaning up
    const dojoTasks = extractTasksFromDojo();
    setTasks(dojoTasks);
    
    // Clean up Dojo widgets
    cleanupDojoWidgets('taskList');
    
    // Clear list
    taskList.innerHTML = '';
    
    // We'll render the list in the main component
    setUsingReactList(true);
  };
  
  const addTask = (text) => {
    const newTask = {
      id: Date.now(),
      text,
      completed: false
    };
    
    setTasks([...tasks, newTask]);
  };
  
  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };
  
  return (
    <div className="hybrid-manager">
      <h2>Hybrid Task Manager (Transition in Progress)</h2>
      
      <div className="controls">
        <button 
          onClick={switchToReactInput}
          disabled={usingReactInput}
        >
          Migrate Input to React
        </button>
        <button 
          onClick={switchToReactList}
          disabled={usingReactList}
        >
          Migrate Task List to React
        </button>
      </div>
      
      {/* If using React list, render the tasks */}
      {usingReactList && (
        <ul className="task-list">
          {tasks.map(task => (
            <TaskItem 
              key={task.id}
              task={task}
              onDelete={deleteTask}
              useDojo={!usingReactInput} // Use Dojo checkbox if input isn't migrated yet
            />
          ))}
        </ul>
      )}
    </div>
  );
};

// Export lifecycle functions for single-spa
export const bootstrap = async () => {
  console.log('Hybrid page bootstrapped');
};

export const mount = async (props) => {
  console.log('Hybrid page mounted');
  
  // First, load the Dojo task manager
  require(['./dojo-app'], function(dojoApp) {
    dojoApp.mount(props).then(() => {
      // After Dojo app is mounted, inject our hybrid manager
      const hybridContainer = document.createElement('div');
      hybridContainer.id = 'hybrid-container';
      document.body.appendChild(hybridContainer);
      
      ReactDOM.render(
        <HybridTaskManager domElement={hybridContainer} />,
        hybridContainer
      );
    });
  });
};

export const unmount = async (props) => {
  console.log('Hybrid page unmounted');
  
  // Unmount React components
  const hybridContainer = document.getElementById('hybrid-container');
  if (hybridContainer) {
    ReactDOM.unmountComponentAtNode(hybridContainer);
    hybridContainer.parentNode.removeChild(hybridContainer);
  }
  
  // Unmount Dojo app
  require(['./dojo-app'], function(dojoApp) {
    dojoApp.unmount(props);
  });
}; 