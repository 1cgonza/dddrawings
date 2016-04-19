var Shader = function(gl) {
  this.gl = gl;

  this.uniforms = {
    uSampler: {
      type: 'sampler2D',
      value: 0
    },
    projectionMatrix: {
      type: 'mat3',
      value: new Float32Array(
        [1, 0, 0,
         0, 1, 0,
         0, 0, 1])
    },
    uAlpha: {
      type: '1f',
      value: 1
    }
  };

  this.attributes = {
    aVertexPosition: 0,
    aTextureCoord: 0,
    aColor: 0,
    aPositionCoord: 0,
    aRotation: 0
  };

  this.vertexSrc = [
    'attribute vec2 aVertexPosition;',
    'attribute vec2 aTextureCoord;',
    'attribute float aColor;',

    'attribute vec2 aPositionCoord;',
    'attribute vec2 aScale;',
    'attribute float aRotation;',

    'uniform mat3 projectionMatrix;',

    'varying vec2 vTextureCoord;',
    'varying float vColor;',

    'void main(void){',
      'vec2 v = aVertexPosition;',

      'v.x = (aVertexPosition.x) * cos(aRotation) - (aVertexPosition.y) * sin(aRotation);',
      'v.y = (aVertexPosition.x) * sin(aRotation) + (aVertexPosition.y) * cos(aRotation);',
      'v = v + aPositionCoord;',

      'gl_Position = vec4((projectionMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);',

      'vTextureCoord = aTextureCoord;',
      'vColor = aColor;',
    '}'
  ].join('');

  this.fragmentSrc = [
    'precision lowp float;',

    'varying vec2 vTextureCoord;',
    'varying float vColor;',

    'uniform sampler2D uSampler;',
    'uniform float uAlpha;',

    'void main(void){',
      'vec4 color = texture2D(uSampler, vTextureCoord) * vColor * uAlpha;',
      'if (color.a == 0.0) discard;',
      'gl_FragColor = color;',
    '}'
  ].join('');

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, this.vertexSrc);
  gl.compileShader(vertexShader);

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, this.fragmentSrc);
  gl.compileShader(fragmentShader);

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // clear shader from memory after linking program
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  this.program = program;
  this.gl.useProgram(program);
  this.cacheUniformLocations(Object.keys(this.uniforms));
  this.cacheAttributeLocations(Object.keys(this.attributes));
};

module.exports = Shader;

Shader.prototype.cacheUniformLocations = function(keys) {
  for (var i = 0; i < keys.length; ++i) {
    this.uniforms[keys[i]]._location = this.gl.getUniformLocation(this.program, keys[i]);
  }
};

Shader.prototype.cacheAttributeLocations = function(keys) {
  for (var i = 0; i < keys.length; ++i) {
    this.attributes[keys[i]] = this.gl.getAttribLocation(this.program, keys[i]);
  }
};
