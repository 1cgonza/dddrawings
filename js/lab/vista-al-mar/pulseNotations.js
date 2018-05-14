var Notations = function(container) {
  this.stage = DDD.canvas(container, {h: 60});
  this.stage.canvas.style.zIndex = 9999;
};

export default Notations;

Notations.prototype.bindData = function(data) {
  this.data = data;
  this.stepX = this.stage.w / data.length;
};

Notations.prototype.init = function() {
  var ctx = this.stage.ctx;
  var animReq;
  var i = 0;
  var step = 3000;
  var len = this.data.length;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.01)';

  let _this = this;

  function render() {
    if (i < len) {
      for (var j = i; j < i + step; j++) {
        _this.update(j);
      }
      i += step;
      animReq = requestAnimationFrame(render);
    } else {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.01)';
    }
  }
  render();

  // for (var i = 0; i < this.data.length; i++) {
  //   this.update(i);
  // }
};

Notations.prototype.update = function(i) {
  var ctx = this.stage.ctx;
  var beat = this.data[i];
  var x = i * this.stepX;

  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, -500 + beat);
  ctx.stroke();
};

Notations.prototype.getNewI = function(x) {
  return x / this.stepX | 0;
};
