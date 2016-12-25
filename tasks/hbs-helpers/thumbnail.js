const SafeString = require('handlebars').SafeString;
const metadata   = require('../config')(process.argv);
const setURL     = require('./set-url');

module.exports = function(thumb) {
  var pageThumb = thumb ? thumb : metadata.defaultThumb;

  return new SafeString(pageThumb);
};
