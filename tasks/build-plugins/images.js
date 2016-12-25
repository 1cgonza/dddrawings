const imgManager   = require('../utils/images-manager').plugin;
const metadata     = require('../config')(process.argv);

module.exports = imgManager({
  log: 'new',
  env: metadata.env
});
