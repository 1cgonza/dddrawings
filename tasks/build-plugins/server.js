const chalk       = require('chalk');
const browserSync = require('browser-sync').create();
const gzip        = require('connect-gzip-static')('./build');

var server = function(buildCallback) {
  var config = {
    server: 'build',
    files: [{
      match: [
        'src/**/*.md',
        'src/scss/**/*.scss',
        'src/**/*.js',
        'layouts/**/*.hbs',
      ],
      fn: function(event, file) {
        if (event === 'change') {
          buildCallback(this.reload);
          console.log(chalk.cyan('Updated file: ') + chalk.yellow(file));
        }
      }
    }],
    // logLevel: 'debug',
    notify: false
  };

  return function() {
    browserSync.init(config, function(err, bs) {
      buildCallback();

      // uncomment to test gzip delivery on localhost. Just like this it breaks the autoreload
      // bs.addMiddleware('*', gzip, {
      //   override: true
      // });
    });
  };
};

module.exports = server;

