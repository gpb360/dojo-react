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

  return (
    <div ref={containerRef} className="app-container" style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Hybrid React/Dojo Application</h1>
      <p>This application demonstrates how to use real Dojo widgets in React</p>
      
      <div className="task-list" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Task List</h2>
        
        <div style={{ display: 'flex', marginBottom: '15px', gap: '10px' }}>
          {/* Using real Dojo TextBox widget adapter */}
          <div style={{ flex: 1 }}>
            <DojoErrorBoundary fallback={
              <input 
                type="text" 
                value={text} 
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter a task"
                style={{ width: '100%', padding: '4px 8px' }}
              />
            }>
              <DojoWidgets.TextBox 
                value={text} 
                onChange={(value) => setText(value)}
                placeholder="Enter a New task"
              />
            </DojoErrorBoundary>
          </div>
          
          {/* Using real Dojo Button widget adapter */}
          <div>
            <DojoErrorBoundary fallback={
              <button 
                onClick={handleAddItem}
                style={{ padding: '4px 12px' }}
              >
                Add Task
              </button>
            }>
              <DojoWidgets.Button 
                label="Add Task" 
                onClick={handleAddItem}
              />
            </DojoErrorBoundary>
          </div>
        </div>
        
        {items.length === 0 ? (
          <p>No tasks added yet. Add your first task above!</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {items.map((item, index) => (
              <li key={index} style={{ 
                marginBottom: '10px',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                textDecoration: completed.includes(index) ? 'line-through' : 'none'
              }}>
                {/* Using real Dojo CheckBox widget adapter */}
                <div style={{ display: 'inline-block', marginRight: '10px' }}>
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
                
                <div style={{ flex: 1 }}>{item}</div>
                
                {/* Add delete button using Dojo Button widget */}
                <div style={{ marginLeft: 'auto' }}>
                  <DojoErrorBoundary fallback={
                    <button 
                      onClick={() => handleDeleteItem(index)}
                      style={{ 
                        padding: '2px 8px', 
                        backgroundColor: '#ff6b6b', 
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  }>
                    <DojoWidgets.Button 
                      label="Delete" 
                      onClick={() => handleDeleteItem(index)}
                      style={{ color: 'white' }}
                      className="deleteButton"
                    />
                  </DojoErrorBoundary>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
        <p><strong>Note:</strong> This component demonstrates:</p>
        <ul>
          <li>Using real Dojo widgets inside React components with proper lifecycle management</li>
          <li>Two-way data binding between Dojo widgets and React state</li>
          <li>Error boundaries to handle widget initialization failures</li>
          <li>Fallback to plain HTML when Dojo widgets fail to load</li>
        </ul>
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fffde7', borderRadius: '5px' }}>
          <p><strong>Migration Strategy:</strong></p>
          <ol>
            <li><strong>Phase 1:</strong> Create React wrappers for Dojo widgets (what you see here)</li>
            <li><strong>Phase 2:</strong> Move state management to React while still using Dojo for UI</li>
            <li><strong>Phase 3:</strong> Gradually replace Dojo widgets with pure React components</li>
            <li><strong>Phase 4:</strong> Refactor to use modern React patterns and optimizations</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

// Mount configuration for single-spa-react
const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: HybridReactApp,
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