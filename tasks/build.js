import Metalsmith from 'metalsmith';
import chalk from 'chalk';
import metadata from './config.js';
import server from './buildPlugins/server.js';
import { fileURLToPath } from 'url';

// Plugins
import changed from './buildPlugins/changed.js';
import drafts from './buildPlugins/drafts.js';
import ignore from './buildPlugins/ignore.js';
import collections from './buildPlugins/collections.js';
import sass from './buildPlugins/sass.js';
import autoprefixer from './buildPlugins/autoprefixer.js';
import markdown from './buildPlugins/markdown.js';
import excerpts from './buildPlugins/excerpts.js';
import slugs from './buildPlugins/slugs.js';
import layoutHelpers from './buildPlugins/layoutHelpers.js';
import layoutPartials from './buildPlugins/layoutPartials.js';
import layouts from './buildPlugins/layouts.js';
import html from './buildPlugins/html.js';
import images from './buildPlugins/images.js';
import jsBundle from './buildPlugins/jsBundle.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const build = (callback) => {
  new Metalsmith(__dirname)
    .source('../src')
    .destination('../build')
    .clean(false)
    .metadata(metadata)
    .use(changed)
    .use(drafts)
    .use(ignore)
    .use(jsBundle)
    .use(collections)
    .use(sass)
    .use(autoprefixer)
    .use(markdown)
    .use(excerpts)
    .use(slugs)
    .use(layoutHelpers)
    .use(layoutPartials) /* f */
    .use(layouts)
    .use(html)
    .use(images)
    .use(changed)
    .build((err) => {
      if (err) {
        throw err;
      }

      if (callback) {
        callback();
      }

      if (metadata.env === 'prod') {
        console.log(chalk.yellow('..::| Production build is done |::..'));
      }
    });
};

export const serve = () => {
  server(build);
};
