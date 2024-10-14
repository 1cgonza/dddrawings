import { sizeFromPercentage, getPercent } from 'dddrawings';
import { Notations, notationsVideo } from '../../utils/Notations.js';

const container = document.getElementById('ddd-container');
const video = document.getElementById('video');
const stage = document.createElement('div');

let animReq;
let loaded = false;

stage.id = 'right-col';
stage.style.width = '60%';
stage.style.height = window.innerHeight + 'px';

container.appendChild(stage);

const notations = new Notations({
  img: {
    width: 1874,
    height: 1023,
    offTop: 214,
    offRight: 24,
    offBottom: 17,
    offLeft: 165,
    src: '/img/notations/bug-goes-to-town.jpg',
    cb: imgReady,
    msg: 'Loading Notations',
  },
  secPerPage: 160,
  fps: 24,
  url: '/data/notations/bug-goes-to-town.json',
  cb: notationsReady,
  container: stage,
});
notations.canvas.style.opacity = 0;

function imgReady() {
  loaded = true;
  updateSize();
  notationsRepaint();
  notations.canvas.style.opacity = 1;
}

function notationsReady() {
  notationsVideo(video).then(videoReady);
}

function videoReady() {
  updateSize();
  notationsUpdate();

  video.controls = true;
  video.onplay = () => (animReq = requestAnimationFrame(playerLoop));
  video.onseeking = notationsUpdate;
  video.onpause = () => window.cancelAnimationFrame(animReq);
}

function playerLoop() {
  notationsUpdate();
  animReq = requestAnimationFrame(playerLoop);
}

function notationsUpdate() {
  if (!loaded) return;
  const ctx = notations.ctx;
  const x = video.currentTime * notations.step + notations.offX;

  ctx.clearRect(0, 0, notations.canvas.width, notations.canvas.height);
  notationsRepaint();
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, notations.imgH);
  ctx.strokeStyle = '#fe0404';
  ctx.stroke();
}

function notationsRepaint() {
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
}

function updateSize() {
  const w = stage.offsetWidth;
  const area = sizeFromPercentage(notations.percent.w, w);
  notations.canvas.width = w;
  notations.canvas.height = window.innerHeight;
  notations.resizeH = sizeFromPercentage(getPercent(w, notations.imgW), notations.imgH);
  notations.step = area / video.duration;
  notations.offX = sizeFromPercentage(notations.percent.left, w);
  notationsUpdate();
}

window.onresize = updateSize;
