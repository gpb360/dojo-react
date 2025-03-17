// js/react-app.js
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import TaskInput from './components/TaskInput';
import TaskItem from './components/TaskItem';

// Create a simple task manager app
const TaskManager = ({ domElement, useDojo = false }) => {
  const [tasks, setTasks] = useState([]);
  
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
    <div className="react-task-manager">
      <h1>React Task Manager {useDojo ? '(with Dojo Checkboxes)' : ''}</h1>
      
      <TaskInput onAddTask={addTask} />
      
      <ul className="task-list">
        {tasks.map(task => (
          <TaskItem 
            key={task.id}
            task={task}
            onDelete={deleteTask}
            useDojo={useDojo}
          />
        ))}
      </ul>
    </div>
  );
};

let rootComponent = null;

// Export lifecycle functions for single-spa
export function bootstrap() {
  console.log('React app bootstrapped');
  return Promise.resolve();
}

export function mount(props) {
  console.log('React app mounted', props);
  return new Promise((resolve, reject) => {
    try {
      const container = document.getElementById('app');
      if (!container) {
        throw new Error('Container #app not found');
      }
      rootComponent = ReactDOM.render(
        <TaskManager domElement={container} />,
        container,
        () => resolve()
      );
    } catch (e) {
      console.error('Error mounting React app:', e);
      reject(e);
    }
  });
}

export function unmount() {
  console.log('React app unmounted');
  return new Promise((resolve, reject) => {
    try {
      const container = document.getElementById('app');
      if (container) {
        ReactDOM.unmountComponentAtNode(container);
      }
      rootComponent = null;
      resolve();
    } catch (e) {
      console.error('Error unmounting React app:', e);
      reject(e);
    }
  });
} 