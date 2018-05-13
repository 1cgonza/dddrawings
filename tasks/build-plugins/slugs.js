import each from 'metalsmith-each';
import slug from 'slug';

module.exports = each((file, filename) => {
  const safeSlug = file.title ? slug(file.title, {lower: true}) : null;
  if (safeSlug !== null) {
    file.slug = safeSlug;
  }
});
