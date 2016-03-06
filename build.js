var Metalsmith   = require('metalsmith');
var ignore       = require('metalsmith-ignore');
var collections  = require('metalsmith-collections');
var sass         = require('metalsmith-sass');
var markdown     = require('metalsmith-markdown');
var layouts      = require('metalsmith-layouts');
var htmlMin      = require('metalsmith-html-minifier');
var changed      = require('metalsmith-changed');
var each         = require('metalsmith-each');
var excerpts     = require('metalsmith-better-excerpts');
var autoprefixer = require('metalsmith-autoprefixer');
var drafts       = require('metalsmith-drafts');
var slug         = require('slug');
var chalk        = require('chalk');
var browserSync  = require('browser-sync');
var metadata     = require('./config')(process.argv);
var path         = require('path');
var webpack      = require('metalsmith-webpack');
var UglifyJs     = require('webpack').optimize.UglifyJsPlugin;

var webpackConfig = {
  context: path.resolve(__dirname, './src/js/ddd'),
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, './build/js'),
    filename: 'ddd.js'
  }
};

function serve() {
  build(watch);
}

function watch() {
  browserSync({
    server: 'build',
    files: [{
      match: ['src/**/*.md', 'src/scss/**/*.scss', 'src/**/*.js', 'layouts/**/*.hbs'],
      fn: function(event, file) {
        if (event === 'change') {
          build(this.reload);
          console.log(chalk.cyan('Updated file: ') + chalk.yellow(file));
        }
      }
    }],
    // logLevel: 'debug',
    notify: false
  });
}

function build(callback) {
  var metalsmith = new Metalsmith(__dirname);
  metalsmith.clean(false);

  metalsmith.use(drafts());
  metalsmith.use(changed());
  metalsmith.metadata(metadata);

  metalsmith.use(ignore(['js/ddd/**/*', '**/.DS_Store', 'lab/_TEMPLATE/**/*']));

  metalsmith.use(collections({
    lab: {
      pattern: 'lab/**/*.md',
      sortBy: 'date',
      reverse: true
    },
    notations: {
      pattern: 'notations/**/*.md'
    },
    datasets: {
      pattern: 'datasets/**/*.md'
    },
    dissertation: {
      pattern: 'dissertation/**/*.md'
    }
  }));

  metalsmith.use(sass({
    outputStyle: 'compressed',
    outputDir: 'css/'
  }));

  metalsmith.use(autoprefixer());

  metalsmith.use(markdown({
    typographer: true,
    html: true
  }));

  metalsmith.use(excerpts({
    pruneLength: 160
  }));

  metalsmith.use(each(function(file, filename) {
    var safeSlug = file.title ? slug(file.title, {lower: true}) : null;
    if (safeSlug !== null) {
      file.slug = safeSlug;
    }
  }));

  metalsmith.use(layouts({
    engine: 'handlebars',
    directory: 'layouts'
  }));

  metalsmith.use(htmlMin());

  if (metadata.env === 'prod' || metadata.env === 'deploy') {
    webpackConfig.output.filename = 'ddd.min.js';

    Object.assign(webpackConfig, {
      plugins: [
        new UglifyJs({
          compress: {warnings: false}
        })
      ]
    });
  }

  metalsmith.use(webpack(webpackConfig));

  metalsmith.build(function(err) {
    if (err) {
      throw err;
    }
    if (callback) {
      callback();
    } else {
      console.log(chalk.yellow('......................| Production build is done |......................'));
    }
  });
}

module.exports = {
  once: build,
  serve: serve
};
