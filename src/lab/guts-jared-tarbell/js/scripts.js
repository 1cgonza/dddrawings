// CREDITS
// I did not make this, just translated into JS for learning purposes
// See original code at http://www.complexification.net/gallery/machines/guts/
// Guts
// j.tarbell   April, 2005

(function() {
  'use strict';
  var loaded    = false;
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');
  var stage     = DDD.canvas(container);

  /*----------  GLOBAL VARIABLES  ----------*/
  var goodcolors = [];
  var num        = 11;
  var cPaths     = [];
  var TWO_PI     = Math.PI * 2;
  var HALF_PI    = Math.PI / 2;
  var animReq;

  function setup() {
    takeColor({
      // w: 133,
      // h: 178,
      // max: 256,
      // imgURL: '../../img/thumbs/nude.gif'
    });
  }

  function takeColor(data) {
    var colorStage = DDD.canvas(null, {w: 133, h: 178});

    var img = new Image();
    img.onload = function() {
      colorStage.ctx.drawImage(img, 0, 0);
      processColor();
    };
    img.src = '../../img/thumbs/nude.gif';

    function processColor() {
      var count     = 0;
      var max       = 256;

      for (var x = 0; x < colorStage.w; x++) {
        for (var y = 0; y < colorStage.h; y++) {
          var pixel = colorStage.ctx.getImageData(x, y, 1, 1).data;

          var cData = {r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3]};

          var exists = false;

          for (var n = goodcolors.length - 1; n >= 0; n--) {
            if (JSON.stringify(goodcolors[n]) === JSON.stringify(cData)) {
              exists = true;
              break;
            }
          }

          if (!exists) {
            if (count < max) {
              goodcolors.push(cData);
              count++;
            }
          }
        }
      }

      if (data.pumpW !== 'undefined' && data.pumpW > 0) {
        var white = {r: 255, g: 255, b: 255, a: 1};
        for (var i = 0; i < data.pumpW; i++) {
          goodcolors.push(white);
        }
      }

      if (data.pumpB !== 'undefined' && data.pumpB > 0) {
        var black = {r: 0, g: 0, b: 0, a: 1};
        for (var j = 0; j < data.pumpW; j++) {
          goodcolors.push(black);
        }
      }
console.log(goodcolors)
      begin();
      draw();
      loading.style.opacity = 0;
    }
  }

  function someColor() {
    return goodcolors[DDD.random(0, goodcolors.length)];
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
    animReq = requestAnimationFrame(draw);
  }

  function CPath(id) {
    this.id = id;
    this.av = 0;
    this.numSands = 3;
    this.c = someColor();
    this.sandGut = new SandPainter(3);
    this.sandGut.setColor({r: 0, g: 0, b: 0});
    this.sandsCenter = [];
    this.sandsLeft = [];
    this.sandsRight = [];

    for (var s = 0; s < this.numSands; s++) {
      this.sandsCenter[s] = new SandPainter(0);
      this.sandsLeft[s] = new SandPainter(1);
      this.sandsRight[s] = new SandPainter(1);
      this.sandsLeft[s].setColor({r: 0, g: 0, b: 0});
      this.sandsRight[s].setColor({r: 0, g: 0, b: 0});
      this.sandsCenter[s].setColor(someColor());
    }
    this.reset();
  }

  CPath.prototype.reset = function() {
    var d = DDD.random(0, stage.center.y, true);
    var t = DDD.random(0, TWO_PI, true);
    var ci = goodcolors.length * 2 * d / stage.h | 0;

    this.x = d * Math.cos(t);
    this.y = d * Math.sin(t);

    for (var s = 0; s < this.numSands; s++) {
      this.sandsCenter[s].setColor(goodcolors[ci]);
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
      var ax = stage.center.x + d * Math.cos(at);
      var ay = stage.center.y + d * Math.sin(at);
      // calculate girth markers
      var cx = 0.5 * this.grth * Math.cos(ad - HALF_PI);
      var cy = 0.5 * this.grth * Math.sin(ad - HALF_PI);

      // draw points
      // paint background white
      for (var s = 0; s < this.grth * 2; s++) {
        var dd = DDD.random(-0.9, 0.9, true);

        stage.ctx.fillStyle = '#FFF';
        stage.ctx.fillRect(
          ax + dd * cx | 0,
          ay + dd * cy | 0,
          1, 1
        );
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

  function SandPainter(m) {
    this.MODE = m;
    this.c = someColor();
    this.g = DDD.random(0, HALF_PI, true);
  }

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

      stage.ctx.fillStyle = DDD.color.getRGBA(this.c, DDD.color.convertAlpha(256 * a));
      stage.ctx.fillRect(
        ox + (x - ox) * lex | 0,
        oy + (y - oy) * lex | 0,
        1, 1
      );
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

      stage.ctx.fillStyle = DDD.color.getRGBA(this.c, DDD.color.convertAlpha(256 * a));
      stage.ctx.fillRect(
        ox + (x - ox) * (0.5 + lex) | 0,
        oy + (y - oy) * (0.5 + lex) | 0,
        1, 1
      );
      stage.ctx.fillRect(
        ox + (x - ox) * (0.5 - lex) | 0,
        oy + (y - oy) * (0.5 - lex) | 0,
        1, 1
      );
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

      stage.ctx.fillStyle = DDD.color.getRGBA(this.c, DDD.color.convertAlpha(256 * a));
      stage.ctx.fillRect(
        ox + (x - ox) * lex | 0,
        oy + (y - oy) * lex | 0,
        1, 1
      );
      stage.ctx.fillRect(
        x + (ox - x) * lex | 0,
        y + (oy - y) * lex | 0,
        1, 1
      );
    }
  };

  SandPainter.prototype.setColor = function(c) {
    this.c = c;
  };

  setup();

  document.body.addEventListener('click', function(eve) {
    begin();
    stage.ctx.fillStyle = '#FFF';
    stage.ctx.fillRect(0, 0, stage.w, stage.h);
  });

})();
