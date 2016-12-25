module.exports = function(scripts, link) {
  var ret = '';
  var tag = '';

  if (Array.isArray(scripts)) {
    scripts.forEach(function(script) {
      tag = '<script src="' + link + script + '.js"></script>';
      ret += tag;
    });
  } else {
    tag = '<script src="' + link + scripts + '.js"></script>';
    ret += tag;
  }

  return ret;
};
