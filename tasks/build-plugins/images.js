const ImgManager = require('../Images-manager');
const manager = new ImgManager();

module.exports = manager.plugin({
  log: 'new'
});
