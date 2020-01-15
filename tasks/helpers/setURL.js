import metadata from '../config';
import { join } from 'path';
import { resolve } from 'url';

module.exports = function(pre, slug, withTail) {
  pre = Array.isArray(pre) ? pre[0] : pre;
  pre = typeof pre === 'string' ? pre : '';
  slug = typeof slug === 'string' && pre !== slug ? slug : '';
  withTail = typeof withTail === 'boolean' && withTail ? '/' : '';

  return resolve(metadata.baseUrl, join(pre, slug, withTail));
};
