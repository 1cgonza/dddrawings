var Metalsmith   = require('metalsmith');
var chalk        = require('chalk');
var metadata     = require('./config')(process.argv);
// var imgManager   = require('./images-manager').plugin;

const tasksEntry = './tasks/build/';
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
  var metalsmith = new Metalsmith(__dirname);
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
