export default class Sprite {
  constructor(op) {
    this.img = new Image();
    this.src = op.src;
    this.w = op.w;
    this.h = op.h;
    this.cols = op.cols;
    this.rows = op.rows;
    this.offX = op.offX;
    this.offY = op.offY;
    this.fw = (this.w / this.cols) | 0;
    this.fh = (this.h / this.rows) | 0;
  }
}
