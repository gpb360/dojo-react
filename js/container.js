import { registerApplication, start } from 'single-spa';

// Helper function to load modules
function loadModule(name) {
  return async () => {
    try {
      const module = await import(`./${name}.js`);
      return module.default || module;
    } catch (error) {
      console.error(`Error loading ${name}:`, error);
      throw error;
    }
  };
}

// Register the existing Dojo application
registerApplication({
  name: 'dojo-tasks',
  app: loadModule('dojo-app'),
  activeWhen: (location) => location.hash.startsWith('#/dojo')
});

// Register the new React application
registerApplication({
  name: 'react-tasks',
  app: loadModule('react-app'),
  activeWhen: (location) => location.hash.startsWith('#/react')
});

// Register the hybrid page
registerApplication({
  name: 'hybrid-tasks',
  app: loadModule('hybrid-page'),
  activeWhen: (location) => location.hash.startsWith('#/hybrid')
});

// Set default route if none is specified
if (!window.location.hash) {
  window.location.hash = '#/dojo';
}

// Start the single-spa orchestrator
start(); 