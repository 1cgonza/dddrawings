// From Three.js Vector3
// https://github.com/mrdoob/three.js/blob/cf584a60bdfd24c42eaa81d484533364742bda44/src/math/Vector3.js
// All credits to them

var Vector = function(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
};

module.exports = Vector;

Vector.prototype.set = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  return this;
};

Vector.prototype.setX = function(x) {
  this.x = x;
  return this;
};

Vector.prototype.setY = function(y) {
  this.y = y;
  return this;
};

Vector.prototype.setZ = function(z) {
  this.z = z;
  return this;
};

Vector.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
  this.z += v.z;
  return this;
};

Vector.prototype.addScalar = function(s) {
  this.x += s;
  this.y += s;
  this.z += s;
  return this;
};

Vector.prototype.sub = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  this.z -= v.z;
  return this;
};

Vector.prototype.subScalar = function(s) {
  this.x -= s;
  this.y -= s;
  this.z -= s;
  return this;
};

Vector.prototype.subVectors = function(a, b) {
  this.x = a.x - b.x;
  this.y = a.y - b.y;
  this.z = a.z - b.z;
  return this;
};

Vector.prototype.multiply = function(v) {
  this.x *= v.x;
  this.y *= v.y;
  this.z *= v.z;
  return this;
};

Vector.prototype.multiplyScalar = function(s) {
  if (isFinite(s)) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
  } else {
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
  return this;
};

Vector.prototype.multiplyVectors = function(a, b) {
  this.x = a.x * b.x;
  this.y = a.y * b.y;
  this.z = a.z * b.z;
  return this;
};

Vector.prototype.divide = function(v) {
  this.x /= v.x;
  this.y /= v.y;
  this.z /= v.z;
  return this;
};

Vector.prototype.divideScalar = function(s) {
  return this.multiplyScalar(1 / s);
};

Vector.prototype.lengthSq = function() {
  return this.x * this.x + this.y * this.y + this.z * this.z;
};

Vector.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};

Vector.prototype.setLength = function(length) {
  return this.multiplyScalar(length / this.length());
};

Vector.prototype.distanceTo = function(v) {
  return Math.sqrt(this.distanceToSquared(v));
};

Vector.prototype.normalize = function() {
  return this.divideScalar(this.length());
};

Vector.prototype.distanceToSquared = function(v) {
  var dx = this.x - v.x;
  var dy = this.y - v.y;
  var dz = this.z - v.z;
  return dx * dx + dy * dy + dz * dz;
};

Vector.prototype.copy = function(v) {
  this.x = v.x;
  this.y = v.y;
  this.z = v.z;
  return this;
};

