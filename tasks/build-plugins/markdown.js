const markdown = require('metalsmith-markdown');

module.exports = markdown({
  typographer: true,
  html: true
});
