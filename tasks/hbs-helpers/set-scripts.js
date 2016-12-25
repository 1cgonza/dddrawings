const SafeString    = require('handlebars').SafeString;
const setURL        = require('./set-url');
const setScriptTags = require('./script-tags');

module.exports = function(scripts) {
  var link = setURL('js', false, true);
  var tags = setScriptTags(scripts, link);

  return new SafeString(tags);
};
