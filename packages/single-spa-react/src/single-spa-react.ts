/**
 * single-spa-react
 * Helper library for using single-spa with React applications
 */
import React from 'react';
import ReactDOM from 'react-dom';

// Type for any object to allow flexible API access
type AnyObject = Record<string, any>;

export interface SingleSpaReactOptions {
  // React component to render
  React: typeof React;
  
  // ReactDOM for mounting and unmounting
  ReactDOM: typeof ReactDOM;
  
  // Root React component
  rootComponent: React.ComponentType<any>;
  
  // Optional DOM element container for rendering
  domElementGetter?: () => HTMLElement;
  
  // Optional error boundary component
  errorBoundary?: React.ComponentType<any>;
}

export interface SingleSpaReactLifecycles {
  bootstrap: () => Promise<void>;
  mount: (props: any) => Promise<void>;
  unmount: (props: any) => Promise<void>;
}

/**
 * Creates single-spa lifecycle functions for React applications
 * 
 * @param opts Configuration options for the React application
 * @returns Object containing single-spa lifecycle functions (bootstrap, mount, unmount)
 */
export default function singleSpaReact(opts: SingleSpaReactOptions): SingleSpaReactLifecycles {
  if (!opts) {
    throw new Error("single-spa-react requires options");
  }

  if (!opts.React) {
    throw new Error("single-spa-react requires React");
  }

  if (!opts.ReactDOM) {
    throw new Error("single-spa-react requires ReactDOM");
  }

  if (!opts.rootComponent) {
    throw new Error("single-spa-react requires rootComponent");
  }

  // Container for the root React instance
  let root: AnyObject | null = null;
  const reactDom = opts.ReactDOM as AnyObject;

  /**
   * Bootstrap lifecycle function
   * Called once when the application is first loaded
   */
  function bootstrap(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Mount lifecycle function
   * Called when the application is mounted to the DOM
   */
  function mount(props: any): Promise<void> {
    return Promise.resolve().then(() => {
      // Determine the container element
      const container = getDomElement(props, opts);
      
      // Create the React element with our root component and props
      const reactElement = opts.React.createElement(opts.rootComponent, props);
      
      // Wrap with error boundary if provided
      const elementToRender = opts.errorBoundary 
        ? opts.React.createElement(opts.errorBoundary, props, reactElement) 
        : reactElement;
      
      // Render the application using modern createRoot if available, fallback to legacy render
      if (typeof reactDom.createRoot === 'function') {
        // React 18+ approach
        root = reactDom.createRoot(container);
        root.render(elementToRender);
      } else if (typeof reactDom.render === 'function') {
        // Legacy approach for React 17 and earlier
        reactDom.render(elementToRender, container);
      } else {
        throw new Error("ReactDOM.createRoot or ReactDOM.render is required");
      }
    });
  }

  /**
   * Unmount lifecycle function
   * Called when the application is unmounted from the DOM
   */
  function unmount(props: any): Promise<void> {
    return Promise.resolve().then(() => {
      const container = getDomElement(props, opts);
      
      // Unmount using modern root API if available, fallback to legacy unmountComponentAtNode
      if (root && typeof root.unmount === 'function') {
        // React 18+ approach
        root.unmount();
        root = null;
      } else if (typeof reactDom.unmountComponentAtNode === 'function') {
        // Legacy approach for React 17 and earlier
        reactDom.unmountComponentAtNode(container);
      } else {
        throw new Error("Unable to unmount React component - no compatible API found");
      }
    });
  }

  return {
    bootstrap,
    mount,
    unmount
  };
}

/**
 * Helper to get the DOM element to render into
 */
function getDomElement(props: any, opts: SingleSpaReactOptions): HTMLElement {
  // Use the domElement from props if available
  if (props.domElement) {
    return props.domElement;
  }
  
  // Use the domElementGetter from options if available
  if (opts.domElementGetter) {
    return opts.domElementGetter();
  }
  
  // Use the default domElementGetter from props if available
  if (props.domElementGetter) {
    return props.domElementGetter();
  }
  
  throw new Error("No domElement or domElementGetter provided");
} 