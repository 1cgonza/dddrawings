import { SafeString } from 'handlebars';

module.exports = function(slug, collection, archive) {
  let bodyClass = 'page';
  let name = 'ddd';

  if (Array.isArray(collection) && collection.length > 0 && !archive) {
    bodyClass += '-' + collection;
  }
  if (slug) {
    name = '-' + slug;
  }

  return new SafeString(bodyClass + name);
};
