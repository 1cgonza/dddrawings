function ParticleBuffer(gl, properties, dynamicPropertyFlags, size) {
  this.gl = gl;
  this.vertSize = 2;
  this.vertByteSize = this.vertSize * 4;
  this.size = size;
  this.dynamicProperties = [];
  this.staticProperties = [];

  for (var i = 0; i < properties.length; i++) {
    var property = properties[i];

    if (dynamicPropertyFlags[i]) {
      this.dynamicProperties.push(property);
    } else {
      this.staticProperties.push(property);
    }
  }

  this.staticStride = 0;
  this.staticBuffer = null;
  this.staticData = null;

  this.dynamicStride = 0;
  this.dynamicBuffer = null;
  this.dynamicData = null;

  this.initBuffers();
}

ParticleBuffer.prototype.constructor = ParticleBuffer;
module.exports = ParticleBuffer;

ParticleBuffer.prototype.initBuffers = function() {
  var gl = this.gl;
  var i;
  var property;

  var dynamicOffset = 0;
  this.dynamicStride = 0;

  for (i = 0; i < this.dynamicProperties.length; i++) {
    property = this.dynamicProperties[i];

    property.offset = dynamicOffset;
    dynamicOffset += property.size;
    this.dynamicStride += property.size;
  }

  this.dynamicData = new Float32Array(this.size * this.dynamicStride * 4);
  this.dynamicBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.dynamicData, gl.DYNAMIC_DRAW);

  // static //
  var staticOffset = 0;
  this.staticStride = 0;

  for (i = 0; i < this.staticProperties.length; i++) {
    property = this.staticProperties[i];

    property.offset = staticOffset;
    staticOffset += property.size;
    this.staticStride += property.size;
  }

  this.staticData = new Float32Array(this.size * this.staticStride * 4);
  this.staticBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, this.staticBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.staticData, gl.DYNAMIC_DRAW);
};

ParticleBuffer.prototype.uploadDynamic = function(children, startIndex, amount) {
  var gl = this.gl;

  for (var i = 0; i < this.dynamicProperties.length; i++) {
    var property = this.dynamicProperties[i];
    property.uploadFunction(children, startIndex, amount, this.dynamicData, this.dynamicStride, property.offset);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.dynamicData);
};

ParticleBuffer.prototype.uploadStatic = function(children, startIndex, amount) {
  var gl = this.gl;

  for (var i = 0; i < this.staticProperties.length; i++) {
    var property = this.staticProperties[i];
    property.uploadFunction(children, startIndex, amount, this.staticData, this.staticStride, property.offset);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.staticBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.staticData);
};

ParticleBuffer.prototype.bind = function() {
  var gl = this.gl;
  var i;
  var property;

  gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);

  for (i = 0; i < this.dynamicProperties.length; i++) {
    property = this.dynamicProperties[i];
    gl.vertexAttribPointer(property.attribute, property.size, gl.FLOAT, false, this.dynamicStride * 4, property.offset * 4);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.staticBuffer);

  for (i = 0; i < this.staticProperties.length; i++) {
    property = this.staticProperties[i];
    gl.vertexAttribPointer(property.attribute, property.size, gl.FLOAT, false, this.staticStride * 4, property.offset * 4);
  }
};
