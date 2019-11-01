import { SafeString } from 'handlebars';
import metadata from '../config';
import setScriptTags from './script-tags';

module.exports = libs => {
  let libraries = metadata.extLibraries;
  let tags = '';

  if (Array.isArray(libs)) {
    libs.forEach(name => {
      if (name in libraries) {
        tags += setScriptTags(libraries[name], metadata.baseUrl + 'js/vendor/');
      }
    });
  }

  return new SafeString(tags);
};
