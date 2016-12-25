const SafeString = require('handlebars').SafeString;
const setURL = require('./set-url');

module.exports = function(tag, collection, metalsmith) {
  var labPosts = metalsmith.data.root[collection];
  var ret = '';

  labPosts.forEach(function(post) {
    if (post.tags && post.tags.indexOf(tag) > -1) {
      var link = setURL(collection, post.slug, true);
      ret += '<li><a href="' + link + '">' + post.title + '</a></li>';
    }
  });

  if (ret.length > 0) {
    ret = '<p>Related:</p><ul class="related related-to-' + tag + '">' + ret + '</ul>';
  }

  return new SafeString(ret);
};
