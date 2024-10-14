import { canvas } from 'dddrawings';

export default (data, stage, notations) => {
  const ref = canvas(stage, { w: notations.canvas.width, h: notations.canvas.height });
  const ctx = ref.ctx;

  data.forEach((d) => {
    if (d.hasOwnProperty('r') && d.hasOwnProperty('r2')) {
      ctx.save();

      ctx.translate(ref.canvas.width / 2, ref.canvas.height / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.rotate((d.r * Math.PI) / 180);
      ctx.lineTo(0, -d.h);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.stroke();

      ctx.beginPath();
      ctx.translate(0, -d.h);
      ctx.moveTo(0, 0);
      ctx.rotate((d.r2 * Math.PI) / 180);
      ctx.lineTo(0, -d.h2);
      ctx.strokeStyle = 'rgba(255,0,0,0.3)';
      ctx.stroke();

      ctx.restore();
    }
  });
};
