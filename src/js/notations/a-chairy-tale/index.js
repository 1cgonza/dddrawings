import { canvas, json } from 'dddrawings';
import { notationsVideo } from '../../utils/Notations.js';
import notes from '../../utils/notes.js';
import Resize from './Resize.js';
import assets from './assets.js';
import options from './options.js';

const middle = document.getElementById('middle-col');
const right = document.getElementById('right-col');
const loadingR = right.querySelector('.loading');
const loadingM = middle.querySelector('.loading');
let notationsData = [];
let animReq;

// Set globally the video player and two canvases that will communicate with each other.
const timeline = canvas(middle, { css: { position: 'relative', opacity: 0 } });
const notations = canvas(right, { css: { position: 'relative', opacity: 0 } });
const resize = new Resize(middle, right);

middle.style.width = '10%';
right.style.width = '50%';
notations.imgW = 1000;
notations.imgH = 6088;
loadingR.style.opacity = 1;
loadingM.style.opacity = 1;

notes();
resize.stage();

notationsVideo(assets.video).then(() => {
  resize.video(assets.video);
  // Load JSON data about notations
  json({
    url: assets.data,
    container: document.getElementById('description'),
  })
    .then((data) => {
      notationsData = data.sections;

      /*----------  NOTATIONS IMG  ----------*/
      notations.img = new Image();
      notations.img.onload = () => {
        resize.notations(notations);
        notations.imgY = notations.offTop - notations.headerY;
        loadingR.style.opacity = 0;
        notations.canvas.style.opacity = 1;
        checkAssetsLoaded();
        drawNotations();
      };
      notations.img.src = assets.largeImg;

      /*----------  TIMELINE IMG  ----------*/
      timeline.img = new Image();
      timeline.img.onload = () => {
        resize.timeline(timeline);
        timeline.headerY = timeline.offTop;
        loadingM.style.opacity = 0;
        timeline.canvas.style.opacity = 1;
        checkAssetsLoaded();
        drawTimeline();
      };
      timeline.img.src = assets.smallImg;

      checkAssetsLoaded();
    })
    .catch((err) => console.error(err));

  assets.video.onplay = () => (animReq = requestAnimationFrame(playerLoop));
  assets.video.onpause = () => window.cancelAnimationFrame(animReq);
  assets.video.onseeking = () => updateNotations();

  checkAssetsLoaded();
});

function checkAssetsLoaded() {
  assets.loaded++;

  if (assets.loaded === assets.length) {
    assets.video.controls = true;
    resize.ready = true;
  }
}

function playerLoop() {
  updateNotations();
  requestAnimationFrame(playerLoop);
}

function updateNotations() {
  const time = assets.video.currentTime;

  if (time <= 38) {
    const adjustCurrentTime = time * (30 / 38);

    timeline.headerY = adjustCurrentTime * timeline.step + timeline.offTop;
    notations.imgY = adjustCurrentTime * notations.step + notations.offTop - notations.headerY;
  } else {
    const currentTime = (time - 38) * (550 / 548.96);
    const current = notationsData.find((d, i) => {
      if (i === 0) return;
      const head = notationsData[i - 1].notedEndFrame / options.fps;
      const tail = d.notedEndFrame / options.fps;
      return currentTime >= head && currentTime <= tail;
    }).page;

    // Move timeline header
    timeline.headerY = currentTime * timeline.step + timeline.offTop * current + 30 * timeline.step;

    // Move notations image
    notations.imgY =
      currentTime * notations.step +
      notations.offTop * current +
      30 * notations.step - //add the first section that has 30 seconds label but lasts 38 in the video.
      notations.headerY;

    if (current > 1) {
      timeline.headerY = timeline.headerY + timeline.offBottom * (current - 1);
      notations.imgY = notations.imgY + notations.offBottom * (current - 1);
    }
  }

  drawTimeline();
  drawNotations();
}

function drawTimeline() {
  timeline.ctx.clearRect(0, 0, timeline.canvas.width, timeline.canvas.height);
  timeline.ctx.drawImage(timeline.img, timeline.imgX, 0, timeline.imgResizeW, timeline.canvas.height);

  timeline.ctx.beginPath();
  timeline.ctx.moveTo(0, timeline.headerY);
  timeline.ctx.lineTo(timeline.canvas.width, timeline.headerY);
  timeline.ctx.strokeStyle = '#fe0404';
  timeline.ctx.stroke();
}

function drawNotations() {
  notations.ctx.clearRect(0, 0, notations.canvas.width, notations.canvas.height);
  notations.ctx.drawImage(
    notations.img,
    0,
    0,
    notations.imgW,
    notations.imgH,
    0,
    -notations.imgY,
    notations.canvas.width,
    notations.imgH * (notations.canvas.width / notations.imgW)
  );

  notations.ctx.beginPath();
  notations.ctx.moveTo(0, notations.headerY);
  notations.ctx.lineTo(notations.canvas.width, notations.headerY);
  notations.ctx.strokeStyle = '#fe0404';
  notations.ctx.stroke();
}

window.onresize = () => {
  if (resize.ready) {
    resize.all(timeline, notations, assets.video).then(() => {
      updateNotations();
    });
  }
};
