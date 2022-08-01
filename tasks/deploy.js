import gulp from 'gulp';
import gulpsmith from 'gulpsmith';
import ghPages from 'gulp-gh-pages';

export default () => {
  gulp
    .src(['./build/**/*', '!./build/videos', '!./build/videos/**', '!./build/metalsmith-changed-ctimes.json'])
    .pipe(ghPages())
    .pipe(gulpsmith());
};
