const metadata = require('../config')(process.argv);
const path     = require('path');
const url      = require('url');

module.exports = function(pre, slug, withTail) {
  pre      = Array.isArray(pre) ? pre[0] : pre;
  pre      = typeof pre === 'string' ? pre : '';
  slug     = typeof slug === 'string' &&  pre !== slug ? slug : '';
  withTail = typeof withTail === 'boolean' && withTail ? '/' : '';

  return url.resolve(metadata.baseUrl, path.join(pre, slug, withTail));
};
