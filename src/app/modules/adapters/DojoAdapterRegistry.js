import React from 'react';
import DojoButtonAdapter from './DojoButtonAdapter';
import DojoTextBoxAdapter from './DojoTextBoxAdapter';
import DojoCheckboxAdapter from './DojoCheckboxAdapter';

/**
 * Error boundary to catch errors in Dojo adapter components
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in Dojo adapter:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div style={{ 
          border: '1px solid #f88', 
          padding: '8px', 
          borderRadius: '4px',
          backgroundColor: '#fee',
          color: '#c33'
        }}>
          <p>Widget Error: {this.state.error?.message || 'Failed to load Dojo widget'}</p>
          <button onClick={() => this.setState({ hasError: false })}>Try Again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export ErrorBoundary as DojoErrorBoundary for backward compatibility
export { ErrorBoundary as DojoErrorBoundary };

/**
 * Higher-order component to wrap Dojo adapters with error boundary
 */
const withErrorBoundary = (WrappedComponent) => {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};

// Export both raw components and error-wrapped components
export {
  DojoButtonAdapter,
  DojoTextBoxAdapter,
  DojoCheckboxAdapter,
};

// Default export has error boundaries applied
export default {
  Button: withErrorBoundary(DojoButtonAdapter),
  TextBox: withErrorBoundary(DojoTextBoxAdapter),
  CheckBox: withErrorBoundary(DojoCheckboxAdapter)
}; 