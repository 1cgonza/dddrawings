const resolve = require('path').resolve;
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const fs = require('fs');

const entries = (function(base) {
  let ret = {
    site: './js/site.js'
  };

  function appendEntries(folder) {
    let folders = fs.readdirSync(base + folder);
    folders.forEach(function(name) {
      ret[name] = base + folder + '/' + name + '/index.js';
    });
  }

  appendEntries('/lab');
  appendEntries('/notations');

  return ret;
})('./js');

module.exports = {
  entry: entries,
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
