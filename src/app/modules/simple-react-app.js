import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import PureReactTaskList from './components/PureReactTaskList.jsx';

/**
 * SimpleReactApp - Demonstrates a fully migrated React application
 * This is the end goal of our migration from Dojo to React
 */
const SimpleReactApp = () => {
  return (
    <div className="pure-react-app-container" style={{ 
      padding: '20px',
      backgroundColor: '#f9f9f9', 
      borderRadius: '5px', 
      maxWidth: '800px', 
      margin: '0 auto' 
    }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>Pure React Application</h1>
      <p>This app demonstrates the fully migrated end state with only React components.</p>
      
      <PureReactTaskList />
      
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '5px' 
      }}>
        <h3>Migration Complete!</h3>
        <p>This application represents the final phase of migration from Dojo to React:</p>
        <ul>
          <li>✅ <strong>No Dojo dependencies</strong> - All components are pure React</li>
          <li>✅ <strong>Modern React patterns</strong> - Using hooks, memo, and functional components</li>
          <li>✅ <strong>Performance optimized</strong> - With useMemo, useCallback, and component splitting</li>
          <li>✅ <strong>Clean architecture</strong> - Following React best practices</li>
        </ul>
        <p style={{ marginTop: '10px' }}>
          Compare this with the <a href="#/hybrid-react" style={{ color: '#0066cc' }}>Hybrid React/Dojo App</a> to see the transition from hybrid to pure React.
        </p>
      </div>
    </div>
  );
};

// Mount configuration for single-spa-react
const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: SimpleReactApp,
  domElementGetter: props => props.domElementGetter(),
  errorBoundary(err, info, props) {
    return (
      <div className="error-boundary" style={{ 
        padding: '20px', 
        backgroundColor: '#ffebee', 
        borderRadius: '5px', 
        color: '#d32f2f', 
        maxWidth: '800px', 
        margin: '0 auto' 
      }}>
        <h2>Something went wrong</h2>
        <p>{err.message}</p>
        <pre style={{ 
          backgroundColor: '#f8f8f8', 
          padding: '10px', 
          overflow: 'auto', 
          maxHeight: '200px' 
        }}>
          {info.componentStack}
        </pre>
        <button onClick={() => window.location.reload()} style={{ 
          padding: '8px 16px', 
          backgroundColor: '#2196f3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}>
          Reload the application
        </button>
      </div>
    );
  },
});

export const { bootstrap, mount, unmount } = lifecycles; 