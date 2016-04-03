var TextureUvs = function(frame, sprite) {
  var tw = sprite.width;
  var th = sprite.height;

  this.x0 = frame.x / tw;
  this.y0 = frame.y / th;

  this.x1 = (frame.x + frame.width) / tw;
  this.y1 = frame.y / th;

  this.x2 = (frame.x + frame.width) / tw;
  this.y2 = (frame.y + frame.height) / th;

  this.x3 = frame.x / tw;
  this.y3 = (frame.y + frame.height) / th;
};

module.exports = TextureUvs;
