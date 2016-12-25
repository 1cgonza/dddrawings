const Metalsmith = require('metalsmith');
const chalk      = require('chalk');
const metadata   = require('./config')(process.argv);
const path       = require('path');
// var imgManager   = require('./images-manager').plugin;

const tasksEntry = './build-plugins/';
const plugins = [
  'drafts',
  'changed',
  'ignore',
  'collections',
  'sass',
  'autoprefixer',
  'markdown',
  'excerpts',
  'slugs',
  'layouts',
  'html'
];

function build(callback) {
  var metalsmith = new Metalsmith(path.resolve(__dirname, '../'));
  metalsmith.clean(false);
  metalsmith.metadata(metadata);

  plugins.forEach(function(name) {
    metalsmith.use(require(tasksEntry + name));
  });

  // metalsmith.use(imgManager({
  //   log: 'new'
  // }));

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
