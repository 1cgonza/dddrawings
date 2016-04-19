var math = require('../../math');
var ParticleBuffer = require('./ParticleBuffer');
var Shader = require('./Shader');

var ObjectRenderer = function(renderer) {
  var numIndices = 98304;
  this.indices = new Uint16Array(numIndices);

  for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
    this.indices[i + 0] = j + 0;
    this.indices[i + 1] = j + 1;
    this.indices[i + 2] = j + 2;
    this.indices[i + 3] = j + 0;
    this.indices[i + 4] = j + 2;
    this.indices[i + 5] = j + 3;
  }

  this.shader = new Shader(renderer.gl);
  this.indexBuffer = null;
  this.properties = null;
  this.tempMatrix = new math.Matrix();
  this.renderer = renderer;
  this.start();
};

module.exports = ObjectRenderer;

ObjectRenderer.prototype.start = function() {
  var gl = this.renderer.gl;

  gl.activeTexture(gl.TEXTURE0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

  gl.useProgram(this.shader.program);

  this.renderer.setShader();
  this.onContextChange();
};

ObjectRenderer.prototype.render = function(container) {
  var texture = container.texture;
  var children = container.children;
  var totalChildren = children.length;
  var maxSize = container.maxSize;
  var batchSize = container.batchSize;

  if (totalChildren === 0) {
    return;
  } else if (totalChildren > maxSize) {
    totalChildren = maxSize;
  }

  if (!container.buffers) {
    container.buffers = this.generateBuffers(container);
  }

  var gl = this.renderer.gl;

  var m =  container.worldTransform.copy(this.tempMatrix);
  m.prepend(this.renderer.renderTarget.projectionMatrix);
  gl.uniformMatrix3fv(this.shader.uniforms.projectionMatrix._location, false, m.toArray(true));
  gl.uniform1f(this.shader.uniforms.uAlpha._location, container.worldAlpha);

  gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);

  // now lets upload and render the buffers..
  for (var i = 0, j = 0; i < totalChildren; i += batchSize, j += 1) {
    var amount = (totalChildren - i);
    if (amount > batchSize) {
      amount = batchSize;
    }

    var buffer = container.buffers[j];
    // we always upload the dynamic
    buffer.uploadDynamic(children, i, amount);

    // we only upload the static content when we have to!
    if (container._bufferToUpdate === j) {
      buffer.uploadStatic(children, i, amount);
      container._bufferToUpdate = j + 1;
    }

    // bind the buffer
    buffer.bind(this.shader);

    // now draw those suckas!
    gl.drawElements(gl.TRIANGLES, amount * 6, gl.UNSIGNED_SHORT, 0);
  }
};

ObjectRenderer.prototype.generateBuffers = function(container) {
  var gl = this.renderer.gl;
  var buffers = [];
  var size = container.maxSize;
  var batchSize = container.batchSize;
  var dynamicPropertyFlags = container.properties;
  var i;

  for (i = 0; i < size; i += batchSize) {
    buffers.push(new ParticleBuffer(gl, this.properties, dynamicPropertyFlags, batchSize));
  }

  return buffers;
};

ObjectRenderer.prototype.uploadVertices = function(children, startIndex, amount, array, stride, offset) {
  for (var i = 0; i < amount; i++) {
    var target = children[startIndex + i];
    var currentFrame = target.frame;

    var texture = this.renderer.frames[currentFrame];
    var tx = target.scale.x;
    var ty = target.scale.y;

    var w0 = (texture.width) * (1 - target.anchor.x);
    var w1 = (texture.width) * -target.anchor.x;

    var h0 = texture.height * (1 - target.anchor.y);
    var h1 = texture.height * -target.anchor.y;

    array[offset] = w1 * tx;
    array[offset + 1] = h1 * ty;

    array[offset + stride] = w0 * tx;
    array[offset + stride + 1] = h1 * ty;

    array[offset + stride * 2] = w0 * tx;
    array[offset + stride * 2 + 1] = h0 * ty;

    array[offset + stride * 3] = w1 * tx;
    array[offset + stride * 3 + 1] = h0 * ty;

    offset += stride * 4;
  }
};

ObjectRenderer.prototype.uploadPosition = function(children, startIndex, amount, array, stride, offset) {
  for (var i = 0; i < amount; i++) {
    var x = children[startIndex + i].x;
    var y = children[startIndex + i].y;

    array[offset] = x;
    array[offset + 1] = y;

    array[offset + stride] = x;
    array[offset + stride + 1] = y;

    array[offset + stride * 2] = x;
    array[offset + stride * 2 + 1] = y;

    array[offset + stride * 3] = x;
    array[offset + stride * 3 + 1] = y;

    offset += stride * 4;
  }
};

ObjectRenderer.prototype.uploadRotation = function(children, startIndex, amount, array, stride, offset) {
  for (var i = 0; i < amount; i++) {
    var spriteRotation = children[startIndex + i].rotation;

    array[offset] = spriteRotation;
    array[offset + stride] = spriteRotation;
    array[offset + stride * 2] = spriteRotation;
    array[offset + stride * 3] = spriteRotation;

    offset += stride * 4;
  }
};

ObjectRenderer.prototype.uploadUvs = function(children, startIndex, amount, array, stride, offset) {
  for (var i = 0; i < amount; i++) {
    var target = children[startIndex + i];
    var currentFrame = target.frame;
    var textureUvs = this.renderer.frames[currentFrame].uvs;

    array[offset] = textureUvs.x0;
    array[offset + 1] = textureUvs.y0;

    array[offset + stride] = textureUvs.x1;
    array[offset + stride + 1] = textureUvs.y1;

    array[offset + stride * 2] = textureUvs.x2;
    array[offset + stride * 2 + 1] = textureUvs.y2;

    array[offset + stride * 3] = textureUvs.x3;
    array[offset + stride * 3 + 1] = textureUvs.y3;

    offset += stride * 4;
  }
};

ObjectRenderer.prototype.uploadAlpha = function(children, startIndex, amount, array, stride, offset) {
  for (var i = 0; i < amount; i++) {
    var spriteAlpha = children[startIndex + i].alpha;

    array[offset] = spriteAlpha;
    array[offset + stride] = spriteAlpha;
    array[offset + stride * 2] = spriteAlpha;
    array[offset + stride * 3] = spriteAlpha;

    offset += stride * 4;
  }
};

ObjectRenderer.prototype.onContextChange = function() {
  var gl = this.renderer.gl;

  this.indexBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

  this.properties = [
    // verticesData
    {
      attribute: this.shader.attributes.aVertexPosition,
      size: 2,
      uploadFunction: this.uploadVertices.bind(this),
      offset: 0
    },
    // positionData
    {
      attribute: this.shader.attributes.aPositionCoord,
      size: 2,
      uploadFunction: this.uploadPosition,
      offset: 0
    },
    // rotationData
    {
      attribute: this.shader.attributes.aRotation,
      size: 1,
      uploadFunction: this.uploadRotation,
      offset: 0
    },
    // uvsData
    {
      attribute: this.shader.attributes.aTextureCoord,
      size: 2,
      uploadFunction: this.uploadUvs.bind(this),
      offset: 0
    },
    // alphaData
    {
      attribute: this.shader.attributes.aColor,
      size: 1,
      uploadFunction: this.uploadAlpha,
      offset: 0
    }
  ];
};
