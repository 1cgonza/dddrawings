import {SafeString} from 'handlebars';
import metadata from '../config';

module.exports = function() {
  let script = '';
  if (metadata.env !== 'dev') {
    script = '< !--Global site tag(gtag.js) - Google Analytics-- >' +
    '<script async src="https://www.googletagmanager.com/gtag/js?id=UA-18482571-2"></script>' +
    '<script>window.dataLayer = window.dataLayer || [];' +
    'function gtag(){dataLayer.push(arguments); }' +
      'gtag("js", new Date());' +
      'gtag("config", "UA - 18482571 - 2");</script>';
  }
  return new SafeString(script);

};
