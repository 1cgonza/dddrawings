import chalk from 'chalk';
import del from 'del';

export function clean(cb) {
  console.log(chalk.cyan('..::| START cleaning |::..'));

  del(['build/**', '!build', '!build/CNAME', '!build/data/**', '!build/videos/**']).then((paths) => {
    console.log(chalk.gray('Deleted files/folders:\n', paths.join('\n')));
    console.log(chalk.cyan('..::| FINISHED cleaning |::..'));

    if (cb) {
      cb();
    }
  });
}

export function softClean(cb) {
  del(['build/js']).then((paths) => {
    if (cb) {
      cb();
    }
  });
}
