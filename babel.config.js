module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react'
  ],
  // Add this to handle dynamic imports and other advanced features
  plugins: []
}; 