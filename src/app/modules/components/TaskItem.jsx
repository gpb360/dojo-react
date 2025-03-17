import React, { useState } from 'react';
import DojoCheckboxAdapter from '../adapters/DojoCheckboxAdapter';

const TaskItem = ({ task, onDelete, useDojo = false }) => {
  const [isCompleted, setIsCompleted] = useState(task.completed || false);
  
  const handleCheckboxChange = (checked) => {
    setIsCompleted(checked);
  };
  
  return (
    <li className="task-item">
      {useDojo ? (
        <DojoCheckboxAdapter 
          checked={isCompleted}
          onChange={handleCheckboxChange}
        />
      ) : (
        <input 
          type="checkbox"
          checked={isCompleted}
          onChange={(e) => handleCheckboxChange(e.target.checked)}
          className="task-checkbox"
        />
      )}
      <span 
        className="task-text"
        style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}
      >
        {task.text}
      </span>
      <button 
        onClick={() => onDelete(task.id)}
        className="task-delete-button"
      >
        Delete
      </button>
    </li>
  );
};

export default TaskItem; 