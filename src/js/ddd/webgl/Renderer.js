var RenderTarget = require('./utils/RenderTarget');
var ObjectRenderer = require('./utils/ObjectRenderer');

var Renderer = function(container, canvasOptions, renderOptions) {
  this.container = container;
  canvasOptions = canvasOptions || {};

  this.width = canvasOptions.width || window.innerWidth;
  this.height = canvasOptions.height || window.innerHeight;
  this.canvas = document.createElement('canvas');
  this.canvas.style.position = 'absolute';
  container.appendChild(this.canvas);

  renderOptions = renderOptions || {};
  var ctxOptions = {
    alpha: renderOptions.alpha || true,
    antialias: renderOptions.antialias || false,
    premultipliedAlpha: renderOptions.premiltipliedAlpha || true,
    stencil: renderOptions.stencil || false,
    preserveDrawingBuffer: renderOptions.preserveDrawingBuffer || false
  };

  var gl = this.canvas.getContext('webgl', ctxOptions) || this.canvas.getContext('experimental-webgl', ctxOptions);
  this.gl = gl;

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);

  this.renderTarget = new RenderTarget(gl, this.width, this.height);
  this.currentRenderer = new ObjectRenderer(this);

  this.resize(this.width, this.height);
};

module.exports = Renderer;

Renderer.prototype.setShader = function() {
  var gl = this.gl;
  var tempAttribState = [true, true, true, true, true];
  var maxAttibs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
  var attribState = [];

  for (var n = 0; n < maxAttibs; n++) {
    attribState[n] = false;
  }

  for (var i = 0; i < maxAttibs; i++) {
    attribState[i] = tempAttribState[i];

    if (attribState[i]) {
      gl.enableVertexAttribArray(i);
    } else {
      gl.disableVertexAttribArray(i);
    }

  }
};

Renderer.prototype.render = function(object) {
  object.renderWebGL(this);
};

Renderer.prototype.resize = function(width, height) {
  this.width = this.canvas.width = width;
  this.height = this.canvas.height = height;

  this.renderTarget.resize(width, height);

  if (this.currentRenderTarget === this.renderTarget) {
    this.renderTarget.activate();
    this.gl.viewport(0, 0, this.width, this.height);
  }
};
