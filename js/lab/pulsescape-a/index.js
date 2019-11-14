import { canvas, json } from 'dddrawings';

const container = document.getElementById('ddd-container');
const stage = canvas(container);

/*----------  GLOBALS  ----------*/
let pulse = [];
let ringsGap = 0;
let ringsTotal = 0;
let ringsCount = 0;
let counter = 0;
let loop = 0;
let night = false;
let animationReq;

json({
  url: '../../data/pulse/heart.2.json',
  container: container,
  loadingMsg: 'Loading Pulse Data'
})
  .then(data => {
    data.beats.forEach(b => {
      if (b.charAt(0) === 'S') {
        pulse.push(+b.substr(1));
      }
    });

    ringsTotal = pulse.length / 720;
    ringsGap = ringsTotal / stage.canvas.height;

    stage.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';

    restart();
    animationReq = requestAnimationFrame(render);
  })
  .catch(err => console.error(err));

function restart() {
  stage.ctx.translate(stage.center.x, stage.center.y);
  ringsCount = 0;
  counter = 0;
  loop = 0;
  animationReq = requestAnimationFrame(render);
}

function render() {
  if (ringsCount <= ringsTotal) {
    const reduce = ringsCount * ringsGap - loop * stage.canvas.width;

    if (reduce > stage.canvas.width) loop++;

    for (let i = 0; i < 720; i++) {
      stage.ctx.save();
      stage.ctx.rotate((i * Math.PI) / 360);

      if (counter < pulse.length) {
        stage.ctx.fillRect(0, pulse[counter] - reduce, 1, 1);
        counter++;
      }
      stage.ctx.restore();
    }
    ringsCount++;

    animationReq = requestAnimationFrame(render);
  } else {
    console.log('Done rendering');
  }
}

container.onclick = () => {
  window.cancelAnimationFrame(animationReq);
  night = !night;

  stage.ctx.translate(-stage.center.x, -stage.center.y);

  if (night) {
    stage.ctx.fillStyle = '#1D1D1D';
    stage.ctx.fillRect(0, 0, stage.canvas.width, stage.canvas.height);
    stage.ctx.fillStyle = 'rgba(255, 255, 255, 0.2';
  } else {
    stage.ctx.fillStyle = '#FFFFFF';
    stage.ctx.fillRect(0, 0, stage.canvas.width, stage.canvas.height);
    stage.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  }

  restart();
};
