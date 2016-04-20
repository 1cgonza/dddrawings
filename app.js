var hbs      = require('handlebars');
var deploy   = require('./deploy');
var clean    = require('./clean');
var build    = require('./build');
var metadata = require('./config')(process.argv);
var imgManager = require('./images-manager').process;
require('./hbs-helpers')(hbs);

if (process.argv.indexOf('--img') >= 0) {
  imgManager({
    force: true,
    log: 'verbose'
  });
}

if (metadata.env === 'clean') {
  clean();
} else if (metadata.env === 'deploy') {
  clean(buildAndDeploy);
} else if (metadata.env === 'prod') {
  build.once();
} else {
  // The default mode will be development
  // This will launch browserSync to work locally
  build.serve();
}

function buildAndDeploy() {
  build.once(deploy);
}
