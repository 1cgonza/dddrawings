const fs         = require('fs');
const path       = require('path');
const Handlebars = require('handlebars');

function helpers() {
  Handlebars.registerPartial({
    head: fs.readFileSync(
      path.resolve(__dirname, '../layouts/partials/head.hbs')
    ).toString(),

    footer: fs.readFileSync(
      path.resolve(__dirname, '../layouts/partials/footer.hbs')
    ).toString()
  });

  Handlebars.registerHelper({
    debug:            require('./hbs-helpers/debug'),
    siteNav:          require('./hbs-helpers/site-nav'),
    bodyClass:        require('./hbs-helpers/body-class'),
    pageTitle:        require('./hbs-helpers/page-title'),
    pageDescription:  require('./hbs-helpers/page-description'),
    featuredImg:      require('./hbs-helpers/featured-image'),
    getThumb:         require('./hbs-helpers/thumbnail'),
    setLibraries:     require('./hbs-helpers/external-libraries'),
    setVideos:        require('./hbs-helpers/videos'),
    setScripts:       require('./hbs-helpers/script-tags'),
    setURL:           require('./hbs-helpers/set-url'),
    getRelatedPosts:  require('./hbs-helpers/related'),
    analytics:        require('./hbs-helpers/analytics')
  });
}

module.exports = helpers;
