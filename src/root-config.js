import { registerApplication, start } from 'single-spa';

// Set a flag to indicate root-config has loaded
window.rootConfigLoaded = true;
console.log('Root config loaded at:', new Date().toISOString());

// Log Dojo status for debugging
console.log('Dojo status:', window.__dojoStatus || 'Not available');

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
  if (window.__dojoStatus && window.__dojoStatus.widgetsReady) {
    console.log('Dojo is available, all applications can be loaded');
    return true;
  }
  console.warn('Dojo not fully loaded, some applications may have limited functionality');
  return false;
};

// Register the Dojo application
console.log('Registering Dojo application');
registerApplication({
  name: 'dojo-app',
  app: () => import('./app/modules/dojo-app.js')
    .catch(error => createErrorApp('Dojo Application', error)),
  activeWhen: (location) => location.hash.startsWith('#/dojo') || location.hash === '' || location.hash === '#/',
  customProps: { isDojoAvailable: isDojoAvailable() }
});

// Register the Simple React application
console.log('Registering Simple React application');
registerApplication({
  name: 'simple-react',
  app: () => import('./app/modules/simple-react-app.js')
    .catch(error => createErrorApp('Simple React Application', error)),
  activeWhen: (location) => location.hash.startsWith('#/simple-react'),
});

// Register the Hybrid React+Dojo application
console.log('Registering Hybrid React+Dojo application');
registerApplication({
  name: 'hybrid-react',
  app: () => import('./app/modules/hybrid-react-app.js')
    .catch(error => createErrorApp('Hybrid React+Dojo Application', error)),
  activeWhen: (location) => location.hash.startsWith('#/hybrid-react'),
  customProps: { isDojoAvailable: isDojoAvailable() }
});

// Add navigation event listener to update active class
window.addEventListener('single-spa:routing-event', () => {
  // Update active navigation link
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
    const linkPath = link.getAttribute('href');
    if (window.location.hash.startsWith(linkPath)) {
      link.classList.add('active');
    }
  });
});

// Default route
window.addEventListener('single-spa:no-app-change', () => {
  if (location.hash === '' || location.hash === '#') {
    location.hash = '#/dojo';
  }
});

// Start the single-spa apps
console.log('Starting single-spa applications');
start({
  urlRerouteOnly: true,
}); 