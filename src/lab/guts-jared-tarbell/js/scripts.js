// CREDITS
// I did not make this, just translated into JS for learning purposes
// See original code at http://www.complexification.net/gallery/machines/guts/
// Guts
// j.tarbell   April, 2005
var flag = 0;
(function () {
  'use strict';
  var loaded    = false;
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');

  /*----------  CREATE CANVAS  ----------*/
  var canvas  = document.createElement('canvas');
  var ctx     = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  var centerX = canvas.width / 2;
  var centerY = canvas.height / 2;
  container.appendChild(canvas);

  /*----------  GLOBAL VARIABLES  ----------*/
  var count = 0;
  var goodcolors = [];
  var num = 11;
  var cPaths = [];
  var TWO_PI = Math.PI * 2;
  var HALF_PI = Math.PI / 2;
  var AF;

  function setup () {
    takeColor({
      w: 133,
      h: 178,
      max: 256,
      imgURL: '../../img/thumbs/nude.gif',
      callback: colorReady
    });
  }

  function takeColor (data) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = data.w;
    canvas.height = data.h;

    var img = new Image();
    img.onload = function () {
      ctx.drawImage(img, 0, 0);
      processColor(ctx, img, data);
    };
    img.src = data.imgURL;
  }

  function rgbToHex(r, g, b) {
    return "0x" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function getRGBAString (c, a) {
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
  }

  function convertAlpha (processingAlpha) {
    var avg = 255 / processingAlpha;
    var cssA = 1 / avg;
    return cssA;
  }

  function processColor (ctx, img, data) {
    var goodcolor = [];
    var count = 0;
    var cData;

    for (var x = 0; x < data.w; x++) {
      for (var y = 0; y < data.h; y++) {
        var c = ctx.getImageData(x, y, 1, 1).data;

        if (data.inHex) {
          cData = rgbToHex(c[0], c[1], c[2]);
        } else {
          cData = {r: c[0], g: c[1], b: c[2], a: c[3]};
        }
        var exists = false;

        for (var n = 0; n < data.max; n++) {
          if ( goodcolor.indexOf(cData) > -1 ) {
            exists = true;
            break;
          }
        }

        if (!exists) {
          if (count < data.max) {
            goodcolor[count] = cData;
            count++;
          }
        }
      }
    }

    if (data.pumpW !== 'undefined' && data.pumpW > 0) {
      var white = {r: 255, g: 255, b: 255, a: 1};
      for (var i = 0; i < data.pumpW; i++) {
        goodcolor.push(white);
      }
    }

    if (data.pumpB !== 'undefined' && data.pumpB > 0) {
      var black = {r: 0, g: 0, b: 0, a: 1};
      for (var j = 0; j < data.pumpW; j++) {
        goodcolor.push(black);
      }
    }

    data.callback(goodcolor);
  }

  function colorReady (colors) {
    colors.forEach(function (ele, i) {
      goodcolors[i] = ele;
    });

    // cPaths = new CPath(num);
    begin();
    draw();
    loading.style.opacity = 0;
  }

  function someColor() {
    return goodcolors[getRandom(0, goodcolors.length)];
  }

  function begin () {
    for (var i = 0; i < num; i++) {
      cPaths[i] = new CPath(i);
    }
  }

  function draw () {
    for (var c = 0; c < num; c++) {
      if (cPaths[c].moveme) {
        cPaths[c].grow();
      }
    }
    AF = requestAnimationFrame(draw);
  }

  function CPath (id) {
    this.id = id;
    this.av = 0;
    this.numSands = 3;
    this.c = someColor();
    this.sandGut = new SandPainter(3);
    this.sandGut.setColor( {r:0, g: 0, b:0} );
    this.sandsCenter = [];
    this.sandsLeft = [];
    this.sandsRight = [];

    for (var s = 0; s < this.numSands; s++) {
      this.sandsCenter[s] = new SandPainter(0);
      this.sandsLeft[s] = new SandPainter(1);
      this.sandsRight[s] = new SandPainter(1);
      this.sandsLeft[s].setColor( {r:0, g: 0, b:0} );
      this.sandsRight[s].setColor( {r:0, g: 0, b:0} );
      this.sandsCenter[s].setColor( someColor() );
    }
    this.reset();
  }

  CPath.prototype.reset = function() {
    var d = getRandom(0, centerY, true);
    var t = getRandom(0, TWO_PI, true);
    var ci = goodcolors.length * 2 * d / canvas.height | 0;
    this.x = d * Math.cos(t);
    this.y = d * Math.sin(t);

    for (var s = 0; s < this.numSands; s++) {
      this.sandsCenter[s].setColor( goodcolors[ci] );
    }

    this.v = 0.5;
    this.a = getRandom(0, TWO_PI, true);
    this.grth = 0.1;
    this.gv = 1.2;
    this.pt = Math.pow(3, 1 + this.id % 3);
    this.time = 0;
    this.tdv = getRandom(0.1, 0.5, true);
    this.tdvm = getRandom(1, 100, true);
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
      var cx = 0.5 * this.grth * Math.cos( ad - HALF_PI );
      var cy = 0.5 * this.grth * Math.sin( ad - HALF_PI );

      // draw points
      // paint background white
      for (var s = 0; s < this.grth * 2; s++) {
        var dd = getRandom(-0.9, 0.9, true);

        ctx.fillStyle = '#FFF';
        ctx.fillRect(
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
        this.sandsRight[i].render(newX2, newY2, newX4, newY4 );
      }
      // paint crease enhancement
      this.sandGut.render(newX3, newY3, newX4, newY4);
    }
  };

  CPath.prototype.grow = function() {
    this.time += getRandom(0, 4, true);
    this.x += this.v * Math.cos(this.a);
    this.y += this.v * Math.sin(this.a);

    // rotational meander
    this.av = 0.1 * Math.sin(this.time * this.tdv) + 0.1 * Math.sin(this.time * this.tdv / this.tdvm);
    while( Math.abs(this.av) > HALF_PI / this.grth) {
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
      this.gv += getRandom(-0.15, 0.12, true);

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

  function SandPainter (m) {
    this.MODE = m;
    this.c = someColor();
    this.g = getRandom(0, HALF_PI, true);
  }

  SandPainter.prototype.render = function(x, y, ox, oy) {
    if (this.MODE === 3) {
      this.g += getRandom(-0.9, 0.5, true);
    } else {
      this.g += getRandom(-0.050, 0.050, true);
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
    } else if ( this.MODE === 0) {
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

      ctx.fillStyle = getRGBAString( this.c, convertAlpha(256 * a) );
      ctx.fillRect(
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

      ctx.fillStyle = getRGBAString( this.c, convertAlpha(256 * a) );
      ctx.fillRect(
        ox + (x - ox) * (0.5 + lex) | 0,
        oy + (y - oy) * (0.5 + lex) | 0,
        1, 1
      );
      ctx.fillRect(
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

      ctx.fillStyle = getRGBAString( this.c, convertAlpha(256 * a) );
      ctx.fillRect(
        ox + (x - ox) * lex | 0,
        oy + (y - oy) * lex | 0,
        1, 1
      );
      ctx.fillRect(
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

  document.body.addEventListener('click', function (eve) {
    begin();
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

})();