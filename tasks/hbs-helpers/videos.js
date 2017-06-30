const SafeString = require('handlebars').SafeString;
const metadata   = require('../config')(process.argv);

module.exports = function(videos) {
  var ret = '';
  var link = metadata.videosPath;
  videos.forEach(function(video, i) {
    for (var type in video) {
      ret += '<source src="' + link + video[type] + '" type="video/' + type + '">';
    }
  });

  return new SafeString(ret);
};
