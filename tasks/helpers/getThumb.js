import hb from 'handlebars';
import metadata from '../config.js';

export default (thumb) => {
  const pageThumb = thumb ? thumb : metadata.defaultThumb;

  return new hb.SafeString(pageThumb);
};
