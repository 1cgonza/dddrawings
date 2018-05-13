import deploy from './tasks/deploy';
import clean from './tasks/clean';
import build from './tasks/build';
import metadata from './tasks/config';
import ImgManager from './tasks/Images-manager';

function init() {
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
}

function buildAndDeploy() {
  build.once(deploy);
}

if (process.argv.indexOf('--img') >= 0) {
  var options = {
    force: true,
    log: 'verbose'
  };
  var manager = new ImgManager();

  manager.process(options, init);
} else {
  init();
}
