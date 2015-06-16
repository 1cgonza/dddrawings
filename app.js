var Metalsmith   = require('metalsmith');
var Handlebars   = require('handlebars');
var ignore       = require('metalsmith-ignore');
var collections  = require('metalsmith-collections');
var sass         = require('metalsmith-sass');
var markdown     = require('metalsmith-markdown');
var permalinks   = require('metalsmith-permalinks');
var templates    = require('metalsmith-templates');
var htmlMin      = require('metalsmith-html-minifier');
var circularJSON = require('circular-json');
var browserSync  = require('browser-sync');
var metadata     = require('./config')(process.argv);
/**
* 'fs' comes with node so it won't be in the package.json
* Gives access to the file system paths
* https://nodejs.org/api/fs.html
**/
var fs = require('fs');

if (metadata.isDev) {
  browserSync({
    server: 'build',
    files: ['src/**/*.md', 'src/scss/*.scss', 'src/**/*.js', 'templates/**/*.hbs'],
    // logLevel: 'debug',
    notify: false,
    middleware: function (req, res, next) {
      build(next);
    }
  });
} else {
  build(stage);
}

function stage () {
  console.log('success');
}

function build (callback) {
  var metalsmith = new Metalsmith(__dirname);
  metalsmith.metadata(metadata);

  metalsmith.use( ignore(['**/.DS_Store']) );

  metalsmith.use( collections({
    lab: {
      pattern: 'lab/*.md',
      sortBy: 'date',
      reverse: true
    },
    notations: {
      pattern: 'notations/*.md'
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

  metalsmith.use( permalinks({
    pattern: ':collection/:title'
  }) );

  metalsmith.use( templates({
    engine: 'handlebars',
    directory: 'templates'
  }) );

  metalsmith.use( htmlMin() );

  metalsmith.build( function (err) {
    if (err) throw err;
    callback();
  } );
}

Handlebars.registerPartial({
  head: fs.readFileSync(__dirname + '/templates/partials/head.hbs').toString(),
  footer: fs.readFileSync(__dirname + '/templates/partials/footer.hbs').toString()
});

Handlebars.registerHelper({
  debug: function (context) {
    return new Handlebars.SafeString(
      '<div class="debug">' + circularJSON.stringify(context) + '</div>'
    );
  },
  pageTitle: function (title) {
    var pageTitle = metadata.siteTitle;

    if (title) {
      pageTitle = title + ' :: ' + metadata.siteTitle;
    }

    return new Handlebars.SafeString(pageTitle);
  },
  slug: function (title) {
    var slug = title ? title.replace(/\W+/g, '-').toLowerCase() : '';

    return new Handlebars.SafeString(slug);
  },
  pageDescription: function (description) {
    var pageDescription = description ? description : metadata.siteDescription;

    return new Handlebars.SafeString(pageDescription);
  },
  featuredImg: function (image) {
    var featuredImg = image ? image : metadata.defaultImage;

    return new Handlebars.SafeString(featuredImg);
  },
  getThumb: function (thumb) {
    var pageThumb = thumb ? thumb : metadata.defaultThumb;

    return new Handlebars.SafeString(pageThumb);
  },
  setLibraries: function (libs) {
    var libraries = metadata.extLibraries;
    var scripts = '';

    for (var library in libraries) {
      var script = '<script src="' + libraries[library] + '"></script>';
      scripts += script;
    }

    return new Handlebars.SafeString(scripts);
  },
  setScripts: function (scripts) {
    var url = setURL('js/lab/');
    var html = '';

    if ( Array.isArray(scripts) ) {
      scripts.forEach(function (script) {
        script = '<script src="' + url + script + '.js"></script>';
        html += script;
      });
    } else {
      var script = '<script src="' + url + scripts + '.js"></script>';
      html += script;
    }

    return new Handlebars.SafeString(html);
  },
  setURL: setURL
});

function setURL (path) {
  return metadata.baseUrl + path;
}
