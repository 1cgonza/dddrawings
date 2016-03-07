// CREDITS
// I did not make this, just translated into JS for learning purposes
// See original code at http://www.complexification.net/gallery/machines/binaryRing/
// Binary Ring
// j.tarbell   March, 2004
// Albuquerque, New Mexico
(function() {
  'use strict';
  var loaded    = false;
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');

  /*----------  SET STAGE  ----------*/
  var stage = DDD.canvas(container);
  stage.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';

  /*----------  GLOBALs  ----------*/
  var num      = 5000;        // total number of particles
  var blackout = false;       // blackout is production control of white or black filaments
  var kaons    = [];          // kaons is array of path tracing particles
  var TWO_PI   = Math.PI * 2;
  var count    = 0;

  function init() {
    loading.style.opacity = 0;

    stage.ctx.fillStyle = '#000';
    stage.ctx.fillRect(0, 0, stage.w, stage.h);

    // begin with particle sling-shot around ring origin
    for (var i = 0; i < num; i++) {
      var emitX = 30 * Math.sin(TWO_PI / num) + stage.center.x;
      var emitY = 30 * Math.cos(TWO_PI / num) + stage.center.y;
      var r = Math.PI * i / num;
      kaons[i] = new Particle(emitX, emitY, r);
    }

    draw();
  }

  function draw() {
    if (count === 2) {
      for (var i = 0; i < num; i++) {
        kaons[i].move();
      }

      // randomly switch blackout periods
      if (DDD.random(0, 10000) > 9950) {
        switchBlackout();
      }

      count = 0;
    }

    count++;
    requestAnimationFrame(draw);
  }

  function switchBlackout() {
    blackout = !blackout;
  }

  function Particle(Dx, Dy, r) {
    this.age = DDD.random(0, 200);
    this.x = stage.center.x - Dx | 0;
    this.y = stage.center.y - Dy | 0;
    this.xx = 0;
    this.yy = 0;
    this.vx = 2 * Math.cos(r);
    this.vy = 2 * Math.sin(r);

    this.defineColor();
  }

  Particle.prototype.move = function() {
    this.xx = this.x;
    this.yy = this.y;

    this.x += this.vx;
    this.y += this.vy;

    this.vx += (DDD.random(0, 100) - DDD.random(0, 100)) * 0.005;
    this.vy += (DDD.random(0, 100) - DDD.random(0, 100)) * 0.005;

    stage.ctx.save();
    stage.ctx.strokeStyle = this.color;
    stage.ctx.beginPath();
    stage.ctx.moveTo(stage.center.x + this.xx, stage.center.y + this.yy);
    stage.ctx.lineTo(stage.center.x + this.x, stage.center.y + this.y);
    stage.ctx.stroke();
    stage.ctx.beginPath();
    stage.ctx.moveTo(stage.center.x - this.xx, stage.center.y + this.yy);
    stage.ctx.lineTo(stage.center.x - this.x, stage.center.y + this.y);
    stage.ctx.stroke();
    stage.ctx.restore();

    this.age++;

    if (this.age > 200) {
      var t = DDD.random(0, TWO_PI, true);
      this.x = 30 * Math.sin(t);
      this.y = 30 * Math.cos(t);
      this.xx = 0;
      this.yy = 0;
      this.vx = 0;
      this.vy = 0;
      this.age = 0;
      this.defineColor();
    }
  };

  Particle.prototype.defineColor = function() {
    if (blackout) {
      this.color = 'rgba(0, 0, 0, 0.1)';
    } else {
      this.color = 'rgba(255, 255, 255, 0.1)';
    }
  };

  init();

  document.addEventListener('click', function(e) {
    switchBlackout();
  });

})();
