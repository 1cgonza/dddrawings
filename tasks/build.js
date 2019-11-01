import Metalsmith from 'metalsmith';
import chalk from 'chalk';
import metadata from './config';
import server from './build-plugins/server';

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

export function build(callback) {
  var metalsmith = new Metalsmith(__dirname)
    .source('../src')
    .destination('../build')
    .clean(false)
    .metadata(metadata);

  plugins.forEach(name => {
    metalsmith.use(require(tasksEntry + name));
  });

  metalsmith.build(err => {
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

export function serve() {
  server(build);
}
