import * as dddrawings from 'dddrawings';

export default class Notations {
  constructor(container) {
    this.stage = dddrawings.canvas(container, { h: 60 });
    this.stage.canvas.style.zIndex = 9999;
  }
  bindData(data) {
    this.data = data;
    this.stepX = this.stage.w / data.length;
  }
  init() {
    const ctx = this.stage.ctx;
    let animReq;
    let i = 0;
    const step = 3000;
    const len = this.data.length;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.01)';
    let _this = this;
    function render() {
      if (i < len) {
        for (let j = i; j < i + step; j++) {
          _this.update(j);
        }
        i += step;
        animReq = requestAnimationFrame(render);
      } else {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.01)';
      }
    }
    render();
    // for (let i = 0; i < this.data.length; i++) {
    //   this.update(i);
    // }
  }
  update(i) {
    const ctx = this.stage.ctx;
    const beat = this.data[i];
    const x = i * this.stepX;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, -500 + beat);
    ctx.stroke();
  }
  getNewI(x) {
    return (x / this.stepX) | 0;
  }
}
