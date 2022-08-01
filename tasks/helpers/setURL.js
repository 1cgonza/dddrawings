import metadata from '../config.js';
import { join } from 'path';

export default (pre, slug, withTail) => {
  pre = Array.isArray(pre) ? pre[0] : pre;
  pre = typeof pre === 'string' ? pre : '';
  slug = typeof slug === 'string' && pre !== slug ? slug : '';
  withTail = typeof withTail === 'boolean' && withTail ? '/' : '';
  return join(metadata.baseUrl, join(pre, slug, withTail));
};
