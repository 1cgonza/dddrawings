import { SafeString } from 'handlebars';
import setURL from './setUrl';
import fs from 'fs';

const manifestPath = 'src/js/manifest.json';

module.exports = function(key) {
  if (fs.existsSync(manifestPath)) {
    key = key.indexOf('.js') < 0 ? `${key}.js` : key;
    const manifest = JSON.parse(fs.readFileSync(manifestPath));
    const link = setURL(`js/${manifest[key]}`, false, false);

    return new SafeString(link);
  }

  return '';
};
