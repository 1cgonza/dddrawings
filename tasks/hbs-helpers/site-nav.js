import {SafeString} from 'handlebars';
import slugify from 'slug';
import metadata from '../config';
import setURL from './set-url';

module.exports = (slug, collection) => {
  const pages = ['Home', 'Lab', 'Notations', 'Datasets'];
  let list = '';

  pages.forEach(name => {
    let safeSlug = slugify(name, {lower: true});
    let pageURL = '';
    let eleClass = '';

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
