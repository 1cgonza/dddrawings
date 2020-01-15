import { SafeString } from 'handlebars';

module.exports = function(scripts) {
  let tags = '';

  if (Array.isArray(scripts)) {
    scripts.forEach(url => {
      tags += '<script async defer src="' + url + '"></script>';
    });
  }

  return new SafeString(tags);
};
