const resolve = require('path').resolve;
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
      ret[name] = base + folder + '/' + name + '/index.js';
    });
  }

  appendEntries('/lab');
  appendEntries('/notations');

  return ret;
})('./js');

module.exports = (env, options) => {
  console.log(options.mode);
  return {
    devtool: options.mode === 'development' ? 'eval-source-map' : false,
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
