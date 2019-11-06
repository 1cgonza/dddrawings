import { random, PI, TWO_PI } from 'dddrawings';
const cols = 14;
const rows = 1;
const imgW = 614;
const imgH = 50;
const offX = 25;
const offY = 25;
const frameW = Math.round(imgW / cols);
const frameH = Math.round(imgH / rows);

export default class Bird {
  constructor(x, y, ctx, img) {
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.img = img;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.mass = random(20, 30);
    this.orientation = 0;
    this.turnSpeed = TWO_PI / 30;
    this.frameX = random(0, 13);
  }
  /**
      TODO:
      - check distance for acceleration of birds if far from objective and slow for closer
      - If mode is positive, make sure birds rotate away.
     */
  update(tx, ty, mode) {
    const dx = this.x - tx;
    const dy = this.y - ty;
    // const distance = Math.pow(dx, 2) + Math.pow(dy, 2);
    const theta = Math.atan2(dy, dx);
    let delta = theta - this.orientation;
    const deltaAbs = Math.abs(delta);

    if (deltaAbs > PI) {
      delta = deltaAbs - TWO_PI;
    }

    if (delta !== 0) {
      const dir = delta / deltaAbs;
      this.orientation += dir * Math.min(this.turnSpeed, deltaAbs);
    }
    this.orientation %= TWO_PI;
    this.ax = this.mass * mode + 0.05;
    this.ay = (this.mass / 3) * mode;
    this.x += Math.cos(this.orientation) * this.ax;
    this.y += Math.sin(this.orientation) * this.ay;
    // nice way to loop through frames
    this.frameX = (this.frameX + 1) % cols;
  }

  draw(r) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.orientation - r);
    ctx.drawImage(this.img, this.frameX * frameW, 0, frameW, frameH, -offX, -offY, frameW, frameH);
    ctx.restore();
  }
}
