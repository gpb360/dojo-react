import React, { useRef, useEffect, useState } from 'react';
import { ensureDojo, safeDestroyWidget } from './DojoUtils';

/**
 * React component that wraps a Dojo TextBox
 */
const DojoTextBoxAdapter = ({ value, onChange, disabled = false, placeholder = '', className, style, ...props }) => {
  // Ref to hold the widget instance and its container
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  // Start with fallback true to show something immediately
  const [useFallback, setUseFallback] = useState(true);

  // Create the Dojo TextBox widget when the component mounts
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
        if (!window.dijit || !window.dijit.form || !window.dijit.form.TextBox) {
          console.warn(`Dojo TextBox widget constructor not found (attempt ${retryCount + 1}/${maxRetries})`);
          
          // Retry a few times with increasing delays
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(initializeWidget, 1000 * retryCount);
            return;
          }
          
          console.error('Failed to find Dojo TextBox constructor after multiple attempts');
          return; // Keep fallback UI active
        }
        
        try {
          // Create the textbox directly using the global constructor
          const dojoTextBox = new window.dijit.form.TextBox({
            value: value || '',
            disabled: disabled,
            placeHolder: placeholder,
            intermediateChanges: true,
            onChange: onChange
          }, containerRef.current);
          
          // Call startup to initialize the widget
          dojoTextBox.startup();
          
          // Store the widget reference
          widgetRef.current = dojoTextBox;
          console.log('Dojo TextBox widget created successfully');
          
          // Now that we have a working widget, disable the fallback
          setUseFallback(false);
        } catch (e) {
          console.error('Failed to create Dojo TextBox:', e);
          // Keep fallback active
        }
      } catch (error) {
        console.error('Failed to initialize Dojo TextBox:', error);
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
      if (value !== undefined) {
        widgetRef.current.set('value', value);
      }
      
      if (disabled !== undefined) {
        widgetRef.current.set('disabled', disabled);
      }
      
      if (placeholder !== undefined) {
        widgetRef.current.set('placeHolder', placeholder);
      }
      
      if (onChange !== undefined) {
        widgetRef.current.set('onChange', onChange);
      }
    }
  }, [value, onChange, disabled, placeholder]);

  // If we need to use fallback, render a standard input
  if (useFallback) {
    return (
      <input 
        type="text"
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={className}
        style={{
          padding: '4px 8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '100%',
          ...style
        }}
      />
    );
  }

  // Render a container for the Dojo widget
  return <div ref={containerRef} className={className} style={style} />;
};

export default DojoTextBoxAdapter; 