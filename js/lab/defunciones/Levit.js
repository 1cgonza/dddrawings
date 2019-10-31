export default class Levit {
  constructor(coords, num, ctx, centerX, centerY) {
    this.x = coords.x;
    this.y = coords.y;
    this.frameX = 0;
    this.finished = false;
    this.r = -num;
    this.forward = true;
    this.pushY = 0;
    this.count = 0;
    this.ctx = ctx;
    this.centerX = centerX;
    this.centerY = centerY;
  }

  draw() {
    if (this.count < levit.cols * 2) {
      const ctx = this.ctx;
      if (!this.forward) {
        this.pushY += levit.fh / 15;
      }
      ctx.save();
      ctx.translate(this.centerX, this.centerY);
      ctx.rotate((this.r * Math.PI) / 20);
      ctx.drawImage(
        levit.img,
        this.frameX * levit.fw,
        0,
        levit.fw,
        levit.fh,
        this.x - levit.offX,
        this.y - levit.offY - this.pushY,
        levit.fw,
        levit.fh
      );
      ctx.restore();
      if (this.forward) {
        this.frameX++;
      } else {
        this.frameX--;
      }
      this.count++;
      if (this.frameX === levit.cols - 1) {
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
