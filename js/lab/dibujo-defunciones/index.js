import UI from './UI';
import Sprite from './Sprite';
import Levit from './Levit';
import { imgs } from './imgs';

var violenceReq = new DDD.DataRequest();
// var mapReq      = new DDD.DataRequest();

/*----------  STAGE  ----------*/
var container = document.getElementById('ddd-container');
var loading = document.createElement('div');

var bg = DDD.canvas(null);
var log = DDD.canvas(container);
var papa = DDD.canvas(container);
var papaNext = DDD.canvas(container);
var papaLast = DDD.canvas(container);
var papaW;
var papaH;

var stage = DDD.canvas(container);

papa.canvas.id = 'papa';

export var assets = {};

loading.className = 'loading';
bg.center.y = stage.center.y = bg.h / 1.5 | 0;
container.appendChild(loading);

/*----------  DATA  ----------*/
export var year = 2008;
var bodies = [];
var d = [];
var geoD = [];
var dLoaded = false;
var geoLoaded = false;

/*----------  ANIMATION  ----------*/
export var animReq;
var dataI = 0;
var hold = 4;
var tick = 0;

/*----------  MAP  ----------*/
var map = new DDD.Map({
  zoom: 8,
  width: stage.w,
  height: stage.h,
  center: { lon: -71.999996, lat: 4.000002 }
});

/*----------  TIME  ----------*/
var prevTimePosition = 0;

// Set dates range as ISO 8601 YYYY-MM-DDThh:mm:ss
var dIni = Date.parse(year + '/01/01 00:00:00') / 1000;
var dEnd = Date.parse(year + 1 + '/01/01 00:00:00') / 1000;

/*----------  SPRITES  ----------*/
var imgsLoaded = 0;

/*----------  MENU  ----------*/
var ui = new UI(container, reloadStage, violenceReq);

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
  violenceReq.json({
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
  // bg.ctx.globalCompositeOperation = 'darken';
  // bg.ctx.fillStyle = 'white';

  requestViolenceData();
  // mapReq.json({
  //   url: '../../data/geo/col-50m.json',
  //   container: container,
  //   loadingMsg: 'Loading Map Data',
  //   loadingEle: loading
  // })
  // .then(function(data) {
  //   geoD = data.coordinates;
  //   geoLoaded = true;
  // })
  // .catch(function(err) {
  //   console.error(err);
  // });

  for (var i = 0; i < imgs.length; i++) {
    var sprite = new Sprite(imgs[i].options);
    sprite.img.onload = () => { imgsLoaded++; };
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
    // drawMap();
    fade();
    animate();
  } else {
    animReq = requestAnimationFrame(checkAssetsLoaded);
  }
}

// function drawMap() {
//   for (var i = 0; i < geoD.length; i++) {
//     var poly = geoD[i];

//     bg.ctx.beginPath();
//     for (var l = 0; l < poly.length; l++) {
//       var layer = poly[l];

//       for (var n = 0; n < layer.length; n++) {
//         var node = layer[n];
//         var coords = map.convertCoordinates(node[0], node[1]);

//         bg.ctx.save();
//         bg.ctx.translate(bg.center.x, bg.center.y);
//         bg.ctx.drawImage(
//           lines.img,
//           DDD.random(0, lines.cols) * lines.fw, 0,
//           lines.fw, lines.fh,
//           coords.x - lines.offX, coords.y - lines.offY,
//           lines.fw, lines.fh
//         );

//         if (n === 0) {
//           bg.ctx.moveTo(coords.x, coords.y);
//         } else {
//           bg.ctx.lineTo(coords.x, coords.y);
//         }

//         bg.ctx.restore();

//       }
//     }
//     bg.ctx.closePath();

//     bg.ctx.globalCompositeOperation = 'source-over';
//     bg.ctx.fill();
//   }
// }

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

function debug() {
  for (var i = 0; i < d.length; i++) {
    draw(i);
  }
}
var currentImage = 1;
var op = 1;

function nextImage() {
  currentImage++;

  if (currentImage >= 4) {
    currentImage = 1;
  }

  op = 1;
}

function fade() {
  var n = (currentImage + 1) % 4;
  var nextI = n % 4 === 0 ? 1 : n;
  var curr = assets['papa' + currentImage].img;
  var next = assets['papa' + nextI].img;
  op -= 0.005;
  papaLast.ctx.clearRect(0, 0, papaLast.w, papaLast.h);
  papaLast.ctx.globalAlpha = op;
  papaLast.ctx.drawImage(curr, (papa.w / 2) - (papaW / 2) - 200, (papa.h / 2) - (papaH / 2), papaW, papaH);

  papaNext.ctx.clearRect(0, 0, papaNext.w, papaNext.h);
  papaNext.ctx.globalAlpha = 1 - op;
  papaNext.ctx.drawImage(next, (papa.w / 2) - (papaW / 2) - 200, (papa.h / 2) - (papaH / 2), papaW, papaH);

  papa.ctx.clearRect(0, 0, papa.w, papa.h);
  papa.ctx.drawImage(papaLast.canvas, 0, 0);
  papa.ctx.drawImage(papaNext.canvas, 0, 0);

  if (op <= 0) {
    nextImage();
  }

  animReq = requestAnimationFrame(fade);
}



function draw(i) {
  var e = d[i];

  if (e.hasOwnProperty('vTotal') && e.hasOwnProperty('cat') && e.cat.indexOf('Homicidio') >= 0) {
    var total = d[i].vTotal;
    // var date = d[i].fecha.unix;
    // var elapsed = ((date - dIni) / 31536000) * stage.w;

    // log.ctx.beginPath();
    // log.ctx.moveTo(prevTimePosition, 0);
    // log.ctx.lineTo(elapsed - (elapsed - prevTimePosition) / 2, total * 3);
    // log.ctx.lineTo(elapsed, 0);
    // log.ctx.stroke();
    // prevTimePosition = elapsed;

    if ('lon' in e && 'lat' in e) {
      var coords = map.convertCoordinates(e.lon, e.lat);
      //var fx = DDD.random(0, shadows.cols);
      //var fy;

      for (var t = 0; t < total; t++) {
        bodies.push(new Levit(bg, coords, t));
      }

      // bg.ctx.save();
      // bg.ctx.translate(bg.center.x, bg.center.y);

      // if (total > 0 && total === 1) {
      //   fy = 0;
      // } else if (total <= 8) {
      //   fy = total;
      // } else {
      //   fy = 8;
      // }
      // bg.ctx.globalCompositeOperation = 'source-atop';
      // bg.ctx.drawImage(
      //   shadows.img,
      //   fx * shadows.fw, fy * shadows.fh,
      //   shadows.fw, shadows.fh,
      //   coords.x - shadows.offX, coords.y - shadows.offY,
      //   shadows.fw, shadows.fh
      // );

      // bg.ctx.restore();
    }
  }

  if (bodies.length > 0) {
    bg.ctx.clearRect(0, 0, stage.w, stage.h);

    for (var n = 0; n < bodies.length; n++) {
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
