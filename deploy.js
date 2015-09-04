var gulp         = require('gulp');
var gulpsmith    = require('gulpsmith');
var ghPages      = require('gulp-gh-pages');

function deploy () {
  gulp.src('./build/**/*')
  .pipe( ghPages() )
  .pipe(
    gulpsmith()
  );
}

module.exports = deploy;