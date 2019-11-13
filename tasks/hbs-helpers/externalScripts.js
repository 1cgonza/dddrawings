import { SafeString } from 'handlebars';

export default scripts => {
  let tags = '';

  if (Array.isArray(scripts)) {
    scripts.forEach(url => {
      tags += '<script async defer src="' + url + '"></script>';
    });
  }

  return new SafeString(tags);
};
