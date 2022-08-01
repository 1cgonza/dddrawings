import hb from 'handlebars';
import setURL from './setURL.js';

export default (key) => {
  key = key.indexOf('.js') < 0 ? `${key}.js` : key;
  const link = setURL(key, false, false);
  return new hb.SafeString(link);
};
