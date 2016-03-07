var fs           = require('fs');
var circularJSON = require('circular-json');
var slugify      = require('slug');
var metadata     = require('./config')(process.argv);

function helpers(Handlebars) {
  Handlebars.registerPartial({
    head: fs.readFileSync(__dirname + '/layouts/partials/head.hbs').toString(),
    footer: fs.readFileSync(__dirname + '/layouts/partials/footer.hbs').toString()
  });

  Handlebars.registerHelper({
    debug: function(context) {
      return new Handlebars.SafeString(
        '<pre class="debug"><code class="json">' + circularJSON.stringify(context, null, 2)  + '</code></pre>'
      );
    },

    siteNav: function(slug, collection) {
      var pages = ['Home', 'Lab', 'Notations', 'Datasets'];
      var list = '';

      pages.forEach(function(name) {
        var safeSlug = slugify(name, {lower: true});
        var pageURL = '';
        var eleClass = '';

        if (name === 'Home') {
          pageURL = metadata.baseUrl;
        } else {
          pageURL = setURL(safeSlug, false, true);
        }

        if (slug && safeSlug === slug) {
          eleClass = 'class="current" ';
        } else if (slug && collection && safeSlug === collection[0]) {
          eleClass = 'class="current current-parent" ';
        }

        list += '<li><a ' + eleClass + 'href="' + pageURL + '" title="' + name + '">' + name + '</a></li>';
      });

      return new Handlebars.SafeString(list);
    },

    bodyClass: function(slug, collection, archive) {
      var bodyClass = 'page';
      var name = 'ddd';

      if (Array.isArray(collection) && collection.length > 0 && !archive) {
        bodyClass += '-' + collection;
      }
      if (slug) {
        name = '-' + slug;
      }

      return new Handlebars.SafeString(bodyClass + name);
    },

    pageTitle: function(title) {
      var pageTitle = metadata.siteTitle;

      if (title && title.length > 0 && title !== 'Home') {
        pageTitle = title + ' :: ' + metadata.siteTitle;
      }

      return new Handlebars.SafeString(pageTitle);
    },

    pageDescription: function(description, excerpt) {
      var pageDescription = description ? description : metadata.siteDescription;

      if (!description && excerpt.length > 0) {
        pageDescription = excerpt;
      }

      return pageDescription;
    },

    featuredImg: function(image) {
      var featuredImg = image ? image : metadata.defaultImage;

      return new Handlebars.SafeString(featuredImg);
    },

    getThumb: function(thumb) {
      var pageThumb = thumb ? thumb : metadata.defaultThumb;

      return new Handlebars.SafeString(pageThumb);
    },

    dddLibrary: function() {
      var name = 'ddd.js';

      if (metadata.env !== 'dev') {
        name = 'ddd.min.js';
      }

      return new Handlebars.SafeString(setURL('js', name, false));
    },

    setLibraries: function(libs) {
      var libraries = metadata.extLibraries;
      var tags = '';

      if (Array.isArray(libs)) {
        libs.forEach(function(name) {
          if (name in libraries) {
            tags += setScriptTags(libraries[name], metadata.baseUrl + 'js/vendor/');
          }
        });
      }

      return new Handlebars.SafeString(tags);
    },

    setVideos: function(videos) {
      var ret = '';
      var path = metadata.videosPath;
      videos.forEach(function(video, i) {
        for (var type in video) {
          ret += '<source src="' + path + video[type] + '" type="video/' + type + '">';
        }
      });

      return new Handlebars.SafeString(ret);
    },

    setScripts: function(scripts) {
      var url = setURL('js', false, true);
      var tags = setScriptTags(scripts, url);

      return new Handlebars.SafeString(tags);
    },

    setURL: setURL,

    getRelatedLab: function(tag, metal) {
      var labPosts = metal.data.root.lab;
      var ret = '';
      labPosts.forEach(function(post) {
        if (post.tags && post.tags.indexOf(tag) > -1) {
          var url = setURL('lab', post.slug, true);
          ret += '<li><a href="' + url + '">' + post.title + '</a></li>';
        }
      });

      if (ret.length > 0) {
        ret = '<p>Related:</p><ul class="related related-to-' + tag + '">' + ret + '</ul>';
      }

      return new Handlebars.SafeString(ret);
    }
  });

  function setScriptTags(scripts, url) {
    var ret = '';
    var tag = '';

    if (Array.isArray(scripts)) {
      scripts.forEach(function(script) {
        tag = '<script src="' + url + script + '.js"></script>';
        ret += tag;
      });
    } else {
      tag = '<script src="' + url + scripts + '.js"></script>';
      ret += tag;
    }

    return ret;
  }

  function setURL(pre, path, withTail) {
    var url;
    pre  = Array.isArray(pre) ? pre[0] : pre;
    url  = typeof pre === 'string' ? pre : '';
    url += typeof path === 'string' && path.length > 0 && pre !== path ? '/' + path : '';
    url += withTail === true ? '/' : '';

    return metadata.baseUrl + url;
  }
}

module.exports = helpers;
