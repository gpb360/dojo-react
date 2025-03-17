# Dojo to React Migration Toolkit (DojotoReact)

**DojotoReact** is a comprehensive toolkit and reference implementation for migrating legacy Dojo applications to modern React using a microfrontend architecture with single-spa. It demonstrates a practical, incremental migration path that allows Dojo and React components to coexist during the transition.

Key features:
- Real Dojo widget adapters with proper lifecycle management
- Three migration phases: Dojo → Hybrid React+Dojo → Pure React
- Microfrontend architecture using single-spa
- Complete migration strategy with documentation

This repository serves as both a working example and a blueprint for organizations migrating large-scale Dojo applications to React.

---

# Dojo to React Migration with single-spa

This project demonstrates a comprehensive migration path from a legacy Dojo application to React using the single-spa microfrontend framework. It allows you to run Dojo and React applications side by side while gradually migrating components.

## Project Overview

This project showcases a complete migration strategy with three distinct stages:

1. **Dojo App**: The original Dojo application (starting point)
2. **Hybrid React+Dojo**: A React application that uses real Dojo widgets through proper adapters (transition phase)
3. **Pure React App**: A fully migrated React application with modern patterns (end goal)

## Enhanced Project Structure

```
├── src/
│   ├── root-config.js (single-spa root configuration)
│   ├── app/
│   │   ├── modules/
│   │   │   ├── dojo-app.js (Original Dojo application)
│   │   │   ├── hybrid-react-app.js (React app with real Dojo widgets)
│   │   │   ├── simple-react-app.js (Fully migrated React application)
│   │   │   ├── adapters/
│   │   │   │   ├── DojoAdapterRegistry.js (Centralized adapter registry)
│   │   │   │   ├── DojoButtonAdapter.jsx (React wrapper for Dojo Button)
│   │   │   │   ├── DojoTextBoxAdapter.jsx (React wrapper for Dojo TextBox)
│   │   │   │   └── DojoCheckboxAdapter.jsx (React wrapper for Dojo Checkbox)
│   │   │   └── components/
│   │   │       └── PureReactTaskList.jsx (Example of fully migrated component)
├── css/
│   └── shared-styles.css (Shared styles for all applications)
├── index.html (Main HTML file)
├── MIGRATION.md (Detailed migration strategy documentation)
├── webpack.config.js
└── package.json
```

## Migration Applications

This project includes three main applications that demonstrate different phases of the migration journey:

1. **Dojo App**: The original Dojo application that we're migrating from
   - Pure Dojo implementation
   - Uses direct DOM manipulation
   - Traditional Dojo event handling

2. **Hybrid React+Dojo App**: Transition phase application that shows how to integrate real Dojo widgets in React
   - React application structure
   - Uses real Dojo widgets wrapped in React components
   - Proper lifecycle management of Dojo widgets
   - Two-way data binding between React state and Dojo widgets
   - Error boundaries with fallback UI

3. **Simple React App**: Fully migrated React application
   - Pure React implementation
   - Modern React patterns (hooks, memo, etc.)
   - Performance optimizations
   - Clean component architecture

## Key Features

- **Real Dojo Widget Integration**: Proper wrapper components that use actual Dojo widgets, not just styled HTML
- **Complete Lifecycle Management**: Proper initialization and destruction of Dojo widgets
- **Two-way Data Binding**: Synchronization between React state and Dojo widget properties
- **Error Handling**: Robust error boundaries with fallback UI components
- **Migration Documentation**: Comprehensive strategy for large-scale applications

## Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open a browser and navigate to `http://localhost:9000`

## How the Migration Works

### Phase 1: Adapter Creation

The first step is to create proper React adapters for Dojo widgets. These adapters:

1. Initialize real Dojo widgets when a React component mounts
2. Handle proper cleanup when the React component unmounts
3. Update Dojo widget properties when React props change
4. Bubble up Dojo events to React event handlers
5. Provide fallback UI when widgets fail to load

Example adapter:

```jsx
const DojoButtonAdapter = ({ label, onClick, disabled = false }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  
  // Initialize widget on mount
  useEffect(() => {
    // Widget initialization logic...
    
    return () => {
      // Cleanup logic...
    };
  }, []);
  
  // Update widget when props change
  useEffect(() => {
    if (widgetRef.current) {
      widgetRef.current.set('label', label);
      widgetRef.current.set('disabled', disabled);
    }
  }, [label, disabled]);
  
  return <div ref={containerRef}></div>;
};
```

### Phase 2: Hybrid Application

The hybrid application demonstrates how to:

1. Use React for overall application structure
2. Integrate Dojo widgets where needed
3. Manage state in React and pass it to Dojo widgets
4. Handle Dojo widget events in React components

### Phase 3: Pure React Implementation

The final stage shows a fully migrated component with:

1. Modern React patterns (functional components, hooks)
2. Performance optimizations (memo, useCallback, useMemo)
3. Clean component architecture
4. No Dojo dependencies

## Detailed Migration Strategy

See the [MIGRATION.md](MIGRATION.md) file for a comprehensive step-by-step guide on migrating a large-scale Dojo application to React.

## License

MIT 