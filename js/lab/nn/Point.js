import { TWO_PI } from 'dddrawings';

export default class Point {
  constructor(x, y, r, color, ctx) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.finished = false;
    this.timer = 0;
    this.color = color;
    this.ctx = ctx;
  }

  update(perlin, w, h) {
    const ctx = this.ctx;
    const xv = Math.cos(perlin.noise(this.x * 0.01, this.y * 0.01) * (this.r * TWO_PI));
    const yv = Math.sin(perlin.noise(this.x * 0.01, this.y * 0.01) * (this.r * TWO_PI));
    const xt = this.x + xv;
    const yt = this.y + yv;

    if (this.timer >= 800) {
      this.finished = true;
    } else if (this.x > w || this.x < 0 || this.y > h || this.y < 0) {
      this.finished = true;
    }

    ctx.beginPath();
    ctx.moveTo(xt, yt);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = this.color[0];
    ctx.stroke();

    this.x = xt;
    this.y = yt;
    this.timer++;
  }
}
