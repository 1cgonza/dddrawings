import collections from '@metalsmith/collections';

export default collections({
  lab: {
    pattern: 'lab/**/*.md',
    sortBy: 'date',
    reverse: true,
  },
  notations: {
    pattern: 'notations/**/*.md',
    sortBy: 'year',
  },
  datasets: {
    pattern: 'datasets/**/*.md',
  },
  dissertation: {
    pattern: 'dissertation/**/*.md',
  },
});
