(function() {
  'use strict';

  /*----------  SET STAGE  ----------*/
  var container = document.getElementById('ddd-container');
  var stage     = DDD.canvas(container);

  /*----------  GLOBALS  ----------*/
  var stageW  = window.innerWidth;
  var stageH  = window.innerHeight;
  var centerX = stageW / 2 | 0;
  var centerY = stageH / 2 | 0;

  var num = 0;
  var maxNum = 200;
  var totalPixels = stageW * stageH;

  var imgData = stage.ctx.getImageData(0, 0, stageW, stageH);
  var pixels = imgData.data;

  var cGrid = [];
  var cracks = [];

  var maxPal = 512;
  var numPal = 0;
  var goodColors = [];

  var sands = [];

  function init() {
    for (var i = 0; i < totalPixels * 4; i++) {
      pixels[i] = 255;
    }

    for (var i = 0; i < totalPixels; i++) {
      cGrid[i] = 10001;
    }

    for (var k = 0; k < 16; k++) {
      var c = DDD.random(0, totalPixels - 1);
      cGrid[c] = DDD.random(0, 360);
    }

    for (var k = 0; k < 3; k++) {
      makeCrack();
    }

    draw();
  }

  function draw() {
    for (var n = 0; n < num; n++) {
      cracks[n].move();
    }
    stage.ctx.putImageData(imgData, 0, 0);
    requestAnimationFrame(draw);
  }

  function makeCrack() {
    if (num < maxNum) {
      cracks[num] = new Crack();
      num++;
    }
  }

  function someColor() {
    return goodColors[DDD.random(0, numPal)];
  }

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
          numPal++;
        }
      }

      init();
    };
    img.src = imgURL;
  }

  takeColor('/img/assets/pollockShimmering.gif');

  var Crack = function() {
    this.x = 0;
    this.y = 0;
    this.t = 0;

    this.findStart();
    this.sp = new SandPainter();
  };

  Crack.prototype.findStart = function() {
    var px = 0;
    var py = 0;
    var found = false;
    var timeout = 0;

    while (!found || timeout++ > 1000) {
      px = DDD.random(0, stageW);
      py = DDD.random(0, stageH);
      if (cGrid[py * stageW + px] < 10000) {
        found = true;
      }
    }

    if (found) {
      var a = cGrid[py * stageW + px];
      if (DDD.random(0, 100) < 50) {
        a -= 90 + DDD.random(-2, 2.1, true);
      } else {
        a += 90 + DDD.random(-2, 2.1, true);
      }
      this.startCrack(px, py, a);
    }
  };

  Crack.prototype.startCrack = function(x, y, t) {
    var _dir = t * Math.PI / 180;
    this.x = x;
    this.y = y;
    this.t = t;

    this.x += 0.61 * Math.cos(_dir);
    this.y += 0.61 * Math.sin(_dir);
  };

  Crack.prototype.move = function() {
    var _dir = this.t * Math.PI / 180;
    this.x += 0.42 * Math.cos(_dir);
    this.y += 0.42 * Math.sin(_dir);

    var z = 0.33;
    var cx = this.x + DDD.random(-z, z, true) | 0;
    var cy = this.y + DDD.random(-z, z, true) | 0;

    this.regionColor();

    var _i = (cy * stageW + cx) * 4;
    pixels[_i]     = pixels[_i] * 0.9;
    pixels[_i + 1] = pixels[_i + 1] * 0.9;
    pixels[_i + 2] = pixels[_i + 2] * 0.9;

    if (cx >= 0 && cx < stageW && cy >= 0 && cy < stageH) {
      var i = cy * stageW + cx;
      if (cGrid[i] > 10000 || Math.abs(cGrid[i] - this.t) < 5) {
        cGrid[i] = this.t;
      } else if (Math.abs(cGrid[i] - this.t) > 2) {
        this.findStart();
        makeCrack();
      }
    } else {
      this.findStart();
      makeCrack();
    }
  };

  Crack.prototype.regionColor = function() {
    var rx = this.x;
    var ry = this.y;
    var openspace = true;

    while (openspace) {
      var d = this.t * Math.PI / 180;
      rx += 0.81 * Math.sin(d);
      ry -= 0.81 * Math.cos(d);

      if (rx >= 0 && rx < stageW && ry >= 0 && ry < stageH) {
        if (cGrid[ry * stageH + rx | 0] > 10000) {

        } else {
          openspace = false;
        }
      } else {
        openspace = false;
      }
    }

    this.sp.render(rx, ry, this.x, this.y);
  };

  var SandPainter = function() {
    this.c = someColor();
    this.g = DDD.random(0.01, 0.1, true);
  };

  SandPainter.prototype.render = function(x, y, ox, oy) {
    this.g += DDD.random(-0.050, 0.050, true);
    var maxg = 1;
    if (this.g < 0) {
      this.g = 0;
    }

    if (this.g > maxg) {
      this.g = maxg;
    }

    var grains = 64;
    var w = this.g / (grains - 1);
    var r1 = this.c[0];
    var g1 = this.c[1];
    var b1 = this.c[2];

    for (var i = 0; i < grains; i++) {
      var a = (0.1 - i / (grains * 10));
      var a1 = 1 - a;
      var dist = Math.sin(Math.sin(i * w));
      var _x = ox + (x - ox) * dist | 0;
      var _y = oy + (y - oy) * dist | 0;

      var _i = (_y * stageW + _x) * 4;
      var r2 = pixels[_i];
      var g2 = pixels[_i + 1];
      var b2 = pixels[_i + 2];

      // Blend painter color with existing pixel based on alpha.
      pixels[_i]     = (r2 * r1 / 255) * a + r2 * a1;
      pixels[_i + 1] = (g2 * g1 / 255) * a + g2 * a1;
      pixels[_i + 2] = (b2 * b1 / 255) * a + b2 * a1;
    }
  };

})();
