import React, { useRef, useEffect, useState } from 'react';
import { ensureDojo, safeDestroyWidget } from './DojoUtils';

/**
 * React component that wraps a Dojo CheckBox
 */
const DojoCheckboxAdapter = ({ checked = false, onChange, disabled = false, label = '', className, style, ...props }) => {
  // Ref to hold the widget instance and its container
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  // Start with fallback true to show something immediately
  const [useFallback, setUseFallback] = useState(true);

  // Create the Dojo CheckBox widget when the component mounts
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const initializeWidget = async () => {
      try {
        // Ensure Dojo is ready before creating widgets
        await ensureDojo();
        
        // Only proceed if component is still mounted
        if (!isMounted || !containerRef.current) return;
        
        // Check if global dojo is available
        if (!window.dijit || !window.dijit.form || !window.dijit.form.CheckBox) {
          console.warn(`Dojo CheckBox widget constructor not found (attempt ${retryCount + 1}/${maxRetries})`);
          
          // Retry a few times with increasing delays
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(initializeWidget, 1000 * retryCount);
            return;
          }
          
          console.error('Failed to find Dojo CheckBox constructor after multiple attempts');
          return; // Keep fallback UI active
        }
        
        try {
          // Create the checkbox directly using the global constructor
          const dojoCheckBox = new window.dijit.form.CheckBox({
            checked: checked,
            disabled: disabled,
            onChange: function(isChecked) {
              if (onChange) {
                onChange(isChecked);
              }
            }
          }, containerRef.current);
          
          // Call startup to initialize the widget
          dojoCheckBox.startup();
          
          // Store the widget reference
          widgetRef.current = dojoCheckBox;
          
          // Add label if provided
          if (label) {
            const labelNode = document.createElement('label');
            labelNode.innerHTML = label;
            labelNode.style.marginLeft = '5px';
            containerRef.current.appendChild(labelNode);
          }
          
          console.log('Dojo CheckBox widget created successfully');
          
          // Now that we have a working widget, disable the fallback
          setUseFallback(false);
        } catch (e) {
          console.error('Failed to create Dojo CheckBox:', e);
          // Keep fallback active
        }
      } catch (error) {
        console.error('Failed to initialize Dojo CheckBox:', error);
        // Keep fallback active
      }
    };

    // Start the initialization process, but don't wait for it
    initializeWidget();

    // Clean up when component unmounts
    return () => {
      isMounted = false;
      
      if (widgetRef.current) {
        safeDestroyWidget(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // Update widget properties when props change
  useEffect(() => {
    if (widgetRef.current) {
      if (checked !== undefined) {
        widgetRef.current.set('checked', checked);
      }
      
      if (disabled !== undefined) {
        widgetRef.current.set('disabled', disabled);
      }
    }
  }, [checked, disabled]);

  // If we need to use fallback, render a standard checkbox
  if (useFallback) {
    return (
      <div className={className} style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
        <input 
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange && onChange(e.target.checked)}
          disabled={disabled}
          style={{ margin: '2px' }}
        />
        {label && <label style={{ marginLeft: '5px' }}>{label}</label>}
      </div>
    );
  }

  // Render a container for the Dojo widget
  return <div ref={containerRef} className={className} style={style} />;
};

export default DojoCheckboxAdapter; 