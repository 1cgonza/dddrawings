var Handlebars   = require('handlebars');
var circularJSON = require('circular-json');
var deploy       = require('./deploy');
var clean        = require('./clean');
var build        = require('./build');
var metadata     = require('./config')(process.argv);
var fs           = require('fs');

if (metadata.env === 'clean') {
  clean();
} else if(metadata.env === 'deploy') {
  clean(buildAndDeploy);
} else if (metadata.env === 'prod') {
  build.once();
} else {
  // The default mode will be development
  // This will launch browserSync to work locally
  build.serve();
}

function buildAndDeploy () {
  build.once(deploy);
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

    if (title && title.length > 0) {
      pageTitle = title + ' :: ' + metadata.siteTitle;
    }

    return new Handlebars.SafeString(pageTitle);
  },
  pageDescription: function (description, excerpt) {
    var pageDescription = description ? description : metadata.siteDescription;
    if (!description && excerpt.length > 0) {
      pageDescription = excerpt;
    }

    return pageDescription;
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
  setVideos: function (videos) {
    var ret = '';
    var path = metadata.videosPath;
    videos.forEach(function (video, i) {
      for (var type in video) {
        ret += '<source src="' + path + video[type] + '" type="video/' + type + '">';
      }
    });
    return new Handlebars.SafeString(ret);
  },
  setScripts: function (scripts) {
    var url = setURL('js', false, true);
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

function setURL (pre, path, withTail, meta) {
  var url, end;
  pre  = Array.isArray(pre) ? pre[0] : pre;
  url  = typeof pre === 'string' ? pre : '';
  url += typeof path === 'string' && path.length > 0 && pre !== path ? '/' + path : '';
  url += withTail === true ? '/' : '';

  return metadata.baseUrl + url;
}
