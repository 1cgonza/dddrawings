(function () {
  'use strict';
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');
  var stageW = window.innerWidth;
  var stageH = window.innerHeight;
  var flockSize = 50;
  var flock     = [];

  /*==========  SPRITE OPTIONS  ==========*/
  var options = {
    width: 226,
    height: 50,
    cols: 5,
    cellOffsetX: -23,
    cellOffsetY: -25,
    framesPerImage: 5
  };

  /*==========  CREATE CANVAS  ==========*/
  var canvas    = document.createElement('canvas');
  var ctx       = canvas.getContext('2d');
  canvas.width  = stageW;
  canvas.height = stageH;
  container.appendChild(canvas);

  /*==========  LOAD SPRITE  ==========*/
  var img = new Image();
  img.onload = initFlock;
  img.src = '../../img/sprites/birdFly_f5_w226_h50.png';

  function initFlock () {
    options.frameW  = options.width / options.cols | 0;
    options.frameH  = options.height;
    options.loopEnd = options.framesPerImage * options.cols;

    ctx.globalAlpha = 1;

    for (var i = 0; i < flockSize; i++){
      flock[i] = new Bird();
    }

    animate();
    loading.style.opacity = 0;
  }

  function animate () {
    flock.forEach(function (bird) {
      bird.update();
      bird.draw();
    });
    requestAnimationFrame(animate);
  }

  /*============================
  =            BIRD            =
  ============================*/
  function Bird() {
    // start the loop of each bird in a random frame so they look different
    this.firstFrameX   = Math.random() * options.cols | 0;
    this.currentFrameX = this.firstFrameX * options.frameW;

    this.cycleCounter   = this.firstFrameX * options.framesPerImage;
    this.cycleNextFrame = this.cycleCounter + options.framesPerImage;
    this.cycleEnd       = options.framesPerImage * options.cols;

    // Set initial location and speed to 0
    this.x  = 0;
    this.y  = 0;
    this.vx = 0;
    this.vy = 0;

    // This gravity defines the arc size of the bird's flying trajectory.
    this.gravityY = 0.005;

    // Run the shuffle first to assign some parameters to the first group of birds.
    this.shuffle();

    // Start playing, this is defined by the sprite-0.1.js library.
    // this.sprite.play(0); //the number is the row in the spritesheet. Only one row in this case so index 0 is called.
  }

  Bird.prototype.shuffle = function() {
    // Start again in a new random x position outside the screen (left).
    this.x = -( Math.random() * stageW  ) | 0;
    // Start again in a new random y position.
    this.y = ( Math.random() * stageH ) | 0;

    // Set a new speed.
    this.vx = 15 + (Math.random() * 11) | 0;

    /**
    * Set new direction.
    * This returns a random value in both negative and positive.
    * Negative makes the bird fly up and positive down.
    **/
    this.vy = ( Math.random() * 5 ) - 2 | 0;
  };

  Bird.prototype.update = function() {
    // Once the bird is out of screen, recycle it by runnning the shuffle function to get new parameters.
    if (this.x > stageW) {
      this.shuffle();
    }

    // Add some gravity to the vertical velocity so the bird's path has a small curve.
    this.vy += (this.vy * this.gravityY);

    // Rotate the bird acorrding to the changes in vertical velocity. This keeps the head pointing to the direction it is going.
    this.rotation = this.vy / 10;
    this.x += this.vx;
    this.y += this.vy;

    if (this.cycleCounter === this.cycleEnd) {
      this.cycleCounter   = 0;
      this.currentFrameX  = 0;
      this.cycleNextFrame = options.framesPerImage;
    } else if (this.cycleCounter === this.cycleNextFrame) {
      this.currentFrameX  += options.frameW;
      this.cycleNextFrame += options.framesPerImage;
    }
    this.cycleCounter++;
  };

  Bird.prototype.draw = function() {
    ctx.save();
    // FOG
    ctx.globalAlpha = 0.05;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0, 0, stageW, stageH);

    // back to normal painting before rendering the bird
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.rotate(this.rotation);
    ctx.drawImage(
      img,
      this.currentFrameX, 0,
      options.frameW, options.frameH,
      this.x, this.y,
      options.frameW, options.frameH
    );
    ctx.restore();
  };

  /*-----  End of BIRD  ------*/

})();

