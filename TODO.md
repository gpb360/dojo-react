# DojotoReact TODO List

## HTML Configuration Options

### Switching between local and CDN-based resources

The project currently supports two HTML configuration options:

1. **Local resources** (currently active): Using local node_modules for Dojo and dependencies
   - File: `/index.html`
   - Used in webpack.config.js with `template: './index.html'`

2. **CDN-based resources**: Using CDN links for Dojo and dependencies
   - File: `/src/cdn_based_index.html`
   - To use CDN resources, update webpack.config.js:

```javascript
plugins: [
  new HtmlWebpackPlugin({
    template: './src/cdn_based_index.html',  // Instead of './index.html'
    inject: false
  }),
  // Other plugins...
]
```

## Testing

The project includes tests using React Testing Library and Jest. To run the tests:

```
npm test               # Run tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

Current test coverage includes:
- Component tests for React components (TaskInput, TaskItem, PureReactTaskList)
- Tests for DojoButtonAdapter showing adapter pattern testing approach
- Mocks for Dojo dependencies to isolate component testing

### Test Files:
- `/src/tests/components/TaskInput.test.jsx`
- `/src/tests/components/TaskItem.test.jsx`
- `/src/tests/components/PureReactTaskList.test.jsx`
- `/src/tests/components/DojoButtonAdapter.test.jsx`

## Future Enhancements

- [x] Add React Testing Library and Jest for component testing
- [x] Create additional Dojo widget adapters for more complex components
- [ ] Add TypeScript type definitions for adapters
- [x] Optimize build configuration for production deployment
- [ ] Add continuous integration setup
- [ ] Add error boundary components to all microfrontends
- [ ] Implement lazy loading for performance optimization

## Documentation

- [x] Document each adapter with usage examples
- [ ] Add diagrams showing the migration process flow
- [x] Create a troubleshooting guide for common issues
- [ ] Add performance comparison metrics between Dojo and React implementations

## Code Quality

- [ ] Add ESLint configuration
- [ ] Set up Prettier for consistent code formatting
- [x] Add PropTypes or TypeScript typing to React components
- [x] Implement more robust error handling in adapter components
- [ ] Add automated accessibility testing

## UI Improvements

- [ ] Create a more consistent visual design between Dojo and React components
- [ ] Improve mobile responsiveness
- [ ] Add dark mode theme support 