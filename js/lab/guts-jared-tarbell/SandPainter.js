import { random, HALF_PI } from 'dddrawings';

export default class SandPainter {
  constructor(m, colors) {
    this.MODE = m;
    this.colors = colors;
    this.c = this.colors.someColor();
    this.g = random(0, HALF_PI, true);
  }

  render(x, y, ox, oy) {
    if (this.MODE === 3) {
      this.g += random(-0.9, 0.5, true);
    } else {
      this.g += random(-0.05, 0.05, true);
    }
    if (this.g < 0) {
      this.g = 0;
    }
    if (this.g > HALF_PI) {
      this.g = HALF_PI;
    }
    if (this.MODE === 3 || this.MODE === 2) {
      this.renderOne(x, y, ox, oy);
    } else if (this.MODE === 1) {
      this.renderInside(x, y, ox, oy);
    } else if (this.MODE === 0) {
      this.renderOutside(x, y, ox, oy);
    }
  }

  renderOne(x, y, ox, oy) {
    // calculate grains by distance
    const grains = 42;
    // lay down grains of sand (transparent pixels)
    const w = this.g / (grains - 1);
    for (let i = 0; i < grains; i++) {
      const a = 0.15 - i / (grains * 10 + 10);
      // paint one side
      const tex = Math.sin(i * w);
      const lex = Math.sin(tex);
      const _x = (ox + (x - ox) * lex) | 0;
      const _y = (oy + (y - oy) * lex) | 0;
      const _i = (_y * stageW + _x) * 4;
      setPixelColor(_i, this.c, a);
    }
  }
  renderInside(x, y, ox, oy) {
    // calculate grains by distance
    const grains = 11;
    // lay down grains of sand (transparent pixels)
    const w = this.g / (grains - 1);

    for (let i = 0; i < grains; i++) {
      const a = 0.15 - i / (grains * 10 + 10);
      // paint one side
      const tex = Math.sin(i * w);
      const lex = 0.5 * Math.sin(tex);
      const _x1 = (ox + (x - ox) * (0.5 + lex)) | 0;
      const _y1 = (oy + (y - oy) * (0.5 + lex)) | 0;
      const _i1 = (_y1 * stageW + _x1) * 4;
      const _x2 = (ox + (x - ox) * (0.5 - lex)) | 0;
      const _y2 = (oy + (y - oy) * (0.5 - lex)) | 0;
      const _i2 = (_y2 * stageW + _x2) * 4;
      setPixelColor(_i1, this.c, a);
      setPixelColor(_i2, this.c, a);
    }
  }

  renderOutside(x, y, ox, oy) {
    // calculate grains by distance
    const grains = 11;
    // lay down grains of sand (transparent pixels)
    const w = this.g / (grains - 1);

    for (let i = 0; i < grains; i++) {
      const a = 0.15 - i / (grains * 10 + 10);
      // paint one side
      const tex = Math.sin(i * w);
      const lex = 0.5 * Math.sin(tex);
      const _x1 = (ox + (x - ox) * lex) | 0;
      const _y1 = (oy + (y - oy) * lex) | 0;
      const _i1 = (_y1 * stageW + _x1) * 4;
      const _x2 = (x + (ox - x) * lex) | 0;
      const _y2 = (y + (oy - y) * lex) | 0;
      const _i2 = (_y2 * stageW + _x2) * 4;
      setPixelColor(_i1, this.c, a);
      setPixelColor(_i2, this.c, a);
    }
  }
}
