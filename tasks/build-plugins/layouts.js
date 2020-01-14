import layouts from 'metalsmith-layouts';
import buildHelpers from '../hbs-helpers';

buildHelpers();

module.exports = layouts({
  engine: 'handlebars',
  directory: 'layouts'
});
