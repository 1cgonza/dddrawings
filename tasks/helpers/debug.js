import hb from 'handlebars';
import { stringify } from '@ungap/structured-clone/json';

export default (context) => {
  return new hb.SafeString('<pre class="debug"><code class="json">' + stringify(context, null, 2) + '</code></pre>');
};
