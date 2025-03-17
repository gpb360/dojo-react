import React, { useEffect, useRef, useState } from 'react';

/**
 * HTML-Based implementation of Dojo Button
 */
export const DojoButtonAdapter = ({ label, onClick, ...props }) => {
  // We'll use a regular HTML button but style it to look like a Dojo button
  return (
    <button
      onClick={onClick}
      className="dijitButton"
      style={{
        padding: '4px 12px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '14px',
        color: '#333',
        ...props.style
      }}
      {...props}
    >
      {label}
    </button>
  );
};

/**
 * HTML-Based implementation of Dojo TextBox
 */
export const DojoTextBoxAdapter = ({ value, onChange, ...props }) => {
  // Use regular HTML input but style it to look like a Dojo textbox
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      className="dijitTextBox"
      style={{
        padding: '4px 8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
        fontFamily: 'inherit',
        color: '#333',
        ...props.style
      }}
      {...props}
    />
  );
};

/**
 * HTML-Based implementation of Dojo CheckBox
 */
export const DojoCheckBoxAdapter = ({ checked, onChange, ...props }) => {
  // Create a wrapper to make it look more like a Dojo checkbox
  return (
    <div 
      className="dijitCheckBox" 
      style={{ 
        display: 'inline-block', 
        position: 'relative',
        ...props.style 
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        style={{
          margin: '0',
          position: 'relative',
          cursor: 'pointer'
        }}
        {...props}
      />
      <span 
        style={{ 
          display: 'inline-block', 
          width: '16px', 
          height: '16px',
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

/**
 * Error boundary component to catch errors in React components
 */
export class DojoErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in Dojo-React component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '8px',
          margin: '4px 0',
          border: '1px solid #d32f2f',
          borderRadius: '4px',
          backgroundColor: '#ffebee',
          color: '#d32f2f'
        }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Widget Error</h4>
          <p style={{ margin: '0' }}>{this.state.error && this.state.error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper for each adapter to provide error boundary
const withErrorBoundary = (Component) => {
  return (props) => (
    <DojoErrorBoundary>
      <Component {...props} />
    </DojoErrorBoundary>
  );
};

// Export the wrapped components
export default {
  DojoButtonAdapter: withErrorBoundary(DojoButtonAdapter),
  DojoTextBoxAdapter: withErrorBoundary(DojoTextBoxAdapter),
  DojoCheckBoxAdapter: withErrorBoundary(DojoCheckBoxAdapter)
}; 