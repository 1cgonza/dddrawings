// CREDITS
// I did not make this, just translated into JS for learning purposes
// See original code at http://www.complexification.net/gallery/machines/guts/
// Guts
// j.tarbell   April, 2005

(function() {
  'use strict';
  var loaded    = false;
  var container = document.getElementById('ddd-container');
  var stage     = DDD.canvas(container);
  var stageW = stage.w;
  var stageH = stage.h;
  var centerX = stage.center.x;
  var centerY = stage.center.y;

  /*----------  GLOBAL VARIABLES  ----------*/
  var goodColors = [];
  var num        = 11;
  var cPaths     = [];
  var pixels;
  var imgData;
  var TWO_PI  = Math.PI * 2;
  var HALF_PI = Math.PI / 2;
  var animReq;

  takeColor('/img/thumbs/nude.gif');

  function takeColor(imgURL) {
    var img = new Image();
    img.onload = function() {
      var w = img.naturalWidth;
      var h = img.naturalHeight;
      var temp = DDD.canvas(null, {w: w, h: h});

      temp.ctx.drawImage(img, 0, 0);
      var pixels = temp.ctx.getImageData(0, 0, w, h).data;

      for (var i = 0; i < pixels.length; i += 4) {
        var color = [pixels[i], pixels[i + 1], pixels[i + 2]];
        var catchColor = false;

        for (var j = 0; j < goodColors.length; j++) {
          if (color[0] === goodColors[j][0] && color[1] === goodColors[j][1] && color[2] === goodColors[j][2]) {
            catchColor = true;
            break;
          }
        }

        if (!catchColor) {
          goodColors.push(color);
        }
      }

      init();
    };
    img.src = imgURL;
  }

  function init() {
    stage.ctx.fillStyle = '#FFF';
    stage.ctx.fillRect(0, 0, stageW, stageH);
    imgData = stage.ctx.getImageData(0, 0, stageW, stageH);
    pixels = imgData.data;

    begin();
    draw();
  }

  function someColor() {
    return goodColors[DDD.random(0, goodColors.length)];
  }

  function begin() {
    for (var i = 0; i < num; i++) {
      cPaths[i] = new CPath(i);
    }
  }

  function draw() {
    for (var c = 0; c < num; c++) {
      if (cPaths[c].moveme) {
        cPaths[c].grow();
      }
    }
    stage.ctx.putImageData(imgData, 0, 0);
    animReq = requestAnimationFrame(draw);
  }

  function CPath(id) {
    this.id = id;
    this.av = 0;
    this.numSands = 3;
    this.c = someColor();
    this.sandGut = new SandPainter(3);
    this.sandGut.c = [0,0,0];
    this.sandsCenter = [];
    this.sandsLeft = [];
    this.sandsRight = [];

    for (var s = 0; s < this.numSands; s++) {
      this.sandsCenter[s] = new SandPainter(0);
      this.sandsLeft[s] = new SandPainter(1);
      this.sandsRight[s] = new SandPainter(1);
      this.sandsLeft[s].c = [0,0,0];
      this.sandsRight[s].c = [0,0,0];
      this.sandsCenter[s].c = someColor();
    }
    this.reset();
  }

  CPath.prototype.reset = function() {
    var d = DDD.random(0, centerY, true);
    var t = DDD.random(0, TWO_PI, true);
    var ci = goodColors.length * 2 * d / stage.h | 0;

    this.x = d * Math.cos(t);
    this.y = d * Math.sin(t);

    for (var s = 0; s < this.numSands; s++) {
      this.sandsCenter[s].c = goodColors[ci];
    }

    this.v = 0.5;
    this.a = DDD.random(0, TWO_PI, true);
    this.grth = 0.1;
    this.gv = 1.2;
    this.pt = Math.pow(3, 1 + this.id % 3);
    this.time = 0;
    this.tdv = DDD.random(0.1, 0.5, true);
    this.tdvm = DDD.random(1, 100, true);
    this.fadeOut = false;
    this.moveme = true;
  };

  CPath.prototype.draw = function() {
    for (var p = 0; p < this.pt; p++) {
      // calculate actual angle
      var t = Math.atan2(this.y, this.x);
      // console.log(t);
      var at = t + p * (TWO_PI / this.pt);
      var ad = this.a + p * (TWO_PI / this.pt);
      // calculate distance
      var d = Math.sqrt(this.x * this.x + this.y * this.y);
      // calculate actual xy
      var ax = centerX + d * Math.cos(at);
      var ay = centerY + d * Math.sin(at);
      // calculate girth markers
      var cx = 0.5 * this.grth * Math.cos(ad - HALF_PI);
      var cy = 0.5 * this.grth * Math.sin(ad - HALF_PI);

      // draw points
      // paint background white
      for (var s = 0; s < this.grth * 2; s++) {
        var dd = DDD.random(-0.9, 0.9, true);

        var _x = ax + dd * cx | 0;
        var _y = ay + dd * cy | 0;
        var _i = (_y * stageW + _x) * 4;
        setPixelColor(_i, [255,255,255], 1);
      }

      var newX = ax + cx * 0.6;
      var newY = ay + cy * 0.6;
      var newX2 = ax - cx * 0.6;
      var newY2 = ay - cy * 0.6;
      var newX3 = ax + cx;
      var newY3 = ay + cy;
      var newX4 = ax - cx;
      var newY4 = ay - cy;

      for (var i = 0; i < this.numSands; i++) {
        this.sandsCenter[i].render(newX, newY, newX2, newY2);
        this.sandsLeft[i].render(newX, newY, newX3, newY3);
        this.sandsRight[i].render(newX2, newY2, newX4, newY4);
      }
      // paint crease enhancement
      this.sandGut.render(newX3, newY3, newX4, newY4);
    }
  };

  CPath.prototype.grow = function() {
    this.time += DDD.random(0, 4, true);
    this.x += this.v * Math.cos(this.a);
    this.y += this.v * Math.sin(this.a);

    // rotational meander
    this.av = 0.1 * Math.sin(this.time * this.tdv) + 0.1 * Math.sin(this.time * this.tdv / this.tdvm);
    while (Math.abs(this.av) > HALF_PI / this.grth) {
      this.av *= 0.73;
    }
    this.a += this.av;

    // randomly increase and descrease in girth (thickness)
    if (this.fadeOut) {
      this.gv -= 0.062;
      this.grth += this.gv;

      if (this.grth < 0.1) {
        this.moveme = false;
      }
    } else {
      this.grth += this.gv;
      this.gv += DDD.random(-0.15, 0.12, true);

      if (this.grth < 6) {
        this.grth = 6;
        this.gv *= 0.9;
      } else if (this.grth > 26) {
        this.grth = 26;
        this.gv *= 0.8;
      }
    }
    this.draw();
  };

  CPath.prototype.terminate = function() {
    this.fadeOut = true;
  };

  var SandPainter = function(m) {
    this.MODE = m;
    this.c = someColor();
    this.g = DDD.random(0, HALF_PI, true);
  };

  SandPainter.prototype.render = function(x, y, ox, oy) {
    if (this.MODE === 3) {
      this.g += DDD.random(-0.9, 0.5, true);
    } else {
      this.g += DDD.random(-0.050, 0.050, true);
    }

    if (this.g < 0) {
      this.g = 0;
    }

    if (this.g > HALF_PI) {
      this.g = HALF_PI;
    }

    if (this.MODE === 3 || this.MODE === 2) {
      this.renderOne(x, y, ox, oy);
    } else if (this.MODE === 1) {
      this.renderInside(x, y, ox, oy);
    } else if (this.MODE === 0) {
      this.renderOutside(x, y, ox, oy);
    }
  };

  SandPainter.prototype.renderOne = function(x, y, ox, oy) {
    // calculate grains by distance
    var grains = 42;

    // lay down grains of sand (transparent pixels)
    var w = this.g / (grains - 1);
    for (var i = 0; i < grains; i++) {
      var a = 0.15 - i / (grains * 10 + 10);
      // paint one side
      var tex = Math.sin(i * w);
      var lex = Math.sin(tex);

      var _x = ox + (x - ox) * lex | 0;
      var _y = oy + (y - oy) * lex | 0;
      var _i = (_y * stageW + _x) * 4;
      setPixelColor(_i, this.c, a);
    }
  };

  SandPainter.prototype.renderInside = function(x, y, ox, oy) {
    // calculate grains by distance
    var grains = 11;

    // lay down grains of sand (transparent pixels)
    var w = this.g / (grains - 1);
    for (var i = 0; i < grains; i++) {
      var a = 0.15 - i / (grains * 10 + 10);
      // paint one side
      var tex = Math.sin(i * w);
      var lex = 0.5 * Math.sin(tex);

      var _x1 = ox + (x - ox) * (0.5 + lex) | 0;
      var _y1 = oy + (y - oy) * (0.5 + lex) | 0;
      var _i1 = (_y1 * stageW + _x1) * 4;
      var _x2 = ox + (x - ox) * (0.5 - lex) | 0;
      var _y2 = oy + (y - oy) * (0.5 - lex) | 0;
      var _i2 = (_y2 * stageW + _x2) * 4;
      setPixelColor(_i1, this.c, a);
      setPixelColor(_i2, this.c, a);
    }
  };

  SandPainter.prototype.renderOutside = function(x, y, ox, oy) {
    // calculate grains by distance
    var grains = 11;

    // lay down grains of sand (transparent pixels)
    var w = this.g / (grains - 1);
    for (var i = 0; i < grains; i++) {
      var a = 0.15 - i / (grains * 10 + 10);
      // paint one side
      var tex = Math.sin(i * w);
      var lex = 0.5 * Math.sin(tex);

      var _x1 = ox + (x - ox) * lex | 0;
      var _y1 = oy + (y - oy) * lex | 0;
      var _i1 = (_y1 * stageW + _x1) * 4;
      var _x2 = x + (ox - x) * lex | 0;
      var _y2 = y + (oy - y) * lex | 0;
      var _i2 = (_y2 * stageW + _x2) * 4;
      setPixelColor(_i1, this.c, a);
      setPixelColor(_i2, this.c, a);
    }
  };

  function setPixelColor(i, rgb, a) {
    var a1 = 1 - a;
    var r2 = pixels[i];
    var g2 = pixels[i + 1];
    var b2 = pixels[i + 2];

    // Blend painter color with existing pixel based on alpha.
    pixels[i]     = rgb[0] * a + r2 * a1;
    pixels[i + 1] = rgb[1] * a + g2 * a1;
    pixels[i + 2] = rgb[2] * a + b2 * a1;
  }

  document.body.addEventListener('click', function(eve) {
    var n = pixels.length;
    for (var i = 0; i < n; i++) {
      pixels[i] = 255;
    }

    begin();
  });

})();
