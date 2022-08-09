import chalk from 'chalk';
import { deleteSync } from 'del';

export function clean(cb) {
  console.log(chalk.cyan('..::| START cleaning |::..'));

  const paths = deleteSync(['build/**', '!build', '!build/CNAME', '!build/data/**', '!build/videos/**']);
  console.log(chalk.gray('Deleted files/folders:\n', paths.join('\n')));
  console.log(chalk.cyan('..::| FINISHED cleaning |::..'));

  if (cb) {
    cb();
  }
}
