/**
 * Perlin Noise from processing-js (modified to learn what things do and use only what requiered here)
 * https://github.com/processing-js/processing-js/blob/50ccecf274612df1db8dcfe38ac220f0c12d6e79/src/P5Functions/Math.js#L510-L677
 */

import PerlinGenerator from './PerlinGenerator';

export default class PerlinNoise {
  constructor() {
    this.octaves = 4;
    this.fallout = 0.5;
  }

  updateDetail(octaves, fallout) {
    this.octaves = octaves;

    if (fallout !== null) {
      this.fallout = fallout;
    }
  }

  setSeed(x, y) {
    this.generator = new PerlinGenerator(x, y);
  }

  noise(x, y) {
    let effect = 1;
    let k = 1;
    let sum = 0;

    for (let i = 0; i < this.octaves; ++i) {
      effect *= this.fallout;
      sum += (effect * (1 + this.generator.noise2d(k * x, k * y))) / 2;
      k *= 2;
    }
    return sum;
  }
}
