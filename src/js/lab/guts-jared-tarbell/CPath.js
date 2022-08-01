import { random, TWO_PI, HALF_PI } from 'dddrawings';
import SandPainter from './SandPainter.js';

export default class CPath {
  constructor(id, colors, stage) {
    this.id = id;
    this.colors = colors;
    this.centerX = stage.center.x;
    this.centerY = stage.center.y;
    this.height = stage.h;
    this.width = stage.w;
    this.av = 0;
    this.numSands = 3;
    this.c = this.colors.someColor();
    this.sandGut = new SandPainter(3, this.colors, stage);
    this.sandGut.c = [0, 0, 0];
    this.sandsCenter = [];
    this.sandsLeft = [];
    this.sandsRight = [];

    for (let s = 0; s < this.numSands; s++) {
      this.sandsCenter[s] = new SandPainter(0, this.colors, stage);
      this.sandsLeft[s] = new SandPainter(1, this.colors, stage);
      this.sandsRight[s] = new SandPainter(1, this.colors, stage);
      this.sandsLeft[s].c = [0, 0, 0];
      this.sandsRight[s].c = [0, 0, 0];
      this.sandsCenter[s].c = this.colors.someColor();
    }

    this.reset();
  }

  reset() {
    const d = random(0, this.centerY, true);
    const t = random(0, TWO_PI, true);
    const ci = ((this.colors.goodColors.length * 2 * d) / this.height) | 0;
    this.x = d * Math.cos(t);
    this.y = d * Math.sin(t);
    for (let s = 0; s < this.numSands; s++) {
      this.sandsCenter[s].c = this.colors.goodColors[ci];
    }
    this.v = 0.5;
    this.a = random(0, TWO_PI, true);
    this.grth = 0.1;
    this.gv = 1.2;
    this.pt = Math.pow(3, 1 + (this.id % 3));
    this.time = 0;
    this.tdv = random(0.1, 0.5, true);
    this.tdvm = random(1, 100, true);
    this.fadeOut = false;
    this.moveme = true;
  }

  draw() {
    for (let p = 0; p < this.pt; p++) {
      // calculate actual angle
      const t = Math.atan2(this.y, this.x);
      // console.log(t);
      const at = t + p * (TWO_PI / this.pt);
      const ad = this.a + p * (TWO_PI / this.pt);
      // calculate distance
      const d = Math.sqrt(this.x * this.x + this.y * this.y);
      // calculate actual xy
      const ax = this.centerX + d * Math.cos(at);
      const ay = this.centerY + d * Math.sin(at);
      // calculate girth markers
      const cx = 0.5 * this.grth * Math.cos(ad - HALF_PI);
      const cy = 0.5 * this.grth * Math.sin(ad - HALF_PI);
      // draw points
      // paint background white
      for (let s = 0; s < this.grth * 2; s++) {
        const dd = random(-0.9, 0.9, true);
        const _x = (ax + dd * cx) | 0;
        const _y = (ay + dd * cy) | 0;
        const _i = (_y * this.stageW + _x) * 4;
        this.colors.setPixelColor(_i, [255, 255, 255], 1);
      }
      const newX = ax + cx * 0.6;
      const newY = ay + cy * 0.6;
      const newX2 = ax - cx * 0.6;
      const newY2 = ay - cy * 0.6;
      const newX3 = ax + cx;
      const newY3 = ay + cy;
      const newX4 = ax - cx;
      const newY4 = ay - cy;

      for (let i = 0; i < this.numSands; i++) {
        this.sandsCenter[i].render(newX, newY, newX2, newY2);
        this.sandsLeft[i].render(newX, newY, newX3, newY3);
        this.sandsRight[i].render(newX2, newY2, newX4, newY4);
      }
      // paint crease enhancement
      this.sandGut.render(newX3, newY3, newX4, newY4);
    }
  }

  grow() {
    this.time += random(0, 4, true);
    this.x += this.v * Math.cos(this.a);
    this.y += this.v * Math.sin(this.a);
    // rotational meander
    this.av = 0.1 * Math.sin(this.time * this.tdv) + 0.1 * Math.sin((this.time * this.tdv) / this.tdvm);
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
      this.gv += random(-0.15, 0.12, true);
      if (this.grth < 6) {
        this.grth = 6;
        this.gv *= 0.9;
      } else if (this.grth > 26) {
        this.grth = 26;
        this.gv *= 0.8;
      }
    }
    this.draw();
  }

  terminate() {
    this.fadeOut = true;
  }
}
