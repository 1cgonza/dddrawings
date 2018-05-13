import { SafeString } from 'handlebars';
import circularJSON from 'circular-json';

module.exports = (context) => {
  return new SafeString(
    '<pre class="debug"><code class="json">' +
      circularJSON.stringify(context, null, 2)  +
    '</code></pre>'
  );
};
