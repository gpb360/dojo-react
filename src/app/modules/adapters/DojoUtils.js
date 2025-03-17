/**
 * Utility functions for working with Dojo widgets
 */

/**
 * Ensures Dojo is ready and returns a promise
 * This helps prevent "ready is not a function" errors
 */
export function ensureDojo() {
  return new Promise((resolve, reject) => {
    // Check if document is loaded first
    const isDomReady = document.readyState === 'complete' || document.readyState === 'interactive';
    
    // Check if dojo is already ready
    if (window.__dojoStatus && window.__dojoStatus.widgetsReady) {
      console.log('Dojo already ready');
      resolve();
      return;
    }
    
    // If Dojo had an error, fail immediately instead of waiting
    if (window.__dojoStatus && window.__dojoStatus.error) {
      console.warn('Dojo previously had an error, not waiting for readiness');
      reject(new Error('Dojo failed to initialize'));
      return;
    }

    // Function to get the appropriate require function
    const getDojoRequire = () => {
      if (window.dojoRequire) return window.dojoRequire;
      if (window.require) return window.require;
      if (window.dojo && window.dojo.require) return window.dojo.require;
      return null;
    };

    // If we already have dojoRequire and DOM is ready, we can proceed cautiously
    const dojoRequire = getDojoRequire();
    if (isDomReady && dojoRequire && window.__dojoStatus && window.__dojoStatus.initialized) {
      console.log('DOM ready and Dojo initialized - proceeding despite widgets not being marked ready');
      resolve();
      return;
    }

    // Listen for the dojo-ready event
    const readyHandler = () => {
      console.log('Dojo ready event received in ensureDojo');
      resolve();
    };

    document.addEventListener('dojo-ready', readyHandler, { once: true });

    // Set up timeout in case the event never fires
    const timeout = setTimeout(() => {
      console.warn('Timed out waiting for dojo-ready event');
      document.removeEventListener('dojo-ready', readyHandler);
      
      // Check if we have any kind of require function to work with
      if (getDojoRequire()) {
        console.log('Found dojo require function despite timeout, proceeding');
        resolve();
      } else {
        reject(new Error('Dojo not available after timeout'));
      }
    }, 3000); // Reduced timeout for better user experience
  });
}

/**
 * Safely destroys a Dojo widget if it exists
 */
export function safeDestroyWidget(widget) {
  if (widget && typeof widget.destroyRecursive === 'function') {
    try {
      widget.destroyRecursive();
      return true;
    } catch (e) {
      console.error('Error destroying widget:', e);
      return false;
    }
  }
  return false;
}

/**
 * Safely updates a Dojo widget's properties
 */
export function safeSetWidgetProps(widget, props) {
  if (!widget || typeof widget.set !== 'function') {
    return false;
  }

  try {
    // Filter out props that aren't relevant to Dojo
    const dojoProps = { ...props };
    delete dojoProps.children;
    delete dojoProps.className;
    delete dojoProps.style;
    
    // Set each property individually
    Object.keys(dojoProps).forEach(key => {
      widget.set(key, dojoProps[key]);
    });
    
    return true;
  } catch (e) {
    console.error('Error setting widget properties:', e);
    return false;
  }
}

/**
 * Creates a Dojo widget safely
 */
export function createDojoWidget(widgetType, props, domNode) {
  return new Promise((resolve, reject) => {
    // First try using the global helper function
    if (window.dojoCreateWidget) {
      try {
        const widget = window.dojoCreateWidget(widgetType, props, domNode);
        if (widget) {
          resolve(widget);
          return;
        }
      } catch (e) {
        console.warn('Global dojoCreateWidget failed, falling back to direct creation:', e);
      }
    }

    // Fallback approach using dojoRequire
    const dojoRequire = window.dojoRequire || window.require;
    if (!dojoRequire) {
      reject(new Error('No Dojo require function available'));
      return;
    }

    // Map widget types to their module paths
    const widgetModules = {
      'Button': 'dijit/form/Button',
      'TextBox': 'dijit/form/TextBox',
      'CheckBox': 'dijit/form/CheckBox'
    };

    const modulePath = widgetModules[widgetType];
    if (!modulePath) {
      reject(new Error(`Unknown widget type: ${widgetType}`));
      return;
    }

    // Load the widget module and create the widget
    dojoRequire([modulePath], function(Widget) {
      try {
        if (!Widget || typeof Widget !== 'function') {
          throw new Error(`Widget constructor not found for ${widgetType}`);
        }

        const widget = new Widget(props, domNode);
        if (widget.startup) {
          widget.startup();
        }
        resolve(widget);
      } catch (e) {
        reject(new Error(`Failed to create ${widgetType} widget: ${e.message}`));
      }
    }, function(error) {
      reject(new Error(`Failed to load ${widgetType} module: ${error.message}`));
    });
  });
} 