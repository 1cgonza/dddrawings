const changed = require('metalsmith-changed');

module.exports = changed({
  forcePattern: '**/*.md'
});
