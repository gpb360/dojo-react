import { registerApplication, start, setMountMaxTime, setBootstrapMaxTime, setUnmountMaxTime } from 'single-spa';

// Configure global timeout settings - increase bootstrap timeout
setMountMaxTime(6000, false, 2000); // 6s timeout, don't die on timeout, 2s warnings
setBootstrapMaxTime(6000, false, 2000); // 6s timeout, don't die on timeout, 2s warnings 
setUnmountMaxTime(3000, false, 1500); // 3s timeout, don't die on timeout, 1.5s warnings

// Set a flag to indicate root-config has loaded
window.rootConfigLoaded = true;
console.log('Root config loaded at:', new Date().toISOString());

// Function to check if Dojo is available
function checkDojoAvailability() {
  console.log('Checking Dojo availability:');
  console.log('  - window.dojo:', typeof window.dojo);
  console.log('  - window.dijit:', typeof window.dijit);
  console.log('  - window.dojoRequire:', typeof window.dojoRequire);
  console.log('  - window.require:', typeof window.require);
  
  // First check if dojo is properly initialized as an object with functions
  if (window.dojo && typeof window.dojo === 'object') {
    // Check for a few key functions that should be available in a proper dojo initialization
    if (typeof window.dojo.ready === 'function' || 
        typeof window.dojo.byId === 'function' || 
        typeof window.dojo.query === 'function') {
      console.log('  - Properly initialized Dojo detected');
      return true;
    }
  }
  
  // Next check for the AMD loader (dojoRequire or require)
  if (window.dojoRequire && typeof window.dojoRequire === 'function') {
    console.log('  - dojoRequire function detected');
    return true;
  }
  
  if (window.require && typeof window.require === 'function') {
    console.log('  - AMD require function detected');
    return true;
  }
  
  console.log('  - No properly initialized Dojo detected');
  return false;
}

// Try to preload Dojo if needed
function ensureDojoAvailable() {
  return new Promise((resolve) => {
    if (checkDojoAvailability()) {
      console.log('Dojo already available');
      
      // Make sure dojoRequire is set if it's not already but we have require
      if (!window.dojoRequire && window.require && typeof window.require === 'function') {
        console.log('Setting window.dojoRequire from window.require');
        window.dojoRequire = window.require;
      }
      
      resolve(true);
      return;
    }
    
    // If dojo global object exists but isn't fully initialized
    if (window.dojo && typeof window.dojo === 'object' && 
        !(typeof window.dojo.ready === 'function' || 
          typeof window.dojo.byId === 'function' || 
          typeof window.dojo.query === 'function')) {
      console.log('Dojo object exists but is not fully initialized');
      
      // If we have require function available, try to initialize
      const requireFn = window.dojoRequire || window.require;
      if (requireFn && typeof requireFn === 'function') {
        try {
          console.log('Attempting to initialize Dojo with requireFn');
          requireFn(['dojo/ready', 'dojo/dom', 'dojo/query'], function(ready, dom, query) {
            // Assign key functions to dojo global if they don't exist
            if (!window.dojo.ready && ready) window.dojo.ready = ready;
            if (!window.dojo.byId && dom && dom.byId) window.dojo.byId = dom.byId;
            if (!window.dojo.query && query) window.dojo.query = query;
            
            console.log('Successfully initialized Dojo');
            resolve(true);
          });
          return;
        } catch (e) {
          console.error('Error initializing Dojo:', e);
        }
      }
    }
    
    // If Dojo is not loaded, resolve anyway after a timeout
    // The application will handle this case with fallback implementation
    console.warn('Dojo not available, continuing without preloading');
    setTimeout(() => resolve(false), 200); // Reduce timeout to avoid delaying start()
  });
}

// Helper function for handling app loading errors
function createErrorApp(appName, error) {
  console.error(`Error loading ${appName}:`, error);
  return {
    bootstrap: async () => {
      console.log(`Fallback bootstrap for ${appName}`);
    },
    mount: async () => {
      const appContainer = document.getElementById('app');
      if (appContainer) {
        appContainer.innerHTML = `
          <div style="padding: 20px; border: 1px solid #ff6b6b; background: #ffeeee; border-radius: 5px; margin: 20px auto; max-width: 800px;">
            <h2>Application Error</h2>
            <p>The ${appName} could not be loaded.</p>
            <p>Error: ${error.message || 'Unknown error'}</p>
            <button onclick="window.location.reload()" style="padding: 8px 16px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Reload
            </button>
          </div>
        `;
      }
    },
    unmount: async () => {
      console.log(`Fallback unmount for ${appName}`);
      const appContainer = document.getElementById('app');
      if (appContainer) {
        appContainer.innerHTML = '';
      }
    }
  };
}

