import { random } from 'dddrawings';

export default class SandPainter {
  constructor(colors, stageW) {
    this.colors = colors;
    this.stageW = stageW;
    this.c = colors.someColor();
    this.g = random(0.01, 0.1, true);
  }

  render(x, y, ox, oy) {
    const pixels = this.colors.pixels;
    const maxg = 1;
    const grains = 64;

    this.g += random(-0.05, 0.05, true);
    this.g = this.g < 0 ? 0 : this.g;
    this.g = this.g > maxg ? maxg : this.g;

    const w = this.g / (grains - 1);
    const r1 = this.c[0];
    const g1 = this.c[1];
    const b1 = this.c[2];

    for (let i = 0; i < grains; i++) {
      const a = 0.1 - i / (grains * 10);
      const dist = Math.sin(Math.sin(i * w));
      const _x = (ox + (x - ox) * dist) | 0;
      const _y = (oy + (y - oy) * dist) | 0;
      const _i = (_y * this.stageW + _x) * 4;
      const r2 = pixels[_i];
      const g2 = pixels[_i + 1];
      const b2 = pixels[_i + 2];
      // Blend painter color with existing pixel based on alpha.
      this.colors.setPixelColor(_i, [(r2 * r1) / 255, (g2 * g1) / 255, (b2 * b1) / 255], a);
    }
  }
}
