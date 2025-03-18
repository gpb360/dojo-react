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

## Future Enhancements

- [ ] Add comprehensive test coverage for all components
- [ ] Create additional Dojo widget adapters for more complex components
- [ ] Add TypeScript type definitions for adapters
- [ ] Optimize build configuration for production deployment
- [ ] Add continuous integration setup

## Documentation

- [ ] Document each adapter with usage examples
- [ ] Add diagrams showing the migration process flow
- [ ] Create a troubleshooting guide for common issues

## Code Quality

- [ ] Add ESLint configuration
- [ ] Set up Prettier for consistent code formatting
- [ ] Add PropTypes or TypeScript typing to React components 