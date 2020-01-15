import { SafeString } from 'handlebars';
import metadata from '../config';

module.exports = function(thumb) {
  const pageThumb = thumb ? thumb : metadata.defaultThumb;

  return new SafeString(pageThumb);
};
