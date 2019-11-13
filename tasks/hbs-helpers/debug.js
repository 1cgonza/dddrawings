import { SafeString } from 'handlebars';
import { stringify } from 'flatted/cjs';

export default context => {
  return new SafeString('<pre class="debug"><code class="json">' + stringify(context, null, 2) + '</code></pre>');
};
