export default class Beat {
  constructor(x, y, ctx) {
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.count = 0;
    this.f = 0;
  }
  // add relationship between beats to increase the combination possibilities with the objects created.
  // if the only property that defines a new image is the beat value, there is about 48 options in total,
  // triggering them as they appear is ok, but more predictable in comparison to the data viz timeline.
  draw(i, rStep) {
    const ctx = this.ctx;
    const r = i * rStep;
    this.count++;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.count, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((r * Math.PI) / 180);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -this.count);
    ctx.stroke();
    ctx.restore();
  }
}
