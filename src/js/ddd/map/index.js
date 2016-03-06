var math = require('../math');
/**
 * Create a new map instance
 *
 * USAGE: var map = new DDD.Map({zoom: #, width: #, height: #, center: {lon: #, lat: #}});
 *
 * @param {Object} config             An object with the configuration options
 * @param {Number} config.zoom        The map zoom
 * @param {Number} config.width       The width of the map container
 * @param {Number} config.height      The height of the map container
 * @param {Object} config.center      Object with the longitude and latitude options for the center of the map
 * @param {Number} config.center.lon  Map center longitude
 * @param {Number} config.center.lat  Map center latitude
 */
function Map(config) {
  var w = config.width || window.innerWidth;
  var h = config.height || window.innerHeight;
  var zoom = config.zoom || 11;

  if (config.center) {
    this.center = {
      lon: config.center.lon,
      lat: config.center.lat
    };
  } else {
    this.center = {};
  }

  this.hasCenter  = null;
  this.updateSize(w, h, zoom);
}

Map.prototype.updateSize = function(w, h, zoom) {
  this.stageWidth   = w;
  this.stageCenterY = h / 2;
  this.zoom         = zoom || this.zoom;
  this.zoomX        = this.stageWidth * this.zoom;
  this.zoomY        = this.stageCenterY * this.zoom;
  this.zoomRad      = this.zoomX / 360;

  this.newCenter(this.center.lon, this.center.lat);
};

Map.prototype.newCenter = function(lon, lat) {
  this.hasCenter = false;
  this.convertCoordinates(lon, lat);
  this.hasCenter = true;
};

Map.prototype.convertCoordinates = function(lon, lat) {
  var latRad = +lat * math.toRad;
  var mercatorN = Math.log(Math.tan(math.QUARTER_PI + (latRad / 2)));
  var x = (+lon + 180) * this.zoomRad;
  var y = (this.zoomY - (this.zoomX * mercatorN / math.TWO_PI));

  if (this.hasCenter) {
    x -= this.center.x;
    y -= this.center.y;
  } else {
    this.center.x = x;
    this.center.y = y;
  }

  return {x: x, y: y};
};

module.exports = Map;
