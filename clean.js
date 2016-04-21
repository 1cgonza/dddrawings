var chalk = require('chalk');
var del   = require('del');

function safelyClean(cb) {
  console.log(chalk.cyan('..::| START cleaning |::..'));

  del([
    'build/**',
    '!build',
    '!build/CNAME',
    '!build/data/**',
    '!build/videos/**',
    '!build/Readme.md'
  ]).then(function(paths) {
    console.log(chalk.gray('Deleted files/folders:\n', paths.join('\n')));
    console.log(chalk.cyan('..::| FINISHED cleaning |::..'));
    if (cb) {
      cb();
    }
  });
}

module.exports = safelyClean;
