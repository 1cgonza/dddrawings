// CREDITS
// I did not make this, just translated from Processing to JS for learning purposes
// See original code at http://www.complexification.net/gallery/machines/bubblechamber/
// Bubble Chamber
// j.tarbell   October, 2003
// Albuquerque, New Mexico
// complexification.net

// a generative painting system using random collisions of
// four unique orbit decaying particle types.
(function() {
  'use strict';
  /*----------  GLOBALS  ----------*/
  var container = document.getElementById('ddd-container');
  var TWO_PI    = Math.PI * 2;

  // particle proportions
  var maxMuon   = 1789;
  var maxQuark  = 1300;
  var maxHadron = 1000;
  var maxAxion  = 111;

  // angle of collision (usually calculated with mouse position)
  var collisionTheta;

  // first time user interaction flag
  var boom = false;

  // discrete universe of particles?
  var muon   = [];
  var quark  = [];
  var hadron = [];
  var axion  = [];

  // some nice color palettes
  // rusted desert metal. winter, new mexico
  var goodcolor = [
    '#3a242b', '#3b2426', '#352325', '#836454',
    '#7d5533', '#8b7352', '#b1a181', '#a4632e',
    '#bb6b33', '#b47249', '#ca7239', '#d29057',
    '#e0b87e', '#d9b166', '#f5eabe', '#fcfadf',
    '#d9d1b0', '#fcfadf', '#d1d1ca', '#a7b1ac',
    '#879a8c', '#9186ad', '#776a8e'
  ];

  goodcolor = goodcolor.map(function(color) {
    var rgb = DDD.hexToRgb(color);
    return [rgb.r, rgb.g, rgb.b];
  });

  /*----------  CREATE CANVAS  ----------*/
  var stage = DDD.canvas(container);
  var stageW = stage.w;
  var stageH = stage.h;
  var centerX = stage.center.x | 0;
  var centerY = stage.center.y | 0;
  stage.ctx.fillStyle = '#FFF';
  stage.ctx.fillRect(0, 0, stageW, stageH);
  var imgData = stage.ctx.getImageData(0, 0, stageW, stageH);
  var pixels = imgData.data;

  function setup() {
    // instantiate universe of particles
    for (var i = 0; i < maxAxion; i++) {
      axion[i] = new Axion(centerX, centerY);
    }

    for (var ii = 0; ii < maxHadron; ii++) {
      hadron[ii] = new Hadron(centerX, centerY);
    }

    for (var j = 0; j < maxQuark; j++) {
      quark[j] = new Quark(0, 0);
    }

    for (var jj = 0; jj < maxMuon; jj++) {
      muon[jj] = new Muon(centerX, centerY);
    }

    boom = true;
    collideAll();
    draw();
  }

  function draw() {
    if (boom) {
      // initial collision event has occured, ok to move the particles...

      // allow each particle in the universe one step
      for (var i = 0; i < hadron.length; i++) {
        hadron[i].move();
      }

      for (var ii = 0; ii < muon.length; ii++) {
        muon[ii].move();
      }

      for (var j = 0; j < quark.length; j++) {
        quark[j].move();
      }

      for (var jj = 0; jj < axion.length; jj++) {
        axion[jj].move();
      }
    }

    stage.ctx.putImageData(imgData, 0, 0);
    requestAnimationFrame(draw);
  }

  function collideOne(event) {
    // eject a single particle, relative to position position
    var t;
    collisionTheta = Math.atan2(centerX - event.clientX, centerY / 2 - event.clientY);

    // choose a set of hadron particles to recollide
    if (hadron.length > 0) {
      t = DDD.random(0, hadron.length);
      hadron[t].collide();
    }

    // choose a set of quark particles to recollide
    if (quark.length > 0) {
      t = DDD.random(0, quark.length);
      quark[t].collide();
    }

    // choose a set of muon particles to recollide
    if (muon.length > 0) {
      t = DDD.random(0, muon.length);
      muon[t].collide();
    }
  }

  function collideAll() {
    // random collision angle
    collisionTheta = DDD.random(0, TWO_PI, true);

    // particle super collision
    if (hadron.length > 0) {
      for (var i = 0; i < maxHadron; i++) {
        hadron[i].collide();
      }
    }

    if (quark.length > 0) {
      for (var ii = 0; ii < maxQuark; ii++) {
        quark[ii].collide();
      }
    }

    if (muon.length > 0) {
      for (var j = 0; j < maxMuon; j++) {
        muon[j].collide();
      }
    }

    if (axion.length > 0) {
      for (var jj = 0; jj < maxAxion; jj++) {
        axion[jj].collide();
      }
    }
  }

  function setPixelColor(i, rgb, a) {
    var a1 = 1 - a;
    var r2 = pixels[i];
    var g2 = pixels[i + 1];
    var b2 = pixels[i + 2];

    pixels[i]     = rgb[0] * a + r2 * a1;
    pixels[i + 1] = rgb[1] * a + g2 * a1;
    pixels[i + 2] = rgb[2] * a + b2 * a1;
  }

  // CLASSES ---------------------------------------------------------------------------

  // Muon particle
  //   the muon is a colorful particle with an entangled friend.
  //   draws both itself and its horizontally symmetric partner.
  //   a high range of speed and almost no speed decay allow the
  //   muon to reach the extents of the window, often forming rings
  //   where theta has decayed but speed remains stable.  result
  //   is color almost everywhere in the general direction of collision,
  //   stabilized into fuzzy rings.

  function Muon(x, y) {
    this.x = x;
    this.y = y;
    this.myc = goodcolor[0];
    this.mya = goodcolor[goodcolor.length - 1];
  }

  Muon.prototype.collide = function() {
    // initialize all parameters
    this.x = centerX;
    this.y = centerY;
    this.speed = DDD.random(2, 32);
    this.speedD = DDD.random(0.0001, 0.001, true);

    // rotation
    this.theta = collisionTheta + DDD.random(-0.1, 0.1, true);
    this.thetaD = 0;
    this.thetaDD = 0;

    // ensure that there IS decay
    while (Math.abs(this.thetaDD) < 0.001) {
      // rate of orbit decay
      this.thetaDD = DDD.random(-0.1, 0.1, true);
    }

    // color is determined by direction of movement
    var c = (goodcolor.length - 1) * (this.theta + Math.PI) / TWO_PI | 0;
    if (c >= goodcolor.length || c < 0) {
      // SAFETY: this is giving me problems
      // println("whoa: "+c);
    } else {
      this.myc = goodcolor[c];
      // anti-particle color
      this.mya = goodcolor[goodcolor.length - c - 1];
    }
  };

  Muon.prototype.move = function() {
    var _x = this.x | 0;
    var _y = this.y | 0;
    var a  = DDD.convertAlpha(42);

    // draw
    var _i1 = (_y * stageW + _x) * 4;
    var color1 = this.myc;
    setPixelColor(_i1, color1, a);
    // draw anti-particle
    var _i2 = (_y * stageW + (stageW - _x)) * 4;
    var color2 = this.mya;
    setPixelColor(_i2, color2, a);

    // move
    this.x += this.speed * Math.sin(this.theta);
    this.y += this.speed * Math.cos(this.theta);

    // rotate
    this.theta += this.thetaD;

    // modify spin
    this.thetaD += this.thetaDD;

    // modify speed
    this.speed -= this.speedD;

    // do not allow particle to enter extreme offscreen areas
    if ((this.x < -stageW) || (this.x > stageW * 2) || (this.y < -stageH) || (this.y > stageH * 2)) {
      this.collide();
    }
  };

  // Quark particle
  // the quark draws as a translucent black.  their large numbers
  // create fields of blackness overwritten only by the glowing shadows of Hadrons.
  // quarks are allowed to accelerate away with speed decay values above 1.0
  // each quark has an entangled friend.  both particles are drawn identically,
  // mirrored along the y-axis.

  function Quark(x, y) {
    this.x = x;
    this.y = y;
  }

  Quark.prototype.collide = function() {
    // initialize all parameters with random collision
    this.x = centerX;
    this.y = centerY;
    this.theta = collisionTheta + DDD.random(-0.11, 0.11, true);
    this.speed = DDD.random(0.5, 3.0, true);

    this.speedD = DDD.random(0.996, 1.001, true);
    this.thetaD = 0;
    this.thetaDD = 0;

    // rate of orbit decay
    while (Math.abs(this.thetaDD) < 0.00001) {
      this.thetaDD = DDD.random(-0.001, 0.001, true);
    }
  };

  Quark.prototype.move = function() {
    var _x = this.x | 0;
    var _y = this.y | 0;
    var color = [0,0,0];
    var a = DDD.convertAlpha(32);

    // draw
    var _i1 = (_y * stageW + _x) * 4;
    setPixelColor(_i1, color, a);
    // draw anti-particle
    var _i2 = (_y * stageW + (stageW - _x)) * 4;
    setPixelColor(_i2, color, a);

    // move & turn
    this.x += this.speed * Math.sin(this.theta);
    this.y += this.speed * Math.cos(this.theta);

    this.theta += this.thetaD;

    // // modify spin
    this.thetaD += this.thetaDD;

    // // modify speed
    this.speed *= this.speedD;

    if (DDD.random(0, 1000) > 997) {
      this.speed *= -1;
      this.speedD = 2 - this.speedD;
    }

    // do not allow particle to enter extreme offscreen areas
    if ((this.x < -stageW) || (this.x > stageW * 2) || (this.y < -stageH) || (this.y > stageH * 2)) {
      this.collide();
    }
  };

  // Hadron particle
  // hadrons collide from totally random directions.
  // those hadrons that do not exit the drawing area,
  // tend to stabilize into perfect circular orbits.
  // each hadron draws with a slight glowing emboss.
  // the hadron itself is not drawn.

  function Hadron(x, y) {
    this.x = x;
    this.y = y;
  }

  Hadron.prototype.collide = function() {
    // initialize all parameters with random collision
    this.x = centerX;
    this.y = centerY;
    this.theta = DDD.random(0, TWO_PI, true);
    this.speed = DDD.random(0.5, 3.5, true);

    this.speedD = DDD.random(0.996, 1.001, true);
    this.thetaD = 0;
    this.thetaDD = 0;

    // rate of orbit decay
    while (Math.abs(this.thetaDD) < 0.00001) {
      this.thetaDD = DDD.random(-0.001, 0.001, true);
    }

    this.myc = DDD.hexToRgb('#00FF00');
  };

  Hadron.prototype.move = function() {
    // the particle itself is unseen, not drawn
    // instead, draw shadow emboss
    var _x = this.x | 0;
    var _y = this.y | 0;
    var color1 = [255, 255, 255];
    var color2 = [0,0,0];
    var a = DDD.convertAlpha(28);

    // lighten pixel above hadron
    var _i1 = ((_y - 1) * stageW + _x) * 4;
    setPixelColor(_i1, color1, a);

    // darken pixel below
    var _i2 = ((_y + 1) * stageW + _x) * 4;
    setPixelColor(_i2, color2, a);

    // move
    this.x += this.speed * Math.sin(this.theta);
    this.y += this.speed * Math.cos(this.theta);

    // modify spin
    this.theta += this.thetaD;
    this.thetaD += this.thetaDD;

    // modify speed
    this.speed *= this.speedD;

    // random chance of subcollision event
    if (DDD.random(0, 1000) > 997) {
      // stablize orbit
      this.speedD = 1.0;
      this.thetaDD = 0.00001;
      if (DDD.random(0, 100) > 70) {
        // recollide
        this.x = centerX;
        this.y = centerY;
        this.collide();
      }
    }

    // do not allow particle to enter extreme offscreen areas
    if ((this.x < -stageW) || (this.x > stageH * 2) || (this.y < -stageH) || (this.y > stageH * 2)) {
      this.collide();
    }
  };

  // Axion particle
  // the axion particle draws a bold black path.  axions exist
  // in a slightly higher dimension and as such are drawn with
  // elevated embossed shadows.  axions are quick to stabilize
  // and fall into single pixel orbits axions automatically
  // recollide themselves after stabilizing.

  function Axion(x, y) {
    this.x = x;
    this.y = y;
  }

  Axion.prototype.collide = function() {
    this.x = centerX;
    this.y = centerY;
    this.theta = DDD.random(0, TWO_PI, true);
    this.speed = DDD.random(1.0, 6.0, true);

    this.speedD = DDD.random(0.998, 1.000, true);
    this.thetaD = 0;
    this.thetaDD = 0;

    // rate of orbit decay
    while (Math.abs(this.thetaDD) < 0.00001) {
      this.thetaDD = DDD.random(-0.001, 0.001, true);
    }
  };

  Axion.prototype.move = function() {
    var _x = this.x | 0;
    var _y = this.y | 0;
    var color1 = [16, 16, 16];
    var color2 = [255,255,255];
    var color3 = [0,0,0];
    var a = DDD.convertAlpha(150);

    // draw - axions are high contrast
    var _i1 = (_y * stageW + _x) * 4;
    setPixelColor(_i1, color1, a);

    // axions cast vertical glows, highlight/shadow emboss
    for (var dy = 1; dy < 5; dy++) {
      a = DDD.convertAlpha(30 - dy * 6);
      var _i2 = ((_y - dy) * stageW + _x) * 4;
      setPixelColor(_i2, color2, a);
    }

    for (var dy2 = 1; dy2 < 5; dy2++) {
      a = DDD.convertAlpha(30 - dy2 * 6);
      var _i3 = ((_y + dy2) * stageW + _x) * 4;
      setPixelColor(_i3, color3, a);
    }

    // move
    this.x += this.speed * Math.sin(this.theta);
    this.y += this.speed * Math.cos(this.theta);

    this.theta += this.thetaD;

    // modify spin
    this.thetaD += this.thetaDD;

    // modify speed
    this.speed *= this.speedD;
    this.speedD *= 0.9999;

    if (DDD.random(0, 100) > 30) {
      this.x = centerX;
      this.y = centerY;
      this.collide();
    }
  };

  setup();

  document.body.addEventListener('click', function(e) {
    // fire 11 of each particle type
    for (var k = 0; k < 11; k++) {
      collideOne(event);
    }

    boom = true;
  });

  window.addEventListener('keyup', function(e) {
    if (event.keyCode === 32) {
      boom = true;
      var n = pixels.length;
      for (var i = 0; i < n; i++) {
        pixels[i] = 255;
      }
      collideAll();
    }
  });

})();
