var math = require('../math');

var Stage = function(imgData, renderer, batchSize, properties, maxSize) {
  this.children = [];
  this.texture = {};
  this.data = imgData;
  this.renderer = renderer;

  this.loadImg(imgData.url);

  this.worldAlpha = 1;
  this.worldTransform = new math.Matrix();

  this._maxSizeCache = batchSize;
  this.batchSize = batchSize || 15000;
  this.maxSize = maxSize || 15000;

  this.setBatchSize(batchSize, maxSize);

  properties = properties || {};
  this.properties = [
    false, // scale
    true,  // position
    false, // rotation
    false, // uvs
    false  // alpha
  ];

  this.buffers = null;
  this._bufferToUpdate = 0;

  if (properties) {
    this.properties[0] = 'scale' in properties ? !!properties.scale : this.properties[0];
    this.properties[1] = 'position' in properties ? !!properties.position : this.properties[1];
    this.properties[2] = 'rotation' in properties ? !!properties.rotation : this.properties[2];
    this.properties[3] = 'uvs' in properties ? !!properties.uvs : this.properties[3];
    this.properties[4] = 'alpha' in properties ? !!properties.alpha : this.properties[4];
  }
};

module.exports = Stage;

Stage.prototype.setBatchSize = function(batchSize, maxSize) {
  var maxBatchSize = 16384;

  if (batchSize > maxBatchSize) {
    batchSize = maxBatchSize;
  }
  if (batchSize > maxSize) {
    batchSize = maxSize;
  }
  this.batchSize = batchSize;
};

Stage.prototype.renderWebGL = function(renderer) {
  renderer.currentRenderer.render(this);
};

Stage.prototype.bindTexture = function() {
  var gl = this.renderer.gl;

  var texture = this.texture;
  if (!texture.glTexture) {
    texture.glTexture = gl.createTexture();
  }

  gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);

  /*----------  SET ALPHA  ----------*/
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.img);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  if (texture.mipmap && texture.isPowerOfTwo) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  if (!texture.isPowerOfTwo) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  }

  return true;
};

Stage.prototype.loadImg = function(url) {
  this.img = new Image();
  this.img.onload = this.imgLoaded.bind(this);
  this.img.src = url;
};

Stage.prototype.imgLoaded = function() {
  var w = this.img.naturalWidth;
  var h = this.img.naturalHeight;

  var texture = {
    loaded: true,
    isPowerOfTwo: math.isPowerOfTwo(w, h)
  };

  var frames = [];
  for (var i = 0; i < this.data.frames.length; i++) {
    var frame = this.data.frames[i];
    var crop = new math.Rectangle(frame.x, frame.y, frame.w, frame.h);

    frames.push({
      width: frame.w,
      height: frame.h,
      uvs: new math.TextureUvs(crop, {width: w, height: h})
    });
  }
  this.renderer.frames = frames;
  this.texture = texture;
  this.bindTexture();

  if (this.data.cb) {
    this.data.cb();
  }
};

Stage.prototype.particle = function(obj) {
  obj = obj || {};
  obj.anchor = obj.anchor || new DDD.Point(0.5);
  obj.scale = obj.scale || new DDD.Point(1, 1);
  obj.alpha = obj.alpha || 1;
  obj.rotation = obj.rotation || 0;
  obj.x = obj.x || 0;
  obj.y = obj.y || 0;
  obj.frame = obj.frame || 0;

  this.children.push(obj);

  if (this.children.length > this.batchSize) {
    this.setBatchSize(this.children.length, this._maxSizeCache);
  }
  return obj;
};
