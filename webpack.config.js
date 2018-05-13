const resolve = require('path').resolve;
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    site: './js/site.js',
    'mr-bug-goes-to-town': './js/notations/mr-bug.js',
    'a-chairy-tale': './js/notations/chairy-tale.js',
    'tango': './js/notations/tango.js',
    'sisisisisisisisisisisi': './js/notations/sisisi.js'
  },
  output: {
    path: resolve(__dirname, 'src', 'js'),
    filename: '[name].[chunkhash:4].js'
  },
  plugins: [
    new ManifestPlugin(),
    new CleanWebpackPlugin(['src/js/*.*', 'build/js/*.*'], {
      root: resolve(__dirname, 'src', 'js'),
      exclude: ['ddd.min.js', 'ddd.min.js.map', 'vendor/*.*']
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        loader: 'babel-loader',
        options: {
          presets: ['env'],
          plugins: ['transform-class-properties']
        }
      }
    ]
  }
};
