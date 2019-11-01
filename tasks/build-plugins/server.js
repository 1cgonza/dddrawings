import chalk from 'chalk';
import browserSync from 'browser-sync';
import connectGzip from 'connect-gzip-static';

export default buildCallback => {
  const server = browserSync.create();
  const gzip = connectGzip('./build');
  const config = {
    watch: true,
    server: 'build',
    files: [
      {
        match: ['src'],
        fn: (event, file) => {
          if (event === 'change') {
            buildCallback(server.reload);
            console.log(chalk.cyan('Updated file: ') + chalk.yellow(file));
          }
        },
        options: {
          ignored: ['build/**.*', 'src/img/lab/**.*', 'src/img/notations/**.*']
        }
      }
    ],
    // logLevel: 'debug',
    notify: false,
    open: false
  };

  server.init(config, (err, bs) => {
    buildCallback();

    // uncomment to test gzip delivery on localhost. Just like this it breaks the autoreload
    // bs.addMiddleware('*', gzip, {
    //   override: true
    // });
  });
};
