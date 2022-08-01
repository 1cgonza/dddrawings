import hb from 'handlebars';
import metadata from '../config.js';
import path from 'path';
import setURL from './setURL.js';

export default (collection, name, type) => {
  if (!name) {
    collection = '';
    name = metadata.defaultImgPath;
  }

  if (!type) {
    console.error("Error generating image URL: Third parameter needs to be the size eg: 'large', 'thumb'...");
    type = '';
  }

  collection = Array.isArray(collection) ? collection[0] : collection;
  collection = path.join('img', collection);
  name = typeof name === 'string' ? name : '';
  type = typeof type === 'string' ? type : '';

  const imgName = type === 'full' ? name + '.jpg' : name + '-' + type + '.jpg';

  return new hb.SafeString(setURL(collection, imgName, false));
};
