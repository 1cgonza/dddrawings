import hb from 'handlebars';
import setURL from './setURL.js';

export default (tag, collection, metalsmith) => {
  let labPosts = metalsmith.data.root[collection];
  let ret = '';

  labPosts.forEach((post) => {
    if (post.tags && post.tags.indexOf(tag) > -1) {
      let link = setURL(collection, post.slug, true);
      ret += '<li><a href="' + link + '">' + post.title + '</a></li>';
    }
  });

  if (ret.length > 0) {
    ret = '<p>Related:</p><ul class="related related-to-' + tag + '">' + ret + '</ul>';
  }

  return new hb.SafeString(ret);
};
