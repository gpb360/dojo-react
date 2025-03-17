const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/root-config.js',
  output: {
    filename: 'root-config.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    libraryTarget: 'system'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      app: path.resolve(__dirname, 'src/app/'),
      adapters: path.resolve(__dirname, 'src/app/modules/adapters/')
    },
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: false
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'node_modules/dojo', to: 'node_modules/dojo' },
        { from: 'node_modules/dijit', to: 'node_modules/dijit' },
        { from: 'css', to: 'css' }
      ]
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.WEBPACK_MODE': JSON.stringify(process.env.WEBPACK_MODE || 'development')
    })
  ],
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9002,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    }
  },
  externals: [
    'single-spa',
    'react',
    'react-dom',
    'dojo',
    'dijit'
  ],
  devtool: 'source-map'
}; 