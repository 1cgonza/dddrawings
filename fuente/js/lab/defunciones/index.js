import { DataRequest, canvas, yearsMenu, Map, resetCurrent, random } from 'dddrawings';
import Sprite from './Sprite.js';
import Levit from './Levit.js';
import imgs from './imagesData.js';

const violenceReq = new DataRequest();
const mapReq = new DataRequest();

/*----------  STAGE  ----------*/
const container = document.getElementById('ddd-container');
const loading = document.createElement('div');
const bg = canvas(container);
const stage = canvas(container);
const log = canvas(container);

loading.className = 'loading';
bg.center.y = stage.center.y = (bg.h / 1.5) | 0;
container.appendChild(loading);

/*----------  DATA  ----------*/
let year = 2009;
let bodies = [];
const sprites = {};
let d = [];
let geoD = [];
let dLoaded = false;
let geoLoaded = false;

/*----------  ANIMATION  ----------*/
let animReq;
let dataI = 0;
const hold = 4;
let tick = 0;

/*----------  MAP  ----------*/
const map = new Map({
  zoom: 8,
  width: stage.w,
  height: stage.h,
  center: { lon: -71.999996, lat: 4.000002 },
});

/*----------  TIME  ----------*/
let prevTimePosition = 0;

// Set dates range as ISO 8601 YYYY-MM-DDThh:mm:ss
let dIni = Date.parse(year + '/01/01 00:00:00') / 1000;
// let dEnd = Date.parse(year + 1 + '/01/01 00:00:00') / 1000;

/*----------  SPRITES  ----------*/
let imgsLoaded = 0;

bg.ctx.globalCompositeOperation = 'darken';
bg.ctx.fillStyle = 'white';

requestViolenceData();
mapReq
  .json({
    url: '../../data/geo/col-50m.json',
    container: container,
    loadingMsg: 'Loading Map Data',
    loadingEle: loading,
  })
  .then(function (data) {
    geoD = data.coordinates;
    geoLoaded = true;
  })
  .catch(function (err) {
    console.error(err);
  });

imgs.forEach((d) => {
  const sprite = new Sprite(d.options);
  sprite.img.onload = imgLoaded;
  sprite.img.src = sprite.src;
  sprites[d.key] = sprite;
});

checkAssetsLoaded();

/*----------  MENU  ----------*/
let current;
yearsMenu(2008, 2016, year, yearClickEvent, menuReady);

function yearClickEvent(event) {
  if (event.target !== current) {
    window.cancelAnimationFrame(animReq);
    loading.innerHTML = '';
    loading.style.opacity = 1;
    resetCurrent(current, event.target);
    violenceReq.abort();
    current = event.target;
    year = event.target.textContent;

    reloadStage();
  }
}

function menuReady(menu, currentFirst) {
  container.appendChild(menu);
  current = currentFirst;
}

function reloadStage() {
  dataI = 0;
  bodies = [];
  d = [];
  dLoaded = false;
  prevTimePosition = 0;
  dIni = Date.parse(year + '/01/01 00:00:00') / 1000;
  // dEnd = Date.parse(year + 1 + '/01/01 00:00:00') / 1000;

  stage.ctx.clearRect(0, 0, stage.w, stage.h);
  log.ctx.clearRect(0, 0, log.w, log.h);
  bg.ctx.clearRect(0, 0, bg.w, bg.h);

  requestViolenceData();
  checkAssetsLoaded();
}

function requestViolenceData() {
  violenceReq
    .json({
      url: '../../data/monitor/violencia-' + year + '.json',
      container: container,
      loadingMsg: 'Loading Violence Data',
      loadingEle: loading,
    })
    .then(function (res) {
      d = res.data;
      dLoaded = true;
    })
    .catch(function (err) {
      console.error(err);
    });
}

function checkAssetsLoaded() {
  if (imgsLoaded === imgs.length && dLoaded && geoLoaded) {
    drawMap();
    animate();
  } else {
    animReq = requestAnimationFrame(checkAssetsLoaded);
  }
}

function imgLoaded() {
  imgsLoaded++;
}

function drawMap() {
  const { lines } = sprites;

  for (let i = 0; i < geoD.length; i++) {
    const poly = geoD[i];

    bg.ctx.beginPath();
    for (let l = 0; l < poly.length; l++) {
      const layer = poly[l];

      for (let n = 0; n < layer.length; n++) {
        const node = layer[n];
        const coords = map.convertCoordinates(node[0], node[1]);

        bg.ctx.save();
        bg.ctx.translate(bg.center.x, bg.center.y);
        bg.ctx.drawImage(
          lines.img,
          random(0, lines.cols) * lines.fw,
          0,
          lines.fw,
          lines.fh,
          coords.x - lines.offX,
          coords.y - lines.offY,
          lines.fw,
          lines.fh
        );

        if (n === 0) {
          bg.ctx.moveTo(coords.x, coords.y);
        } else {
          bg.ctx.lineTo(coords.x, coords.y);
        }

        bg.ctx.restore();
      }
    }
    bg.ctx.closePath();

    bg.ctx.globalCompositeOperation = 'source-over';
    bg.ctx.fill();
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

// function debug() {
//   for (let i = 0; i < d.length; i++) {
//     draw(i);
//   }
// }

function draw(i) {
  const e = d[i];
  const { shadows } = sprites;
  if (e.hasOwnProperty('vTotal') && e.hasOwnProperty('cat') && e.cat.indexOf('Homicidio') >= 0) {
    const total = d[i].vTotal;
    const date = d[i].fecha.unix;
    const elapsed = ((date - dIni) / 31536000) * stage.w;

    log.ctx.beginPath();
    log.ctx.moveTo(prevTimePosition, 0);
    log.ctx.lineTo(elapsed - (elapsed - prevTimePosition) / 2, total * 3);
    log.ctx.lineTo(elapsed, 0);
    log.ctx.stroke();
    prevTimePosition = elapsed;

    if ('lon' in e && 'lat' in e) {
      const coords = map.convertCoordinates(e.lon, e.lat);
      const fx = random(0, shadows.cols);
      let fy;

      for (let t = 0; t < total; t++) {
        const seq = new Levit(sprites.levit, coords, t, stage.ctx, stage.center.x, stage.center.y);
        bodies.push(seq);
      }

      bg.ctx.save();
      bg.ctx.translate(bg.center.x, bg.center.y);

      if (total > 0 && total === 1) {
        fy = 0;
      } else if (total <= 8) {
        fy = total;
      } else {
        fy = 8;
      }
      bg.ctx.globalCompositeOperation = 'source-atop';
      bg.ctx.drawImage(
        shadows.img,
        fx * shadows.fw,
        fy * shadows.fh,
        shadows.fw,
        shadows.fh,
        coords.x - shadows.offX,
        coords.y - shadows.offY,
        shadows.fw,
        shadows.fh
      );

      bg.ctx.restore();
    }
  }

  if (bodies.length > 0) {
    stage.ctx.save();
    stage.ctx.globalCompositeOperation = 'source-over';
    stage.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    stage.ctx.fillRect(0, 0, stage.w, stage.h);
    stage.ctx.restore();
    stage.ctx.drawImage(bg.canvas, 0, 0);

    bodies.forEach((body) => {
      if (!body.finished) {
        body.draw();
      }
    });
  }
}
