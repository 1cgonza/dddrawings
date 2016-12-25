const SafeString   = require('handlebars').SafeString;
const circularJSON = require('circular-json');

module.exports = function(context) {
  return new SafeString(
    '<pre class="debug"><code class="json">' +
      circularJSON.stringify(context, null, 2)  +
    '</code></pre>'
  );
};
