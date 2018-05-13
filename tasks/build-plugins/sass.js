import sass from 'metalsmith-sass';

module.exports = sass({
  outputStyle: 'compressed',
  outputDir: 'css/'
});
