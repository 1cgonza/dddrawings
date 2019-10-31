import { assets } from './index';

export default class Levit {
  constructor(stage, coords, num) {
    this.stage = stage;
    this.x = coords.x;
    this.y = coords.y;
    this.frameX = 0;
    this.finished = false;
    this.r = -num;
    this.forward = true;
    this.pushY = 0;
    this.count = 0;
  }

  draw() {
    let stage = this.stage;
    let ctx = stage.ctx;

    if (this.count < assets.levit.cols * 2) {
      if (!this.forward) {
        this.pushY += assets.levit.fh / 15;
      }

      ctx.save();
      ctx.translate(stage.center.x, stage.center.y);
      ctx.rotate((this.r * Math.PI) / 20);
      ctx.drawImage(
        assets.levit.img,
        this.frameX * assets.levit.fw,
        0,
        assets.levit.fw,
        assets.levit.fh,
        this.x - assets.levit.offX,
        this.y - assets.levit.offY - this.pushY,
        assets.levit.fw,
        assets.levit.fh
      );
      ctx.restore();

      if (this.forward) {
        this.frameX++;
      } else {
        this.frameX--;
      }
      this.count++;

      if (this.frameX === assets.levit.cols - 1) {
        this.forward = false;
      }
    } else {
      this.del();
    }
  }

  del() {
    this.finished = true;
  }
}
