import { SafeString } from 'handlebars';
import metadata from '../config';
import setURL from './set-url';

module.exports = (thumb) => {
  const pageThumb = thumb ? thumb : metadata.defaultThumb;

  return new SafeString(pageThumb);
};
