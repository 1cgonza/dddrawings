import { random } from 'dddrawings';
import SandPainter from './SandPainter.js';

export default class Crack {
  constructor(colors, stageW, stageH, makeCrack) {
    this.colors = colors;
    this.stageW = stageW;
    this.stageH = stageH;
    this.makeCrack = makeCrack;
    this.x = 0;
    this.y = 0;
    this.t = 0;
    this.findStart();
    this.sp = new SandPainter(colors, stageW);
  }

  findStart() {
    let px = 0;
    let py = 0;
    let found = false;
    let timeout = 0;

    while (!found || timeout++ > 1000) {
      px = random(0, this.stageW);
      py = random(0, this.stageH);

      if (this.colors.cGrid[py * this.stageW + px] < 10000) {
        found = true;
      }
    }

    if (found) {
      let a = this.colors.cGrid[py * this.stageW + px];

      if (random(0, 100) < 50) {
        a -= 90 + random(-2, 2.1, true);
      } else {
        a += 90 + random(-2, 2.1, true);
      }
      this.startCrack(px, py, a);
    }
  }

  startCrack(x, y, t) {
    const _dir = (t * Math.PI) / 180;
    this.x = x;
    this.y = y;
    this.t = t;
    this.x += 0.61 * Math.cos(_dir);
    this.y += 0.61 * Math.sin(_dir);
  }

  move() {
    const pixels = this.colors.pixels;
    const cGrid = this.colors.cGrid;
    const z = 0.33;
    const _dir = (this.t * Math.PI) / 180;
    const cx = (this.x + random(-z, z, true)) | 0;
    const cy = (this.y + random(-z, z, true)) | 0;
    const _i = (cy * this.stageW + cx) * 4;

    this.x += 0.42 * Math.cos(_dir);
    this.y += 0.42 * Math.sin(_dir);

    this.regionColor();

    pixels[_i] = pixels[_i] * 0.9;
    pixels[_i + 1] = pixels[_i + 1] * 0.9;
    pixels[_i + 2] = pixels[_i + 2] * 0.9;

    if (cx >= 0 && cx < this.stageW && cy >= 0 && cy < this.stageH) {
      const i = cy * this.stageW + cx;

      if (cGrid[i] > 10000 || Math.abs(cGrid[i] - this.t) < 5) {
        cGrid[i] = this.t;
      } else if (Math.abs(cGrid[i] - this.t) > 2) {
        this.findStart();
        this.makeCrack();
      }
    } else {
      this.findStart();
      this.makeCrack();
    }
  }

  regionColor() {
    let rx = this.x;
    let ry = this.y;
    let openspace = true;

    while (openspace) {
      const d = (this.t * Math.PI) / 180;
      rx += 0.81 * Math.sin(d);
      ry -= 0.81 * Math.cos(d);

      if (rx >= 0 && rx < this.stageW && ry >= 0 && ry < this.stageH) {
        openspace = !(this.colors.cGrid[(ry * this.stageH + rx) | 0] < 10000);
      } else {
        openspace = false;
      }
    }
    this.sp.render(rx, ry, this.x, this.y);
  }
}
