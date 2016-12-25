const SafeString = require('handlebars').SafeString;

module.exports = function(slug, collection, archive) {
  var bodyClass = 'page';
  var name = 'ddd';

  if (Array.isArray(collection) && collection.length > 0 && !archive) {
    bodyClass += '-' + collection;
  }
  if (slug) {
    name = '-' + slug;
  }

  return new SafeString(bodyClass + name);
};
