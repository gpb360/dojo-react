# Dojo to React Migration Monorepo

A comprehensive monorepo for migrating from Dojo to React using single-spa microfrontends.

## Overview

This monorepo contains adapters and utilities that help migrate Dojo applications to React using the single-spa microfrontend framework. It allows you to run Dojo and React applications side by side during the migration process.

## Repository Structure

```
dojo-to-react-monorepo/
├── packages/
│   ├── single-spa-dojo/      - Dojo adapter for single-spa
│   ├── single-spa-react/     - React adapter for single-spa
│   └── shared/               - Shared utilities for migration
├── examples/
│   ├── dojo-app/             - Example pure Dojo application
│   ├── react-app/            - Example pure React application
│   └── hybrid-app/           - Example hybrid Dojo+React application
```

## Packages

### single-spa-dojo

A helper library that implements single-spa lifecycle functions (bootstrap, mount, and unmount) for Dojo applications.

```javascript
import { renderer } from "@dojo/framework/core/vdom";
import { v, w } from "@dojo/framework/widget-core/d";
import singleSpaDojo from "@dojotoreact/single-spa-dojo";
import App from "./app";

const dojoLifecycles = singleSpaDojo({
  renderer,
  v,
  w,
  appComponent: App,
  mountOptions: {
    registry: myRegistry,
    domNode: document.getElementById("myContainer"),
    sync: true,
  },
});

export const bootstrap = dojoLifecycles.bootstrap;
export const mount = dojoLifecycles.mount;
export const unmount = dojoLifecycles.unmount;
```

### single-spa-react

A helper library that implements single-spa lifecycle functions for React applications.

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from "@dojotoreact/single-spa-react";
import App from "./App";

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err, info, props) {
    return <div>Error occurred: {err.message}</div>;
  }
});

export const bootstrap = reactLifecycles.bootstrap;
export const mount = reactLifecycles.mount;
export const unmount = reactLifecycles.unmount;
```

### shared

Shared utilities for Dojo to React migration.

## Migration Strategy

This monorepo supports a three-phase migration strategy:

1. **Dojo App**: The original Dojo application (starting point)
2. **Hybrid React+Dojo**: React application that uses real Dojo widgets through adapters
3. **Pure React App**: Fully migrated React application (end goal)

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dojo-to-react-monorepo.git
cd dojo-to-react-monorepo

# Install dependencies using pnpm
pnpm install

# Build all packages
pnpm build
```

### Running Examples

```bash
# Run the Dojo example
cd examples/dojo-app
pnpm start

# Run the React example
cd examples/react-app
pnpm start

# Run the hybrid example
cd examples/hybrid-app
pnpm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 