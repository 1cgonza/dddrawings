import chalk from 'chalk';
import browserSync from 'browser-sync';
import connectGzip from 'connect-gzip-static';

const server = browserSync.create();
const gzip = connectGzip('./build');

module.exports = (buildCallback) => {
  const config = {
    server: 'build',
    files: [{
      match: [
        '**/*',
        '!build/**.*',
        '!src/img/lab/**.*',
        '!src/img/notations/**.*',
        '!.git/**.*',
        '!**/*.DS_Store'
      ],
      fn: (event, file) => {
        if (event === 'change') {
          buildCallback(server.reload);
          console.log(chalk.cyan('Updated file: ') + chalk.yellow(file));
        }
      }
    }],
    // logLevel: 'debug',
    notify: false,
    open: false
  };

  return () => {
    server.init(config, (err, bs) => {
      buildCallback();

      // uncomment to test gzip delivery on localhost. Just like this it breaks the autoreload
      // bs.addMiddleware('*', gzip, {
      //   override: true
      // });
    });
  };
};
