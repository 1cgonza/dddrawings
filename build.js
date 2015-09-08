require('harmonize')();
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
var slug         = require('slug');
var chalk        = require('chalk');
var browserSync  = require('browser-sync');
var metadata     = require('./config')(process.argv);

function serve () {
  browserSync({
    server: 'build',
    files: ['src/**/*.md', 'src/**/*.scss', 'src/**/*.js', 'layouts/**/*.hbs'],
    // logLevel: 'debug',
    notify: false,
    middleware: function (req, res, next) {
      build(next);
    }
  });
}

function build (callback) {
  var metalsmith = new Metalsmith(__dirname);
  metalsmith.clean(false);
  metalsmith.use( changed() );
  metalsmith.metadata(metadata);

  metalsmith.use( ignore(['**/.DS_Store', 'lab/_TEMPLATE/**/*']) );

  metalsmith.use( collections({
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
    }
  }) );

  metalsmith.use( sass({
    outputStyle: 'compressed',
    outputDir: 'css/'
  }) );

  metalsmith.use( markdown({
    typographer: true,
    html: true
  }) );

  metalsmith.use( excerpts({
    pruneLength: 160
  }) );

  metalsmith.use( each(function (file, filename) {
    var safeSlug = file.title ? slug(file.title, {lower: true}) : null;
    if (safeSlug !== null) {
      file.slug = safeSlug;
    }
  }) );

  metalsmith.use( layouts({
    engine: 'handlebars',
    directory: 'layouts'
  }) );

  metalsmith.use( htmlMin() );

  metalsmith.build( function (err) {
    if (err) throw err;
    if (callback) {
      callback();
    } else {
      console.log( chalk.yellow('......................| Production build is done |......................') );
    }
  } );
}

module.exports = {
  once: build,
  serve: serve
};