import { SafeString } from 'handlebars';
import setURL from './set-url';
import setScriptTags from './script-tags';

module.exports = (scripts) => {
  let link = setURL('js', false, true);
  let tags = setScriptTags(scripts, link);

  return new SafeString(tags);
};
