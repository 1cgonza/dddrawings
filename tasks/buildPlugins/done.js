import chalk from 'chalk';
import metadata from './tasks/config';

export default (callback) => {
  return (err) => {
    if (err) {
      throw err;
    }

    if (callback) {
      callback();
    }

    if (metadata.env === 'prod') {
      console.log(chalk.yellow('..::| Production build is done |::..'));
    }
  };
};
