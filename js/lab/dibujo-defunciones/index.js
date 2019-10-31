import { canvas, DataRequest, Map } from 'dddrawings';
import UI from './UI';
import Sprite from './Sprite';
import Levit from './Levit';
import { imgs } from './imgs';

const violenceReq = new DataRequest();

/*----------  STAGE  ----------*/
const container = document.getElementById('ddd-container');
let loading = document.createElement('div');

let bg = canvas(null);
let log = canvas(container);
let papa = canvas(container);
let papaNext = canvas(container);
let papaLast = canvas(container);
let papaW;
let papaH;

let stage = canvas(container);

papa.canvas.id = 'papa';

export let assets = {};

loading.className = 'loading';
bg.center.y = stage.center.y = (bg.h / 1.5) | 0;
container.appendChild(loading);

/*----------  DATA  ----------*/
export let year = 2008;
let bodies = [];
let d = [];
let geoD = [];
let dLoaded = false;
let geoLoaded = false;

/*----------  ANIMATION  ----------*/
export let animReq;
let dataI = 0;
let hold = 4;
let tick = 0;

/*----------  MAP  ----------*/
let map = new Map({
  zoom: 8,
  width: stage.w,
  height: stage.h,
  center: {
    lon: -71.999996,
    lat: 4.000002
  }
});

/*----------  TIME  ----------*/
let prevTimePosition = 0;

// Set dates range as ISO 8601 YYYY-MM-DDThh:mm:ss
let dIni = Date.parse(year + '/01/01 00:00:00') / 1000;
let dEnd = Date.parse(year + 1 + '/01/01 00:00:00') / 1000;

/*----------  SPRITES  ----------*/
let imgsLoaded = 0;

/*----------  MENU  ----------*/
let ui = new UI(container, reloadStage, violenceReq);

function reloadStage(newYear) {
  loading.innerHTML = '';
  loading.style.opacity = 1;
  year = newYear;
  dataI = 0;
  bodies = [];
  d = [];
  dLoaded = false;
  prevTimePosition = 0;
  dIni = Date.parse(year + '/01/01 00:00:00') / 1000;
  dEnd = Date.parse(year + 1 + '/01/01 00:00:00') / 1000;

  stage.ctx.clearRect(0, 0, stage.w, stage.h);
  log.ctx.clearRect(0, 0, log.w, log.h);
  bg.ctx.clearRect(0, 0, bg.w, bg.h);

  requestViolenceData();
  checkAssetsLoaded();
  console.log(year);
}

function requestViolenceData() {
  violenceReq
    .json({
      url: '../../data/monitor/violencia-' + year + '.json',
      container: container,
      loadingMsg: 'Loading Violence Data',
      loadingEle: loading
    })
    .then(function(res) {
      d = res.data;
      dLoaded = true;
    })
    .catch(function(err) {
      console.error(err);
    });
}

function init() {
  requestViolenceData();

  for (let i = 0; i < imgs.length; i++) {
    let sprite = new Sprite(imgs[i].options);
    sprite.img.onload = () => {
      imgsLoaded++;
    };
    sprite.img.src = sprite.src;
    assets[imgs[i].key] = sprite;
    papaW = papa.h - 50;
    papaH = papa.h - 50;
  }

  checkAssetsLoaded();
}

function checkAssetsLoaded() {
  if (imgsLoaded === imgs.length && dLoaded) {
    loading.style.opacity = 0;
    stage.ctx.globalCompositeOperation = 'source-over';
    stage.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    stage.ctx.fillRect(0, 0, stage.w, stage.h);
    fade();
    animate();
  } else {
    animReq = requestAnimationFrame(checkAssetsLoaded);
  }
}

function animate() {
  if (dataI < d.length - 1) {
    if (tick === hold) {
      draw(dataI);
      tick = 0;
    }
    dataI++;
    tick++;
    animReq = requestAnimationFrame(animate);
  } else {
    window.cancelAnimationFrame(animReq);
  }
}

let currentImage = 1;
let op = 1;

function nextImage() {
  currentImage++;

  if (currentImage >= 4) {
    currentImage = 1;
  }

  op = 1;
}

function fade() {
  let n = (currentImage + 1) % 4;
  let nextI = n % 4 === 0 ? 1 : n;
  let curr = assets['papa' + currentImage].img;
  let next = assets['papa' + nextI].img;
  op -= 0.005;
  papaLast.ctx.clearRect(0, 0, papaLast.w, papaLast.h);
  papaLast.ctx.globalAlpha = op;
  papaLast.ctx.drawImage(curr, papa.w / 2 - papaW / 2 - 200, papa.h / 2 - papaH / 2, papaW, papaH);

  papaNext.ctx.clearRect(0, 0, papaNext.w, papaNext.h);
  papaNext.ctx.globalAlpha = 1 - op;
  papaNext.ctx.drawImage(next, papa.w / 2 - papaW / 2 - 200, papa.h / 2 - papaH / 2, papaW, papaH);

  papa.ctx.clearRect(0, 0, papa.w, papa.h);
  papa.ctx.drawImage(papaLast.canvas, 0, 0);
  papa.ctx.drawImage(papaNext.canvas, 0, 0);

  if (op <= 0) {
    nextImage();
  }

  animReq = requestAnimationFrame(fade);
}

function draw(i) {
  let e = d[i];

  if (e.hasOwnProperty('vTotal') && e.hasOwnProperty('cat') && e.cat.indexOf('Homicidio') >= 0) {
    let total = d[i].vTotal;

    if ('lon' in e && 'lat' in e) {
      let coords = map.convertCoordinates(e.lon, e.lat);

      for (let t = 0; t < total; t++) {
        bodies.push(new Levit(bg, coords, t));
      }
    }
  }

  if (bodies.length > 0) {
    bg.ctx.clearRect(0, 0, stage.w, stage.h);

    for (let n = 0; n < bodies.length; n++) {
      if (!bodies[n].finished) {
        bodies[n].draw();
      }
    }

    stage.ctx.globalCompositeOperation = 'source-over';
    stage.ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
    stage.ctx.fillRect(0, 0, stage.w, stage.h);
    stage.ctx.globalCompositeOperation = 'xor';
    stage.ctx.drawImage(bg.canvas, 0, 0);
  }
}

init();
