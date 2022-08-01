import jsBundle from '@metalsmith/js-bundle';
import { readdirSync } from 'fs';
import { resolve } from 'path';

const entries = ((base) => {
  let ret = {
    site: base + '/site.js',
  };

  function appendEntries(folder) {
    let folders = readdirSync(base + folder);
    folders.forEach((name) => {
      if (name === '.DS_Store') return;
      ret[name] = base + folder + '/' + name + '/index.js';
    });
  }

  appendEntries('/lab');
  appendEntries('/notations');

  return ret;
})(resolve('./src/js'));

export default jsBundle({
  entries: entries,
  loader: {
    '.vs': 'text',
    '.fs': 'text',
  },
  outdir: 'js',
});
