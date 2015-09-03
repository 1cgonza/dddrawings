// CREDITS
// I did not make this, just translated into JS for learning purposes
// See original code at http://www.complexification.net/gallery/machines/binaryRing/
// Binary Ring
// j.tarbell   March, 2004
// Albuquerque, New Mexico
(function () {
  'use strict';
  var loaded    = false;
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementsByClassName('loading')[0];

  /*----------  CREATE CANVAS  ----------*/
  var canvas  = document.createElement('canvas');
  var ctx     = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  var centerX = canvas.width / 2;
  var centerY = canvas.height / 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';

  /*----------  GLOBAL VARIABLES  ----------*/
  var num      = 5000;        // total number of particles
  var blackout = false;       // blackout is production control of white or black filaments
  var kaons    = [];          // kaons is array of path tracing particles
  var TWO_PI   = Math.PI * 2;
  var count    = 0;

  function init () {
    loading.style.opacity = 0;
    container.appendChild(canvas);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // begin with particle sling-shot around ring origin
    for (var i = 0; i < num; i++) {
      var emitX = 30 * Math.sin( TWO_PI / num ) + centerX;
      var emitY = 30 * Math.cos( TWO_PI / num ) + centerY;
      var r = Math.PI * i / num;
      kaons[i] = new Particle(emitX, emitY, r);
    }

    draw();
  }

  function draw () {
    if (count === 2) {
      for (var i = 0; i < num; i++) {
        kaons[i].move();
      }

      // randomly switch blackout periods
      if (getRandom(0, 10000) > 9950) {
        switchBlackout();
      }

      count = 0;
    }

    count++;
    requestAnimationFrame(draw);
  }

  function switchBlackout () {
    blackout = !blackout;
  }

  function Particle (Dx, Dy, r) {
    this.age = getRandom(0, 200);
    this.x = centerX - Dx | 0;
    this.y = centerY - Dy | 0;
    this.xx = 0;
    this.yy = 0;
    this.vx = 2 * Math.cos(r);
    this.vy = 2 * Math.sin(r);

    this.defineColor();
  }

  Particle.prototype.move = function () {
    this.xx = this.x;
    this.yy = this.y;

    this.x += this.vx;
    this.y += this.vy;

    this.vx += ( getRandom(0, 100) - getRandom(0, 100) ) * 0.005;
    this.vy += ( getRandom(0, 100) - getRandom(0, 100) ) * 0.005;

    ctx.save();
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(centerX + this.xx, centerY + this.yy);
      ctx.lineTo(centerX + this.x, centerY + this.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX - this.xx, centerY + this.yy);
      ctx.lineTo(centerX - this.x, centerY + this.y);
      ctx.stroke();
    ctx.restore();

    this.age++;

    if (this.age > 200) {
      var t = getRandom(0, TWO_PI, true);
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

  Particle.prototype.defineColor = function () {
    if (blackout) {
      this.color = 'rgba(0, 0, 0, 0.1)';
    } else {
      this.color = 'rgba(255, 255, 255, 0.1)';
    }
  };

  init();

  document.addEventListener('click', function (e) {
    switchBlackout();
  });

})();