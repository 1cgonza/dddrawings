import { SafeString } from 'handlebars';
import metadata from '../config';

export default thumb => {
  const pageThumb = thumb ? thumb : metadata.defaultThumb;

  return new SafeString(pageThumb);
};
