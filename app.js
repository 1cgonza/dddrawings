require('harmonize')();
var Metalsmith   = require('metalsmith');
var Handlebars   = require('handlebars');
var ignore       = require('metalsmith-ignore');
var collections  = require('metalsmith-collections');
var sass         = require('metalsmith-sass');
var markdown     = require('metalsmith-markdown');
var layouts      = require('metalsmith-layouts');
var htmlMin      = require('metalsmith-html-minifier');
var circularJSON = require('circular-json');
var browserSync  = require('browser-sync');
var changed      = require('metalsmith-changed');
var each         = require('metalsmith-each');
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
    files: ['src/**/*.md', 'src/**/*.scss', 'src/**/*.js', 'layouts/**/*.hbs'],
    // logLevel: 'debug',
    notify: false,
    middleware: function (req, res, next) {
      build(next);
    }
  });
} else if (metadata.safeClean) {
  console.log('Start cleaning...');
  safelyClean();
} else {
  build(stage);
}

function stage () {
  console.log('success');
}

function safelyClean () {
  var del = require('del');

  del(['build/**', '!build', '!build/data/**', '!build/videos/**']).then(function (paths) {
    console.log('Deleted files/folders:\n', paths.join('\n'));
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

  metalsmith.use( each(function (file, filename) {
    var slug = file.title ? file.title.replace(/\W+/g, '-').toLowerCase() : null;
    if (slug !== null) {
      file.slug = slug;
    }
  }) );

  metalsmith.use( layouts({
    engine: 'handlebars',
    directory: 'layouts'
  }) );

  metalsmith.use( htmlMin() );

  metalsmith.build( function (err) {
    if (err) throw err;
    callback();
  } );
}

Handlebars.registerPartial({
  head: fs.readFileSync(__dirname + '/layouts/partials/head.hbs').toString(),
  footer: fs.readFileSync(__dirname + '/layouts/partials/footer.hbs').toString()
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
  // slug: function (title) {
  //   var slug = title ? title.replace(/\W+/g, '-').toLowerCase() : '';

  //   return new Handlebars.SafeString(slug);
  // },
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
    var tags = '';

    if ( Array.isArray(libs) ) {
      libs.forEach(function (name) {
        if (name in libraries) {
          tags += setScriptTags(libraries[name], '');
        }
      });
    }

    return new Handlebars.SafeString(tags);
  },
  setScripts: function (scripts) {
    var url = setURL('js/');
    var tags = setScriptTags(scripts, url);

    return new Handlebars.SafeString(tags);
  },
  setURL: setURL
});

function setScriptTags (scripts, url) {
  var ret = '';
  var tag = '';

  if ( Array.isArray(scripts) ) {
    scripts.forEach(function (script) {
      tag = '<script src="' + url + script + '.js"></script>';
      ret += tag;
    });
  } else {
    tag = '<script src="' + url + scripts + '.js"></script>';
    ret += tag;
  }

  return ret;
}

function setURL (pre, path) {
  pre = pre ? pre : '';
  path = typeof path === 'string' ? path : '';
  return metadata.baseUrl + pre + path;
}
