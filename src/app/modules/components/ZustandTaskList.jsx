import React, { useCallback, useEffect } from 'react';
import useTaskStore from '../../stores/useTaskStore';

/**
 * Task Item Component - A modern React implementation
 * This shows what components look like after full migration from Dojo
 */
const TaskItem = React.memo(({ task, isCompleted, onToggleComplete, onDelete }) => {
  const handleToggle = useCallback(() => {
    onToggleComplete(task.id);
  }, [task.id, onToggleComplete]);
  
  const handleDelete = useCallback(() => {
    onDelete(task.id);
  }, [task.id, onDelete]);

  return (
    <li className="task-item" style={{ 
      marginBottom: '10px',
      padding: '12px',
      borderRadius: '4px',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      textDecoration: isCompleted ? 'line-through' : 'none',
      opacity: isCompleted ? 0.7 : 1
    }}>
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={handleToggle}
        style={{ marginRight: '12px' }}
      />
      
      <span style={{ 
        flexGrow: 1, 
        fontWeight: isCompleted ? 'normal' : '500',
        color: isCompleted ? '#777' : '#333' 
      }}>
        {task.text}
      </span>
      
      <button 
        onClick={handleDelete}
        style={{
          background: '#ff5252',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#ff1744'}
        onMouseOut={(e) => e.currentTarget.style.background = '#ff5252'}
      >
        Delete
      </button>
    </li>
  );
});

/**
 * EmptyState Component
 */
const EmptyState = () => (
  <div style={{ 
    textAlign: 'center', 
    padding: '20px', 
    color: '#777',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    margin: '20px 0'
  }}>
    <p>No tasks added yet. Add your first task above!</p>
    <span role="img" aria-label="tasks" style={{ fontSize: '24px' }}>📝</span>
  </div>
);

/**
 * ZustandTaskList - A React implementation using Zustand for state management
 * This shows how centralized state management improves code organization
 */
const ZustandTaskList = () => {
  // Get state and actions from Zustand store
  const tasks = useTaskStore(state => state.tasks);
  const completedTaskIds = useTaskStore(state => state.completedTaskIds);
  const addTask = useTaskStore(state => state.addTask);
  const deleteTask = useTaskStore(state => state.deleteTask);
  const toggleTaskCompletion = useTaskStore(state => state.toggleTaskCompletion);
  const loadTasks = useTaskStore(state => state.loadTasks);
  const getSortedTasks = useTaskStore(state => state.getSortedTasks);
  
  // Local state for input value
  const [newTaskText, setNewTaskText] = React.useState('');
  
  // Load tasks from localStorage on component mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Handler callbacks
  const handleAddTask = useCallback(() => {
    if (newTaskText.trim()) {
      addTask(newTaskText);
      setNewTaskText('');
    }
  }, [newTaskText, addTask]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  }, [handleAddTask]);

  // Derived state
  const hasTasks = tasks.length > 0;
  const sortedTasks = getSortedTasks();

  return (
    <div className="zustand-task-list" style={{
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Tasks (Zustand)</h2>
      
      <div style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="What needs to be done?"
          style={{
            flex: 1,
            padding: '10px 12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            outline: 'none',
          }}
        />
        
        <button
          onClick={handleAddTask}
          disabled={!newTaskText.trim()}
          style={{
            background: newTaskText.trim() ? '#4caf50' : '#cccccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 16px',
            cursor: newTaskText.trim() ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            transition: 'background 0.2s'
          }}
        >
          Add
        </button>
      </div>
      
      {!hasTasks ? (
        <EmptyState />
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {sortedTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              isCompleted={completedTaskIds.has(task.id)}
              onToggleComplete={toggleTaskCompletion}
              onDelete={deleteTask}
            />
          ))}
        </ul>
      )}
      
      {hasTasks && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '20px',
          padding: '10px 0',
          borderTop: '1px solid #eee',
          color: '#777',
          fontSize: '14px'
        }}>
          <span>{tasks.length} task(s)</span>
          <span>{completedTaskIds.size} completed</span>
        </div>
      )}
      
      <div style={{ 
        marginTop: '30px',
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        border: '1px solid #eaeaea',
        fontSize: '14px',
        color: '#666'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          <strong>Using Zustand</strong>: This component demonstrates centralized state management
        </p>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>State is managed in a central store</li>
          <li>Components subscribe to only what they need</li>
          <li>Tasks are persisted to localStorage</li>
          <li>Actions are defined separately from components</li>
        </ul>
      </div>
    </div>
  );
};

export default ZustandTaskList; 