const { resolve } = require('path');
const ManifestPlugin = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { readdirSync } = require('fs');

const entries = (base => {
  let ret = {
    site: './js/site.js'
  };

  function appendEntries(folder) {
    let folders = readdirSync(base + folder);
    folders.forEach(name => {
      if (name === '.DS_Store') return;
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
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(glsl|vs|fs)$/,
        loader: 'shader-loader'
      }
    ]
  },
  optimization: {
    usedExports: true
  },
  plugins: [new ManifestPlugin(), new CleanWebpackPlugin()]
};