// Check if Dojo is available and log the status
const isDojoAvailable = () => {
  // Check for a properly initialized dojo object with key methods
  if (window.dojo && typeof window.dojo === 'object') {
    if (typeof window.dojo.ready === 'function' || 
        typeof window.dojo.byId === 'function' || 
        typeof window.dojo.query === 'function') {
      return true;
    }
  }
  
  // Check for AMD loader
  return !!(window.dojoRequire && typeof window.dojoRequire === 'function') || 
         !!(window.require && typeof window.require === 'function');
};

// Register the Dojo application - do this immediately, don't wait for DOM
console.log('Registering Dojo application');
registerApplication({
  name: 'dojo-app',
  app: () => import('./app/modules/dojo-app.js')
    .catch(error => createErrorApp('Dojo Application', error)),
  activeWhen: location => location.pathname.startsWith('/dojo-app') || location.hash.startsWith('#/dojo') || location.hash === '' || location.hash === '#/',
  customProps: { 
    domElementGetter: () => document.getElementById('app'), // Use a function to get the element when needed
    isDojoAvailable: isDojoAvailable() 
  }
});

// Register the Simple React application
console.log('Registering Simple React application');
registerApplication({
  name: 'simple-react-app',
  app: () => import('./app/modules/simple-react-app.js')
    .catch(error => createErrorApp('Simple React Application', error)),
  activeWhen: location => location.pathname.startsWith('/simple-react') || location.hash.startsWith('#/simple-react'),
  customProps: {
    domElementGetter: () => document.getElementById('app')
  }
});

// Register the Hybrid React application
console.log('Registering Hybrid React application');
registerApplication({
  name: 'hybrid-react-app',
  app: () => import('./app/modules/hybrid-react-app.js')
    .catch(error => createErrorApp('Hybrid React Application', error)),
  activeWhen: location => location.pathname.startsWith('/hybrid-react') || location.hash.startsWith('#/hybrid-react'),
  customProps: {
    domElementGetter: () => document.getElementById('app'),
    isDojoAvailable: isDojoAvailable()
  }
});

// IMPORTANT: Call start() immediately, as required by single-spa
console.log('Starting single-spa applications');
start({
  urlRerouteOnly: true,
});

// Wait for DOM to be ready for any DOM-dependent operations
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, ensuring prerequisites');
  
  // Run any DOM-dependent code here
  // But don't delay the single-spa start() call
  ensureDojoAvailable().then((available) => {
    console.log('Dojo availability check complete:', available ? 'Available' : 'Not available');
  });
});

// Add debugging to help troubleshoot Dojo loading issues
window.addEventListener('single-spa:before-mount-routing-event', () => {
  console.log('single-spa: before mount routing event');
});

window.addEventListener('single-spa:routing-event', () => {
  console.log('single-spa: routing event');
});

window.addEventListener('single-spa:app-change', (evt) => {
  console.log('single-spa: app change', evt.detail);
});

window.addEventListener('single-spa:no-app-change', () => {
  console.log('single-spa: no app change');
});

// Add a global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught by single-spa:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection caught by single-spa:', event.reason);
});

// Debug function to check Dojo availability
window.checkDojoStatus = () => {
  console.log('Dojo availability check:');
  console.log('  - window.dojo:', typeof window.dojo, window.dojo ? 'Available' : 'Not available');
  console.log('  - window.dijit:', typeof window.dijit, window.dijit ? 'Available' : 'Not available');
  console.log('  - window.dojoRequire:', typeof window.dojoRequire, window.dojoRequire ? 'Available' : 'Not available');
  console.log('  - window.require:', typeof window.require, window.require ? 'Available' : 'Not available');
  
  // Check if dojo is properly initialized
  if (window.dojo && typeof window.dojo === 'object') {
    console.log('  - Dojo object properties:');
    console.log('    - dojo.ready:', typeof window.dojo.ready);
    console.log('    - dojo.byId:', typeof window.dojo.byId);
    console.log('    - dojo.query:', typeof window.dojo.query);
    console.log('    - dojo.version:', window.dojo.version ? window.dojo.version.toString() : 'Unknown');
    
    // Check if it appears to be properly initialized
    const isProperlyInitialized = typeof window.dojo.ready === 'function' || 
                                  typeof window.dojo.byId === 'function' || 
                                  typeof window.dojo.query === 'function';
    console.log('  - Dojo properly initialized:', isProperlyInitialized ? 'Yes' : 'No');
  }
  
  // Check AMD loader
  if (window.dojoRequire && typeof window.dojoRequire === 'function') {
    console.log('  - dojoRequire is a function');
    
    if (window.dojoRequire.rawConfig) {
      console.log('  - dojoRequire config:', window.dojoRequire.rawConfig);
    }
  }
  
  if (window.require && typeof window.require === 'function') {
    console.log('  - require is a function');
    
    if (window.require.rawConfig) {
      console.log('  - require config:', window.require.rawConfig);
    }
  }
  
  // Overall status
  console.log('  - Overall Dojo availability:', isDojoAvailable() ? 'Available' : 'Not available');
}; 