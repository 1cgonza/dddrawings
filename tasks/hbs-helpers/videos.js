import {SafeString} from 'handlebars';
import metadata from '../config';

module.exports = (videos) => {
  let ret = '';
  const link = metadata.videosPath;
  videos.forEach((video, i) => {
    for (let type in video) {
      ret += '<source src="' + link + video[type] + '" type="video/' + type + '">';
    }
  });

  return new SafeString(ret);
};
