const collections  = require('metalsmith-collections');

module.exports = collections({
  lab: {
    pattern: 'lab/**/*.md',
    sortBy: 'date',
    reverse: true
  },
  notations: {
    pattern: 'notations/**/*.md',
    sortBy: 'year'
  },
  datasets: {
    pattern: 'datasets/**/*.md'
  },
  dissertation: {
    pattern: 'dissertation/**/*.md'
  }
});
