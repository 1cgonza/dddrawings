import metadata from '../config';
import path from 'path';
import url from 'url';

module.exports = (pre, slug, withTail) => {
  pre      = Array.isArray(pre) ? pre[0] : pre;
  pre      = typeof pre === 'string' ? pre : '';
  slug     = typeof slug === 'string' &&  pre !== slug ? slug : '';
  withTail = typeof withTail === 'boolean' && withTail ? '/' : '';

  return url.resolve(metadata.baseUrl, path.join(pre, slug, withTail));
};
