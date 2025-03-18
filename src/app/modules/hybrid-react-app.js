import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';

// Import our real Dojo widget adapters - use a direct import to ensure it works
import DojoWidgets, { DojoErrorBoundary } from './adapters/DojoAdapterRegistry';

/**
 * HybridReactApp - Demonstrates the use of real Dojo widgets inside a React app
 * This is a key part of a migration strategy:
 * 1. Start by wrapping Dojo widgets in React components
 * 2. Manage state in React but delegate rendering to Dojo
 * 3. Gradually replace Dojo components with pure React as needed
 */
const HybridReactApp = ({ name }) => {
  // React state management
  const [text, setText] = useState('');
  const [items, setItems] = useState([]);
  const [completed, setCompleted] = useState([]);
  
  // Container ref 
  const containerRef = useRef(null);

  // Handle adding a new task
  const handleAddItem = () => {
    if (text.trim()) {
      setItems([...items, text]);
      setText('');
    }
  };

  // Handle deleting a task
  const handleDeleteItem = (indexToDelete) => {
    // Create a new array without the deleted item
    const newItems = items.filter((_, index) => index !== indexToDelete);
    
    // Update the completed array to maintain consistency
    const newCompleted = completed.filter(index => {
      // If the index is less than the deleted index, keep it as is
      if (index < indexToDelete) return true;
      // If the index is the deleted index, remove it
      if (index === indexToDelete) return false;
      // If the index is greater than the deleted index, decrement it
      return false; // We'll add the decremented index below
    });
    
    // Add decremented indexes for completed items that were after the deleted item
    completed.forEach(index => {
      if (index > indexToDelete) {
        newCompleted.push(index - 1);
      }
    });
    
    // Update state
    setItems(newItems);
    setCompleted(newCompleted);
  };

  // Toggle completion state of a task
  const toggleCompleted = (index) => {
    if (completed.includes(index)) {
      setCompleted(completed.filter(i => i !== index));
    } else {
      setCompleted([...completed, index]);
    }
  };

  // Log component lifecycle for demonstration
  useEffect(() => {
    console.log('HybridReactApp mounted');
    return () => {
      console.log('HybridReactApp unmounted');
    };
  }, []);

  // Create empty state component
  const EmptyState = () => (
    <div className="empty-state" style={{ 
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

  const hasTasks = items.length > 0;

  return (
    <div ref={containerRef} className="hybrid-react-app">
      <h2>Tasks</h2>
      
      <div style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
        {/* Using real Dojo TextBox widget adapter */}
        <div style={{ flex: 1 }}>
          <DojoErrorBoundary fallback={
            <input 
              type="text" 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              placeholder="What needs to be done?"
              className="taskInput"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                outline: 'none'
              }}
            />
          }>
            <DojoWidgets.TextBox 
              value={text} 
              onChange={(value) => setText(value)}
              placeholder="What needs to be done?"
              className="taskInput"
              style={{
                width: '100%',
                fontSize: '16px'
              }}
            />
          </DojoErrorBoundary>
        </div>
        
        {/* Using real Dojo Button widget adapter */}
        <div>
          <DojoErrorBoundary fallback={
            <button 
              onClick={handleAddItem}
              disabled={!text.trim()}
              className="addButton"
              style={{
                background: text.trim() ? '#4caf50' : '#cccccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 16px',
                cursor: text.trim() ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                transition: 'background 0.2s'
              }}
            >
              Add
            </button>
          }>
            <DojoWidgets.Button 
              label="Add" 
              onClick={handleAddItem}
              disabled={!text.trim()}
              className="addButton"
              style={{
                background: text.trim() ? '#4caf50' : '#cccccc',
                color: 'white',
                padding: '10px 16px',
                fontSize: '16px'
              }}
            />
          </DojoErrorBoundary>
        </div>
      </div>
      
      {!hasTasks ? (
        <EmptyState />
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {items.map((item, index) => (
            <li key={index} className={`task-item ${completed.includes(index) ? 'completed' : ''}`} style={{ 
              marginBottom: '10px',
              padding: '12px',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              opacity: completed.includes(index) ? 0.7 : 1
            }}>
              {/* Using real Dojo CheckBox widget adapter */}
              <div className="dojo-checkbox-container">
                <DojoErrorBoundary fallback={
                  <input 
                    type="checkbox"
                    checked={completed.includes(index)}
                    onChange={() => toggleCompleted(index)}
                  />
                }>
                  <DojoWidgets.CheckBox 
                    checked={completed.includes(index)}
                    onChange={() => toggleCompleted(index)}
                  />
                </DojoErrorBoundary>
              </div>
              
              <span className={`task-text ${completed.includes(index) ? 'completed' : ''}`} style={{ 
                flexGrow: 1, 
                fontWeight: completed.includes(index) ? 'normal' : '500',
                color: completed.includes(index) ? '#777' : '#333' 
              }}>
                {item}
              </span>
              
              {/* Add delete button using Dojo Button widget */}
              <div>
                <DojoErrorBoundary fallback={
                  <button 
                    onClick={() => handleDeleteItem(index)}
                    className="deleteButton"
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
                }>
                  <DojoWidgets.Button 
                    label="Delete" 
                    onClick={() => handleDeleteItem(index)}
                    className="deleteButton"
                    style={{
                      background: '#ff5252',
                      color: 'white',
                      padding: '6px 12px',
                      fontSize: '14px'
                    }}
                  />
                </DojoErrorBoundary>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {hasTasks && (
        <div className="task-counter" style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '20px',
          padding: '10px 0',
          borderTop: '1px solid #eee',
          color: '#777',
          fontSize: '14px'
        }}>
          <span>{items.length} task(s)</span>
          <span>{completed.length} completed</span>
        </div>
      )}
      
      <div className="info-box" style={{ 
        marginTop: '30px',
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        border: '1px solid #eaeaea',
        fontSize: '14px',
        color: '#666'
      }}>
        <p style={{ margin: '0 0 10px 0' }}><strong>Hybrid Component</strong>: React UI with Dojo widgets</p>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>Uses React for state management</li>
          <li>Integrates real Dojo widgets in a React component</li>
          <li>Shows fallbacks when widgets fail to load</li>
        </ul>
      </div>
    </div>
  );
};

// Mount configuration for single-spa-react
const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: HybridReactApp,
  domElementGetter: props => props.domElementGetter(),
  errorBoundary(err, info, props) {
    return (
      <div className="error-boundary" style={{ padding: '20px', backgroundColor: '#ffebee', borderRadius: '5px', color: '#d32f2f', maxWidth: '800px', margin: '0 auto' }}>
        <h2>Something went wrong</h2>
        <p>{err.message}</p>
        <pre style={{ backgroundColor: '#f8f8f8', padding: '10px', overflow: 'auto', maxHeight: '200px' }}>
          {info.componentStack}
        </pre>
        <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Reload the application
        </button>
      </div>
    );
  },
});

export const { bootstrap, mount, unmount } = lifecycles; 