const each = require('metalsmith-each');
const slug = require('slug');

module.exports = each(function(file, filename) {
  var safeSlug = file.title ? slug(file.title, {lower: true}) : null;
  if (safeSlug !== null) {
    file.slug = safeSlug;
  }
});
