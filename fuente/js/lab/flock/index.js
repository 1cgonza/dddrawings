import { canvas, random } from 'dddrawings';
/*----------  SET STAGE  ----------*/
const container = document.getElementById('ddd-container');
const stage = canvas(container);

const flockSize = 50;
let flock = [];

/*----------  SPRITE  ----------*/
let options = {
  width: 226,
  height: 50,
  cols: 5,
  cellOffsetX: -23,
  cellOffsetY: -25,
  framesPerImage: 5,
};
const img = new Image();
img.onload = initFlock;
img.src = '/img/sprites/birdFly_f5_w226_h50.png';

function initFlock() {
  options.frameW = (options.width / options.cols) | 0;
  options.frameH = options.height;
  options.loopEnd = options.framesPerImage * options.cols;

  stage.ctx.globalAlpha = 1;

  for (let i = 0; i < flockSize; i++) {
    flock[i] = new Bird();
  }

  animate();
}

function animate() {
  flock.forEach((bird) => {
    bird.update();
    bird.draw();
  });
  requestAnimationFrame(animate);
}

/*============================
  =            BIRD            =
  ============================*/
class Bird {
  constructor() {
    // start the loop of each bird in a random frame so they look different
    this.firstFrameX = random(0, options.cols);
    this.currentFrameX = this.firstFrameX * options.frameW;
    this.cycleCounter = this.firstFrameX * options.framesPerImage;
    this.cycleNextFrame = this.cycleCounter + options.framesPerImage;
    this.cycleEnd = options.framesPerImage * options.cols;
    // Set initial location and speed to 0
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    // This gravity defines the arc size of the bird's flying trajectory.
    this.gravityY = 0.005;
    // Run the shuffle first to assign some parameters to the first group of birds.
    this.shuffle();
  }

  shuffle() {
    // Start again in a new random x position outside the screen (left).
    this.x = random(-stage.w, 0);
    // Start again in a new random y position.
    this.y = random(0, stage.h);
    // Set a new speed.
    this.vx = (10 + random(0, 11)) | 0;
    /**
     * Set new direction.
     * This returns a random value in both negative and positive.
     * Negative makes the bird fly up and positive down.
     **/
    this.vy = random(-1, 2, true);
  }
  update() {
    // Once the bird is out of screen, recycle it by runnning the shuffle function to get new parameters.
    if (this.x > stage.w) {
      this.shuffle();
    }
    // Add some gravity to the vertical velocity so the bird's path has a small curve.
    this.vy += this.vy * this.gravityY;
    // Rotate the bird acorrding to the changes in vertical velocity. This keeps the head pointing to the direction it is going.
    this.rotation = this.vy / 10;
    this.x += this.vx;
    this.y += this.vy;
    if (this.cycleCounter === this.cycleEnd) {
      this.cycleCounter = 0;
      this.currentFrameX = 0;
      this.cycleNextFrame = options.framesPerImage;
    } else if (this.cycleCounter === this.cycleNextFrame) {
      this.currentFrameX += options.frameW;
      this.cycleNextFrame += options.framesPerImage;
    }
    this.cycleCounter++;
  }
  draw() {
    const ctx = stage.ctx;
    ctx.save();
    // FOG
    ctx.globalAlpha = 0.05;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0, 0, stage.w, stage.h);
    // back to normal painting before rendering the bird
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.rotate(this.rotation);
    ctx.drawImage(
      img,
      this.currentFrameX,
      0,
      options.frameW,
      options.frameH,
      this.x,
      this.y,
      options.frameW,
      options.frameH
    );
    ctx.restore();
  }
}

/*-----  End of BIRD  ------*/
