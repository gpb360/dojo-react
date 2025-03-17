import React, { useState, useCallback, useMemo } from 'react';

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
 * PureReactTaskList - A fully React implementation showcasing modern patterns
 * This represents the final stage of migration from Dojo to React
 */
const PureReactTaskList = () => {
  // State hooks
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [completedTaskIds, setCompletedTaskIds] = useState(new Set());

  // Handler callbacks
  const handleAddTask = useCallback(() => {
    if (newTaskText.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        createdAt: new Date()
      };
      
      setTasks(prevTasks => [...prevTasks, newTask]);
      setNewTaskText('');
    }
  }, [newTaskText]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  }, [handleAddTask]);

  const handleToggleComplete = useCallback((taskId) => {
    setCompletedTaskIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(taskId)) {
        newIds.delete(taskId);
      } else {
        newIds.add(taskId);
      }
      return newIds;
    });
  }, []);

  const handleDeleteTask = useCallback((taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    setCompletedTaskIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(taskId)) {
        newIds.delete(taskId);
      }
      return newIds;
    });
  }, []);

  // Derived state with useMemo
  const hasTasks = useMemo(() => tasks.length > 0, [tasks]);
  
  const tasksSorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // Completed tasks at the bottom
      const aCompleted = completedTaskIds.has(a.id);
      const bCompleted = completedTaskIds.has(b.id);
      
      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;
      
      // Otherwise sort by creation date (newest first)
      return b.createdAt - a.createdAt;
    });
  }, [tasks, completedTaskIds]);

  return (
    <div className="pure-react-task-list" style={{
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Tasks</h2>
      
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
          {tasksSorted.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              isCompleted={completedTaskIds.has(task.id)}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
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
    </div>
  );
};

export default PureReactTaskList; 