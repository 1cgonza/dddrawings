var fs           = require('fs');
var circularJSON = require('circular-json');
var slugify      = require('slug');
var stripTags    = require('striptags');
var path = require('path');
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

      return stripTags(pageDescription);
    },

    featuredImg: function(collection, name, type) {
      if (!name) {
        collection = '';
        name = metadata.defaultImgPath;
      }
      if (!type) {
        console.error('Error generating image URL: Third parameter needs to be the size eg: \'large\', \'thumb\'...');
        type = '';
      }

      collection = Array.isArray(collection) ? collection[0] : collection;
      collection = path.join('img', collection);
      name = typeof name === 'string' ? name : '';
      type = typeof type === 'string' ? type : '';

      var imgName = type === 'full' ? name + '.jpg' : name + '-' + type + '.jpg';

      return new Handlebars.SafeString(setURL(collection, imgName, false));
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
      var url = metadata.videosPath;
      videos.forEach(function(video, i) {
        for (var type in video) {
          ret += '<source src="' + url + video[type] + '" type="video/' + type + '">';
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
    },

    analytics: function() {
      var script = '';
      if (metadata.env !== 'dev') {
        script = '<script>(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||' +
        'function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),' +
        'm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})' +
        '(window,document,"script","//www.google-analytics.com/analytics.js","ga");' +
        'ga("create", "UA-18482571-2","auto");ga("send","pageview");</script>';
      }
      return new Handlebars.SafeString(script);
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

  function setURL(pre, slug, withTail) {
    var url;
    pre  = Array.isArray(pre) ? pre[0] : pre;
    pre = typeof pre === 'string' ? pre : '';
    slug = typeof slug === 'string' ? slug : '';
    withTail = typeof withTail === 'boolean' && withTail ? '/' : '';

    return metadata.baseUrl + path.join(pre, slug, withTail);
  }
}

module.exports = helpers;
