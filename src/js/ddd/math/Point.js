var Point = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

module.exports = Point;

Point.prototype.clone = function() {
  return new Point(this.x, this.y);
};

Point.prototype.copy = function(p) {
  this.set(p.x, p.y);
};

Point.prototype.equals = function(p) {
  return (p.x === this.x) && (p.y === this.y);
};

Point.prototype.set = function(x, y) {
  this.x = x || 0;
  this.y = y || y !== 0 ? this.x : 0;
};
