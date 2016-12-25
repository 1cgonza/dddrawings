const metadata  = require('../config')(process.argv);
const stripTags = require('striptags');

module.exports = function(description, excerpt) {
  var pageDescription = description ? description : metadata.siteDescription;

  if (!description && excerpt.length > 0) {
    pageDescription = excerpt;
  }

  return stripTags(pageDescription);
};
