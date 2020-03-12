import deploy from './tasks/deploy';
import { clean, softClean } from './tasks/clean';
import { build, serve } from './tasks/build';
import metadata from './tasks/config';
import ImgManager from './tasks/ImagesManager';

function init() {
  if (metadata.env === 'clean') {
    clean();
  } else if (metadata.env === 'deploy') {
    clean(buildAndDeploy);
  } else if (metadata.env === 'prod') {
    softClean(build);
  } else {
    // The default mode will be development
    // This will launch browserSync to work locally
    softClean(serve);
  }
}

function buildAndDeploy() {
  build(deploy);
}

if (process.argv.indexOf('--img') >= 0) {
  const options = {
    force: true,
    log: 'verbose'
  };
  const manager = new ImgManager();

  manager.process(options, init);
} else {
  init();
}
