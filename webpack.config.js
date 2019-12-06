const { resolve } = require('path');
const ManifestPlugin = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const fs = require('fs');

const entries = (base => {
  let ret = {
    site: './js/site.js'
  };

  function appendEntries(folder) {
    let folders = fs.readdirSync(base + folder);
    folders.forEach(name => {
      if (name === '.DS_Store') return;
      ret[name] = base + folder + '/' + name + '/index.js';
    });
  }

  appendEntries('/lab');
  appendEntries('/notations');

  return ret;
})('./js');

module.exports = (env, options) => {
  return {
    devtool: options.mode === 'development' ? 'eval-source-map' : false,
    devServer: {
      port: 9000,
      writeToDisk: true
    },
    entry: entries,
    output: {
      path: resolve(__dirname, 'src', 'js'),
      filename: '[name].[chunkhash:4].js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [/node_modules/],
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    },
    plugins: [new ManifestPlugin(), new CleanWebpackPlugin()]
  };
};
