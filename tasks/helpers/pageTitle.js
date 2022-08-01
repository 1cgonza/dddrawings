import hb from 'handlebars';
import metadata from '../config.js';

export default (title) => {
  let pageTitle = metadata.siteTitle;

  if (title && title.length > 0 && title !== 'Home') {
    pageTitle = title + ' :: ' + metadata.siteTitle;
  }

  return new hb.SafeString(pageTitle);
};
