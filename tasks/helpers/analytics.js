import hb from 'handlebars';
import metadata from '../config.js';

export default () => {
  let script = '';

  if (metadata.env !== 'dev') {
    script =
      '<script async src="https://www.googletagmanager.com/gtag/js?id=UA-18482571-2"></script>' +
      '<script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}' +
      'gtag("js", new Date());gtag("config", "UA-18482571-2");</script>';
  }

  return new hb.SafeString(script);
};
