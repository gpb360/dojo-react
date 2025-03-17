const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
    })
  ],
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    headers: {
      "Access-Control-Allow-Origin": "*"
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