const SafeString = require('handlebars').SafeString;
const metadata   = require('../config')(process.argv);

module.exports = function(title) {
  var pageTitle = metadata.siteTitle;

  if (title && title.length > 0 && title !== 'Home') {
    pageTitle = title + ' :: ' + metadata.siteTitle;
  }

  return new SafeString(pageTitle);
};
