const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "path": false,
      "fs": false,
      "crypto": false,
      "util": false,
      "stream": false,
      "constants": false,
      "assert": false,
      "os": false,
      "process": false,
      "buffer": false
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9001,
    open: {
      target: ['index.html']
    },
    proxy: [{
      context: ['/api'],
      target: 'http://localhost:3000'
    }]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '' }
      ]
    }),
  ],
  externals: {
    phaser: 'Phaser'
  },
  mode: 'development'
};