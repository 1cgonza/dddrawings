export default class Mask {
  constructor(container) {
    this.layer = DDD.canvas(container);
    this.layer.canvas.id = 'mask';
    this.layer.canvas.style.pointerEvents = 'none';
    this.layer.canvas.style.zIndex = 99;
    this.draw();
  }

  resize() {
    this.draw();
  }

  draw() {
    var ctx = this.layer.ctx;
    var w = this.layer.canvas.width = window.innerWidth;
    var h = this.layer.canvas.height = window.innerHeight;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.filter = 'blur(70px)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2.5, h / 2.5, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
}
