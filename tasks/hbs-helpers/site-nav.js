const SafeString = require('handlebars').SafeString;
const slugify    = require('slug');
const metadata   = require('../config')(process.argv);
const setURL     = require('./set-url');

module.exports = function(slug, collection) {
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

  return new SafeString(list);
};
