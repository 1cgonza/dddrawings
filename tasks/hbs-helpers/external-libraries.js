const SafeString    = require('handlebars').SafeString;
const metadata      = require('../config')(process.argv);
const setScriptTags = require('./script-tags');

module.exports = function(libs) {
  var libraries = metadata.extLibraries;
  var tags = '';

  if (Array.isArray(libs)) {
    libs.forEach(function(name) {
      if (name in libraries) {
        tags += setScriptTags(libraries[name], metadata.baseUrl + 'js/vendor/');
      }
    });
  }

  return new SafeString(tags);
};
