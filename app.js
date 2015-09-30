var hbs          = require('handlebars');
var circularJSON = require('circular-json');
var deploy       = require('./deploy');
var clean        = require('./clean');
var build        = require('./build');
var metadata     = require('./config')(process.argv);
require('./hbs-helpers')(hbs);

if (metadata.env === 'clean') {
  clean();
} else if(metadata.env === 'deploy') {
  clean(buildAndDeploy);
} else if (metadata.env === 'prod') {
  build.once();
} else {
  // The default mode will be development
  // This will launch browserSync to work locally
  build.serve();
}

function buildAndDeploy () {
  build.once(deploy);
}
