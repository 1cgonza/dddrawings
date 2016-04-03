var math = require('../../math');

var RenderTarget = function(gl, width, height) {
  this.gl = gl;
  this.frameBuffer = null;

  this.size = new math.Rectangle(0, 0, 1, 1);
  this.projectionMatrix = new math.Matrix();
  this.transform = null;
  this.stencilBuffer = null;
  this.filterStack = [{
    renderTarget: this,
    filter: [],
    bounds: this.size
  }];

  this.resize(width, height);
  this.activate();
};

module.exports = RenderTarget;

RenderTarget.prototype.clear = function(bind) {
  var gl = this.gl;
  if (bind) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
  }

  gl.clearColor(0,0,0,0);
  gl.clear(gl.COLOR_BUFFER_BIT);
};

RenderTarget.prototype.activate = function() {
  //TOOD refactor usage of frame..
  var gl = this.gl;

  gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

  var projectionFrame = this.size;

  // TODO add a dirty flag to this of a setter for the frame?
  this.calculateProjection(projectionFrame);

  gl.viewport(0,0, projectionFrame.width, projectionFrame.height);
};

RenderTarget.prototype.calculateProjection = function(projectionFrame) {
  var pm = this.projectionMatrix;

  pm.identity();

  pm.a = 1 / projectionFrame.width * 2;
  pm.d = -1 / projectionFrame.height * 2;
  pm.tx = -1 - projectionFrame.x * pm.a;
  pm.ty = 1 - projectionFrame.y * pm.d;
};

RenderTarget.prototype.resize = function(width, height) {
  width = width | 0;
  height = height | 0;

  if (this.size.width === width && this.size.height === height) {
    return;
  }

  this.size.width = width;
  this.size.height = height;

  var projectionFrame = this.size;

  this.calculateProjection(projectionFrame);
};
