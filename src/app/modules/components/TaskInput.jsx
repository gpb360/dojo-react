import React, { useState } from 'react';

const TaskInput = ({ onAddTask }) => {
  const [taskText, setTaskText] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskText.trim() === '') return;
    
    onAddTask(taskText);
    setTaskText('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input 
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        placeholder="Enter a task"
        className="task-input"
      />
      <button type="submit" className="task-button">Add Task</button>
    </form>
  );
};

export default TaskInput; 