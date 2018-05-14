import { assets } from './index';

function Levit(stage, coords, num) {
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

export default Levit;

Levit.prototype.draw = function () {
  var stage = this.stage;

  if (this.count < assets.levit.cols * 2) {
    if (!this.forward) {
      this.pushY += assets.levit.fh / 15;
    }
    stage.ctx.save();
    stage.ctx.translate(stage.center.x, stage.center.y);
    stage.ctx.rotate(this.r * Math.PI / 20);
    stage.ctx.drawImage(
      assets.levit.img,
      this.frameX * assets.levit.fw, 0,
      assets.levit.fw, assets.levit.fh,
      this.x - assets.levit.offX, this.y - assets.levit.offY - this.pushY,
      assets.levit.fw, assets.levit.fh
    );
    stage.ctx.restore();

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
};

Levit.prototype.del = function () {
  this.finished = true;
};
