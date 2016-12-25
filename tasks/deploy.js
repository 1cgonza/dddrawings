var gulp      = require('gulp');
var gulpsmith = require('gulpsmith');
var ghPages   = require('gulp-gh-pages');

function deploy() {
  gulp.src([
    './build/**/*',
    '!./build/videos',
    '!./build/videos/**',
    '!./build/metalsmith-changed-ctimes.json'
  ])
  .pipe(ghPages())
  .pipe(
    gulpsmith()
  );
}

module.exports = deploy;
