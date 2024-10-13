import { canvas, json, TWO_PI } from 'dddrawings';

/*----------  SET STAGE  ----------*/
const container = document.getElementById('ddd-container');
const bg = canvas(container, { position: 'fixed' });
const stage = canvas(container);
const bgAnim = canvas(container, { position: 'fixed' });

/*----------  GLOBALS  ----------*/
let btData = [];
let dataI = 0;
let progress = 0;
let nextBeat = 0;
let startCounter = 0;
let radius = 0;

bgAnim.ctx.globalAlpha = 0.1;

json({
  url: '/data/pulse/heart.2.json',
  container: container,
  loadingMsg: 'Loading Pulse Data',
})
  .then((data) => {
    data.beats.forEach((beat, i) => {
      if (beat.charAt(0) === 'B' && data.beats[i + 1].charAt(0) === 'Q') {
        const bpm = Number(beat.substr(1));
        const time = Number(data.beats[i + 1].substr(1));
        btData.push({ bpm: bpm, t: time });
      }
    });

    stage.canvas.width = btData.length;

    bg.img = new Image();
    bg.img.onload = loadBackground;
    bg.img.src = '/img/backgrounds/white-paper.jpg';
  })
  .catch((err) => console.error(err));

function loadBackground() {
  bg.ctx.drawImage(bg.img, 0, 0, 1764, 1250, 0, 0, bg.w, bg.h);
  btData.forEach((d, i) => drawLine(i));
  animate();
}

function animate(timestamp) {
  if (dataI < btData.length) {
    nextBeat = btData[dataI].t;

    if (timestamp !== undefined) {
      if (startCounter === 0) {
        startCounter = timestamp;
      }
    }

    progress = timestamp - startCounter;

    if (progress >= nextBeat) {
      const beat = btData[dataI].bpm;

      bgAnim.ctx.clearRect(0, 0, bgAnim.w, bgAnim.h);
      radius = beat;

      stage.ctx.save();
      stage.ctx.strokeStyle = '#E80200';
      drawLine(dataI);
      stage.ctx.restore();
      startCounter = 0;
      dataI++;
    }

    radius++;
    bgAnim.ctx.beginPath();
    bgAnim.ctx.arc(bgAnim.w / 2, 150, radius, 0, TWO_PI);
    bgAnim.ctx.stroke();

    requestAnimationFrame(animate);
  } else {
    console.log('End');
  }
}

function drawLine(i) {
  radius++;
  stage.ctx.beginPath();
  stage.ctx.moveTo(i, stage.h);
  stage.ctx.lineTo(i, stage.h - btData[i].bpm * 4);
  stage.ctx.stroke();
}

container.onclick = (eve) => (dataI = eve.pageX);
