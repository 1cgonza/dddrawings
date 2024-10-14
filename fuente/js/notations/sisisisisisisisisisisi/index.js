import { sizeFromPercentage, getPercent } from 'dddrawings';
import { Notations, notationsVideo } from '../../utils/Notations.js';
import notes from '../../utils/notes.js';
import assets from './assets.js';
// import debug from './debugger';

const container = document.getElementById('ddd-container');
const stage = document.createElement('div');
let animReq;

stage.id = 'right-col';

container.appendChild(stage);

notes();
updateSize();

const notations = new Notations({
  img: {
    width: 1418,
    height: 1144,
    offTop: 214,
    offRight: 24,
    offBottom: 17,
    offLeft: 165,
    src: assets.largeImg,
    cb: assetReady,
    msg: 'Loading Notations',
  },
  secPerPage: 160,
  fps: 24,
  url: assets.data,
  cb: notationsReady,
  container: stage,
});
notations.canvas.style.opacity = 0;
notations.canvas.style.left = '50%';
notations.canvas.style.transform = 'translateX(-50%)';

function assetReady() {
  assets.loaded++;

  if (assets.loaded === assets.length) {
    assets.ready = true;
    updateSize();
    notationsUpdate();

    notations.canvas.style.opacity = 1;
    assets.video.controls = true;
    assets.video.onplay = () => (animReq = requestAnimationFrame(playerLoop));
    assets.video.onpause = () => window.cancelAnimationFrame(animReq);
    assets.video.onseeking = notationsUpdate;
  }
}

notationsVideo(assets.video).then(assetReady);

function notationsReady(d) {
  assetReady();
  notations.d = d.sections;

  resetHeightInData();

  /*----------  DEBUG  ----------*/
  // debug(notations.d, stage, notations);
}

function playerLoop() {
  notationsUpdate();
  animReq = requestAnimationFrame(playerLoop);
}

function notationsUpdate() {
  const currentI = notations.d.findIndex((d, i) => {
    const currentTime = assets.video.currentTime;
    return currentTime >= d.start && currentTime < notations.d[i + 1].start;
  });
  const current = notations.d[currentI];
  const next = notations.d[currentI + 1];
  const sectionLength = next.start - current.start;
  const lengthOffset = assets.video.currentTime - current.start;
  const rStep = (next.r - current.r) / sectionLength;
  const r2Step = (next.r2 - current.r2) / sectionLength;
  const hStep = (next.h - current.h) / sectionLength;
  const h2Step = (next.h2 - current.h2) / sectionLength;
  const r = lengthOffset * rStep + current.r;
  const r2 = lengthOffset * r2Step + current.r2;
  const h = lengthOffset * hStep + current.h;
  const h2 = lengthOffset * h2Step + current.h2;

  notations.ctx.clearRect(0, 0, notations.canvas.width, notations.canvas.height);
  timelineDraw(r, r2, h, h2);
}

function timelineDraw(r, r2, h, h2) {
  notations.ctx.drawImage(
    notations.img,
    0,
    0,
    notations.imgW,
    notations.imgH,
    0,
    notations.canvas.height / 2 - notations.resizeH / 2,
    notations.canvas.width,
    notations.resizeH
  );

  notations.ctx.save();
  notations.ctx.translate(notations.canvas.width / 2, notations.canvas.height / 2);
  notations.ctx.rotate((r * Math.PI) / 180);

  notations.ctx.beginPath();
  notations.ctx.strokeStyle = 'black';

  notations.ctx.moveTo(0, 0);
  notations.ctx.lineTo(0, -h);
  notations.ctx.stroke();

  notations.ctx.beginPath();
  notations.ctx.strokeStyle = 'red';
  notations.ctx.translate(0, -h);
  notations.ctx.moveTo(0, 0);
  notations.ctx.rotate((r2 * Math.PI) / 180);
  notations.ctx.lineTo(0, -h2);
  notations.ctx.stroke();
  notations.ctx.restore();
}

function resetHeightInData() {
  for (let i = 0; i < notations.d.length; i++) {
    notations.d[i].h = sizeFromPercentage(notations.d[i].hPercent, notations.canvas.width);
    notations.d[i].h2 = sizeFromPercentage(notations.d[i].h2Percent, notations.canvas.width);
  }
}

function updateSize() {
  const pw = getPercent(stage.clientWidth, 1418);
  const ph = getPercent(window.innerHeight, 1144);
  let fitW = sizeFromPercentage(pw, 1418);
  let fitH = sizeFromPercentage(ph, 1144);

  if (pw < ph) {
    fitH = sizeFromPercentage(pw, 1144);
  } else {
    fitW = sizeFromPercentage(ph, 1418);
  }

  stage.style.height = `${fitH}px`;

  if (assets.ready) {
    notations.canvas.width = fitW;
    notations.canvas.height = fitH;
    notations.resizeH = sizeFromPercentage(getPercent(fitW, notations.imgW), notations.imgH);
    resetHeightInData();
    notationsUpdate();
  }
}

window.onresize = updateSize;
