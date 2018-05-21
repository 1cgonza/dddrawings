import { Notations, notationsVideo } from '../../utils/Notations';

let video;
let animReq;
let loaded = false;

const container = document.getElementById('ddd-container');
let stage = document.createElement('div');
stage.id = 'right-col';
stage.style.width = '60%';
stage.style.height = window.innerHeight + 'px';

container.appendChild(stage);

let notations = new Notations({
  img: {
    width: 1874,
    height: 1023,
    offTop: 214,
    offRight: 24,
    offBottom: 17,
    offLeft: 165,
    src: '/img/assets/notations/bug-goes-to-town.jpg',
    cb: imgReady,
    msg: 'Loading Notations'
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
  video = notationsVideo(document.getElementById('video'), videoReady);
}

function videoReady() {
  updateSize();
  notationsUpdate();

  video.controls = true;

  video.onplay = function() {
    animReq = requestAnimationFrame(playerLoop);
    return false;
  };

  video.onseeking = notationsUpdate;

  video.onpause = function() {
    window.cancelAnimationFrame(animReq);
    return false;
  };
}

function playerLoop() {
  notationsUpdate();
  animReq = requestAnimationFrame(playerLoop);
}

function notationsUpdate() {
  if (!loaded) {
    return;
  }
  notations.ctx.clearRect(0, 0, notations.canvas.width, notations.canvas.height);

  var x = (video.currentTime * notations.step) + notations.offX;

  notationsRepaint();
  notations.ctx.beginPath();
  notations.ctx.moveTo(x, 0);
  notations.ctx.lineTo(x, notations.imgH);
  notations.ctx.strokeStyle = '#fe0404';
  notations.ctx.stroke();
}

function notationsRepaint() {
  notations.ctx.drawImage(
    notations.img,
    0, 0,
    notations.imgW, notations.imgH,
    0, (notations.canvas.height / 2) - (notations.resizeH / 2),
    notations.canvas.width, notations.resizeH
  );
}

function updateSize() {
  var w = stage.offsetWidth;
  var area = DDD.sizeFromPercentage(notations.percent.w, w);
  notations.canvas.width = w;
  notations.canvas.height = window.innerHeight;
  notations.resizeH = DDD.sizeFromPercentage(DDD.getPercent(w, notations.imgW), notations.imgH);
  notations.step = area / video.duration;
  notations.offX = DDD.sizeFromPercentage(notations.percent.left, w);
  notationsUpdate();

  return false;
}

window.onresize = updateSize;
