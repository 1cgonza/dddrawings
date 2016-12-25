const chalk    = require('chalk');
const metadata = require('../config.js')(process.argv);

var done = function(callback) {
  return function(err) {
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

module.exports = done;
