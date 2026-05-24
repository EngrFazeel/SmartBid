const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './index.web.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },

  resolve: {
    extensions: [
      '.web.js',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
    ],

    alias: {
      'react-native$': 'react-native-web',
    },

    fallback: {
      process: require.resolve('process/browser'),
      buffer: require.resolve('buffer'),
    },

    // 👇 Disable Webpack 5’s strict ESM import extensions
    fullySpecified: false,
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        // 👇 Transpile these packages even though they are in node_modules
        exclude: /node_modules\/(?!(react-native-vector-icons|react-native-image-picker|@react-navigation)\/).*/,
        use: {
          loader: 'babel-loader',
        },
      },

      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },

      {
        test: /\.(mp4|mov)$/i,
        type: 'asset/resource',
      },

      {
        test: /\.(ttf|woff|woff2|eot|svg)$/,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),

    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],

  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
};