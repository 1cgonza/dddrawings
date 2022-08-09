import deploy from './tasks/deploy.js';
import { clean } from './tasks/clean.js';
import { build, serve } from './tasks/build.js';
import metadata from './tasks/config.js';
import ImgManager from './tasks/ImagesManager.js';

function init() {
  if (metadata.env === 'clean') {
    clean();
  } else if (metadata.env === 'deploy') {
    clean(buildAndDeploy);
  } else if (metadata.env === 'prod') {
    build();
  } else {
    // The default mode will be development
    // This will launch browserSync to work locally
    serve();
  }
}

function buildAndDeploy() {
  build(deploy);
}

if (process.argv.indexOf('--img') >= 0) {
  const options = {
    force: true,
    log: 'verbose',
  };
  const manager = new ImgManager();

  manager.process(options, init);
} else {
  init();
}
