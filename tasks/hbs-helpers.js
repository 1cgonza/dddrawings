import { readFileSync } from 'fs';
import Handlebars from 'handlebars';

import analytics from './hbs-helpers/analytics';
import bodyClass from './hbs-helpers/bodyClass';
import debug from './hbs-helpers/debug';
import externalScripts from './hbs-helpers/externalScripts';
import featuredImage from './hbs-helpers/featuredImage';
import pageDescription from './hbs-helpers/pageDescription';
import pageTitle from './hbs-helpers/pageTitle';
import related from './hbs-helpers/related';
import scriptTags from './hbs-helpers/scriptTags';
import setJS from './hbs-helpers/setJs';
import setURL from './hbs-helpers/setUrl';
import siteNav from './hbs-helpers/siteNav';
import thumbnail from './hbs-helpers/thumbnail';
import videos from './hbs-helpers/videos';

export default () => {
  Handlebars.registerPartial({
    head: readFileSync(`${__dirname}/layouts/partials/head.hbs`).toString(),
    footer: readFileSync(`${__dirname}/layouts/partials/footer.hbs`).toString()
  });

  Handlebars.registerHelper({
    analytics: analytics,
    bodyClass: bodyClass,
    debug: debug,
    setExtScripts: externalScripts,
    featuredImg: featuredImage,
    pageDescription: pageDescription,
    pageTitle: pageTitle,
    getRelatedPosts: related,
    setScripts: scriptTags,
    setJS: setJS,
    setURL: setURL,
    siteNav: siteNav,
    getThumb: thumbnail,
    setVideos: videos
  });
};
