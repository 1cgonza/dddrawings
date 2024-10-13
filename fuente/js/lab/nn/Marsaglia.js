export default class Marsaglia {
  constructor(i1, i2) {
    this.z = i1 || 362436069;
    this.w = i2 || 521288629;
  }

  intGenerator() {
    this.z = (36969 * (this.z & 65535) + (this.z >>> 16)) & 0xffffffff;
    this.w = (18000 * (this.w & 65535) + (this.w >>> 16)) & 0xffffffff;
    return (((this.z & 0xffff) << 16) | (this.w & 0xffff)) & 0xffffffff;
  }
}
