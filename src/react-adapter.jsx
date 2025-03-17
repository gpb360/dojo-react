import React, { useEffect, useRef, useState } from 'react';

/**
 * DojoWidgetAdapter - A React component that wraps Dojo widgets
 * 
 * This adapter makes it possible to use Dojo widgets within React components
 * during the migration from Dojo to React.
 * 
 * @param {Object} props
 * @param {Function} props.dojoWidgetClass - The Dojo widget constructor
 * @param {Object} props.widgetProps - Props to pass to the Dojo widget
 * @param {Function} props.onWidgetCreated - Optional callback when widget is created
 * @param {Object} props.style - Optional style for the container
 * @param {String} props.className - Optional CSS class for the container
 */
export const DojoWidgetAdapter = ({ 
  dojoWidgetClass,
  widgetProps = {},
  onWidgetCreated,
  style,
  className,
  ...otherProps
}) => {
  const containerRef = useRef(null);
  const [widgetInstance, setWidgetInstance] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    // Skip if no container or widget class
    if (!containerRef.current || !dojoWidgetClass) {
      return;
    }

    let widget = null;
    let isDestroyed = false;

    // Function to create the widget
    const createWidget = () => {
      // Check if we have access to Dojo
      if (typeof dojoWidgetClass !== 'function') {
        console.error('DojoWidgetAdapter: Widget class is not a constructor', dojoWidgetClass);
        setLoadError('Widget class is not a function');
        return;
      }

      try {
        // Create the widget
        widget = new dojoWidgetClass(widgetProps, containerRef.current);
        
        // Start the widget
        if (typeof widget.startup === 'function') {
          widget.startup();
        }
        
        setWidgetInstance(widget);
        
        // Call the callback if provided
        if (typeof onWidgetCreated === 'function') {
          onWidgetCreated(widget);
        }
      } catch (err) {
        console.error('DojoWidgetAdapter: Error creating widget', err);
        setLoadError(err.message || 'Error creating widget');
      }
    };

    // Try to get the AMD loader
    const dojoRequire = window.dojoRequire || window.require;
    
    if (dojoRequire && typeof dojoRequire === 'function') {
      // Make sure Dojo is ready
      dojoRequire(['dojo/ready'], function(ready) {
        ready(function() {
          if (!isDestroyed) {
            createWidget();
          }
        });
      });
    } else {
      // If no AMD loader, try direct creation
      createWidget();
    }

    // Cleanup function
    return () => {
      isDestroyed = true;
      
      if (widget) {
        try {
          // Destroy the widget if it has a destroy method
          if (typeof widget.destroyRecursive === 'function') {
            widget.destroyRecursive();
          } else if (typeof widget.destroy === 'function') {
            widget.destroy();
          }
        } catch (err) {
          console.warn('DojoWidgetAdapter: Error destroying widget', err);
        }
      }
    };
  }, [dojoWidgetClass]); // Only re-run if the widget class changes

  // Update widget properties when they change
  useEffect(() => {
    if (widgetInstance) {
      try {
        // Update widget properties if the widget has a set method
        if (typeof widgetInstance.set === 'function') {
          Object.entries(widgetProps).forEach(([key, value]) => {
            widgetInstance.set(key, value);
          });
        }
      } catch (err) {
        console.warn('DojoWidgetAdapter: Error updating widget props', err);
      }
    }
  }, [widgetProps, widgetInstance]);

  // Display an error if the widget failed to load
  if (loadError) {
    return (
      <div className={`dojo-widget-error ${className || ''}`} style={{ color: 'red', ...style }}>
        Error loading Dojo widget: {loadError}
      </div>
    );
  }

  // Return a div that will be the container for the Dojo widget
  return (
    <div 
      ref={containerRef} 
      className={`dojo-widget-container ${className || ''}`}
      style={style}
      {...otherProps}
    />
  );
};

/**
 * Example usage of DojoWidgetAdapter with a Dojo Button
 */
export const DojoButton = ({ label, onClick, ...props }) => {
  const handleWidgetCreated = (widget) => {
    if (widget && typeof onClick === 'function') {
      widget.on('click', onClick);
    }
  };

  return (
    <DojoWidgetAdapter
      dojoWidgetClass={window.dijit?.form?.Button}
      widgetProps={{ label }}
      onWidgetCreated={handleWidgetCreated}
      {...props}
    />
  );
};

/**
 * Example usage of DojoWidgetAdapter with a Dojo TextBox
 */
export const DojoTextBox = ({ value, onChange, placeholder, ...props }) => {
  const handleWidgetCreated = (widget) => {
    if (widget && typeof onChange === 'function') {
      widget.on('change', (newValue) => {
        onChange(newValue);
      });
    }
  };

  return (
    <DojoWidgetAdapter
      dojoWidgetClass={window.dijit?.form?.TextBox}
      widgetProps={{ value, placeHolder: placeholder }}
      onWidgetCreated={handleWidgetCreated}
      {...props}
    />
  );
}; 