const Metalsmith = require('metalsmith');
const chalk      = require('chalk');
const metadata   = require('./config')(process.argv);
const path       = require('path');

const tasksEntry = './build-plugins/';
const plugins = [
  'changed',
  'drafts',
  'ignore',
  'collections',
  'sass',
  'autoprefixer',
  'markdown',
  'excerpts',
  'slugs',
  'layouts',
  'html',
  'images'
];

function build(callback) {
  var metalsmith = new Metalsmith(__dirname)
  .source('../src')
  .destination('../build')
  .clean(false)
  .metadata(metadata);

  plugins.forEach(function(name) {
    metalsmith.use(require(tasksEntry + name));
  });

  metalsmith.build(function(err) {
    if (err) {
      throw err;
    }

    if (callback) {
      callback();
    }

    if (metadata.env === 'prod') {
      console.log(chalk.yellow('..::| Production build is done |::..'));
    }
  });
}

module.exports = {
  once: build,
  serve: require(tasksEntry + 'server')(build)
};
