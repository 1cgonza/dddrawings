import Marsaglia from './Marsaglia.js';

export default class PerlinGenerator {
  constructor(seed) {
    const rnd = new Marsaglia(seed, (seed << 16) + (seed >> 16));
    const perm = new Uint8Array(512);

    for (let i = 0; i < 256; i++) {
      perm[i] = i;
    }

    for (let i = 0; i < 256; i++) {
      const j = rnd.intGenerator() & 0xff;
      const t = perm[j];
      perm[j] = perm[i];
      perm[i] = t;
    }

    for (let i = 0; i < 256; i++) {
      perm[i + 256] = perm[i];
    }

    this.perm = perm;
  }

  grad2d(i, x, y) {
    const v = (i & 1) === 0 ? x : y;
    return (i & 2) === 0 ? -v : v;
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  noise2d(x, y) {
    const perm = this.perm;
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const fx = (3 - 2 * x) * x * x;
    const fy = (3 - 2 * y) * y * y;
    const p0 = perm[X] + Y;
    const p1 = perm[X + 1] + Y;

    return this.lerp(
      fy,
      this.lerp(fx, this.grad2d(perm[p0], x, y), this.grad2d(perm[p1], x - 1, y)),
      this.lerp(fx, this.grad2d(perm[p0 + 1], x, y - 1), this.grad2d(perm[p1 + 1], x - 1, y - 1))
    );
  }
}
