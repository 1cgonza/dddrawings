var gulp = require('gulp');
var gulpsmith = require('gulpsmith');
var ghPages = require('gulp-gh-pages');

export default () => {
  gulp
    .src(['./build/**/*', '!./build/videos', '!./build/videos/**', '!./build/metalsmith-changed-ctimes.json'])
    .pipe(ghPages())
    .pipe(gulpsmith());
};
