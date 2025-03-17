import React, { useRef, useEffect, useState } from 'react';
import { ensureDojo, safeDestroyWidget } from './DojoUtils';

/**
 * React component that wraps a Dojo Button
 */
const DojoButtonAdapter = ({ label, onClick, disabled = false, className, style, ...props }) => {
  // Ref to hold the widget instance and its container
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  // Start with fallback true to show something immediately
  const [useFallback, setUseFallback] = useState(true);

  // Create the Dojo Button widget when the component mounts
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
        
        // Check if dojoRequire is available
        if (!window.dojoRequire) {
          console.warn(`dojoRequire not found (attempt ${retryCount + 1}/${maxRetries})`);
          
          // Retry a few times with increasing delays
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(initializeWidget, 1000 * retryCount);
            return;
          }
          
          console.error('Failed to find dojoRequire after multiple attempts');
          return; // Keep fallback UI active
        }
        
        try {
          // Create the button using dojoRequire
          window.dojoRequire(['dijit/form/Button'], (Button) => {
            if (!isMounted || !containerRef.current) return;
            
            const dojoButton = new Button({
              label: label || 'Button',
              disabled: disabled,
              onClick: onClick,
              ...props
            }, containerRef.current);
            
            // Call startup to initialize the widget
            dojoButton.startup();
            
            // Store the widget reference
            widgetRef.current = dojoButton;
            console.log('Dojo Button widget created successfully');
            
            // Now that we have a working widget, disable the fallback
            setUseFallback(false);
          });
        } catch (e) {
          console.error('Failed to create Dojo Button:', e);
          // Keep fallback active
        }
      } catch (error) {
        console.error('Failed to initialize Dojo Button:', error);
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
      if (label !== undefined) {
        widgetRef.current.set('label', label);
      }
      
      if (disabled !== undefined) {
        widgetRef.current.set('disabled', disabled);
      }
      
      if (onClick !== undefined) {
        widgetRef.current.set('onClick', onClick);
      }
    }
  }, [label, onClick, disabled]);

  // If we need to use fallback, render a standard button
  if (useFallback) {
    return (
      <button 
        onClick={onClick}
        disabled={disabled}
        className={className}
        style={{
          padding: '4px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: disabled ? '#f0f0f0' : '#f8f8f8',
          cursor: disabled ? 'not-allowed' : 'pointer',
          ...style
        }}
      >
        {label || 'Button'}
      </button>
    );
  }

  // Render a container for the Dojo widget
  return <div ref={containerRef} className={className} style={style} />;
};

export default DojoButtonAdapter; 