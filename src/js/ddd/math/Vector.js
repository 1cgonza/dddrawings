var Vector = function(x, y, z) {
  this.set(x || 0, y || 0, z || 0);
};

module.exports = Vector;

Vector.prototype.add = function(v, w) {
  this.x += v.x;
  this.y += v.y;
  return this;
};

Vector.prototype.set = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  return this;
};

Vector.prototype.divideScalar = function(scalar) {
  return this.multiplyScalar(1 / scalar);
};

Vector.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.distanceTo = function(v) {
  return Math.sqrt(this.distanceToSquared(v));
};

Vector.prototype.subVectors = function(a, b) {
  this.x = a.x - b.x;
  this.y = a.y - b.y;
  this.z = a.z - b.z;
  this.w = a.w - b.w;

  return this;
};

Vector.prototype.normalize = function() {
  return this.divideScalar(this.length());
};

Vector.prototype.multiplyScalar = function(scalar) {
  if (isFinite(scalar)) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
  } else {
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }

  return this;
};

Vector.prototype.distanceToSquared = function(v) {
  var dx = this.x - v.x;
  var dy = this.y - v.y;
  var dz = this.z - v.z;
  return dx * dx + dy * dy + dz * dz;
};

Vector.prototype.sub = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  this.z -= v.z;

  return this;
};

Vector.prototype.copy = function(a) {
  this.x = a.x;
  this.y = a.y;
  this.z = a.z;
  return this;
};

