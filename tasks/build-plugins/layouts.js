const layouts = require('metalsmith-layouts');
const helpers = require('../hbs-helpers')();

module.exports = layouts({
  engine: 'handlebars',
  directory: 'layouts'
});
