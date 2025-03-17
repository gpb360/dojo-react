import React, { useEffect, useRef } from 'react';

const DojoCheckboxAdapter = ({ checked = false, onChange }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  
  useEffect(() => {
    // Load Dojo dependencies
    if (typeof require !== 'undefined') {
      require(['dijit/form/CheckBox'], function(CheckBox) {
        // Create checkbox widget
        if (containerRef.current && !widgetRef.current) {
          widgetRef.current = new CheckBox({
            checked: checked,
            onChange: function(isChecked) {
              if (onChange) {
                onChange(isChecked);
              }
            }
          });
          
          widgetRef.current.placeAt(containerRef.current);
          widgetRef.current.startup();
        }
      });
    }
    
    // Cleanup function
    return () => {
      if (widgetRef.current) {
        if (widgetRef.current.destroyRecursive) {
          widgetRef.current.destroyRecursive();
        }
        widgetRef.current = null;
      }
    };
  }, []);
  
  // Update checked state when props change
  useEffect(() => {
    if (widgetRef.current) {
      widgetRef.current.set('checked', checked);
    }
  }, [checked]);
  
  return <div ref={containerRef} className="dojo-checkbox-container"></div>;
};

export default DojoCheckboxAdapter; 