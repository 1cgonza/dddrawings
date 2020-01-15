module.exports = function(scripts, link) {
  let ret = '';
  let tag = '';

  if (Array.isArray(scripts)) {
    scripts.forEach(script => {
      tag = '<script src="' + link + script + '.js"></script>';
      ret += tag;
    });
  } else {
    tag = '<script src="' + link + scripts + '.js"></script>';
    ret += tag;
  }

  return ret;
};
