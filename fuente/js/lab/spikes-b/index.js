import { canvas, DataRequest, json, resetCurrent, yearsMenu, random } from 'dddrawings';

var Muertos = {
  url: '/img/sprites/Muertos_10x2-1873x400-1.png',
  width: 1873,
  height: 400,
  frames: [
    { x: 0, y: 0, w: 187, h: 200 },
    { x: 187, y: 0, w: 187, h: 200 },
    { x: 374, y: 0, w: 187, h: 200 },
    { x: 561, y: 0, w: 187, h: 200 },
    { x: 748, y: 0, w: 187, h: 200 },
    { x: 935, y: 0, w: 187, h: 200 },
    { x: 1122, y: 0, w: 187, h: 200 },
    { x: 1309, y: 0, w: 187, h: 200 },
    { x: 1496, y: 0, w: 187, h: 200 },
    { x: 1683, y: 0, w: 187, h: 200 },
    { x: 0, y: 200, w: 187, h: 200 },
    { x: 187, y: 200, w: 187, h: 200 },
    { x: 374, y: 200, w: 187, h: 200 },
    { x: 561, y: 200, w: 187, h: 200 },
    { x: 748, y: 200, w: 187, h: 200 },
    { x: 935, y: 200, w: 187, h: 200 },
    { x: 1122, y: 200, w: 187, h: 200 },
    { x: 1309, y: 200, w: 187, h: 200 },
    { x: 1496, y: 200, w: 187, h: 200 },
    { x: 1683, y: 200, w: 187, h: 200 },
  ],
};

var tintasv1 = {
  url: '/img/sprites/Flexibles_9x1-206x100-1.png',
  width: 206,
  height: 100,
  frames: [
    { x: 0, y: 0, w: 22, h: 100 },
    { x: 22, y: 0, w: 22, h: 100 },
    { x: 44, y: 0, w: 22, h: 100 },
    { x: 66, y: 0, w: 22, h: 100 },
    { x: 88, y: 0, w: 22, h: 100 },
    { x: 110, y: 0, w: 22, h: 100 },
    { x: 132, y: 0, w: 22, h: 100 },
    { x: 154, y: 0, w: 22, h: 100 },
    { x: 176, y: 0, w: 22, h: 100 },
  ],
};

var tintasv1 = {
  url: '/img/sprites/Prueba2_10x1-1020x162-2.png',
  width: 1020,
  height: 162,
  frames: [
    { x: 0, y: 0, w: 102, h: 162 },
    { x: 102, y: 0, w: 102, h: 162 },
    { x: 204, y: 0, w: 102, h: 162 },
    { x: 306, y: 0, w: 102, h: 162 },
    { x: 408, y: 0, w: 102, h: 162 },
    { x: 510, y: 0, w: 102, h: 162 },
    { x: 612, y: 0, w: 102, h: 162 },
    { x: 714, y: 0, w: 102, h: 162 },
    { x: 816, y: 0, w: 102, h: 162 },
    { x: 918, y: 0, w: 102, h: 162 },
  ],
};

var animReq;

var framesLen = tintasv1.frames.length;

/*----------  SET STAGE  ----------*/
var container = document.getElementById('ddd-container');
var stage = canvas(container);
var ctx = stage.ctx;
var req = new DataRequest();
var year = 1993;

/*----------  GLOBALS  ----------*/
var current;
var stageW;
var stageH;
var centerX;
var centerY;
var seismicData = [];
var seismicDataI = 0;
var taData = [];
var taDataI = 0;
var taDataLoaded = false;
var seismicDataLoaded = false;
var taTime;
var img = new Image();
var img2 = new Image();
var fondo = new Image();

var rad = 100;
var count = 0;
var ratio = 2;
var newW = tintasv1.frames[0].w / ratio;
var newH = tintasv1.frames[0].h / ratio;
var x1 = newW / 2;
var y1 = newH / 3;
var stepY = -rad - newH + y1;

function resize() {
  stageW = stage.canvas = window.innerWidth;
  stageH = stage.canvas = window.innerHeight;
  centerX = (stageW / 2) | 0;
  centerY = (stageH / 2) | 0;
}

img.onload = function () {
  img2.onload = function () {
    fondo.onload = init;
    fondo.src = '/img/backgrounds/white-paper2.jpg';
  };
  img2.src = Muertos.url;
};
img.src = tintasv1.url;

function clickEvent(event) {
  if (event.target !== current) {
    req.abort();
    resetCurrent(current, event.target);
    current = event.target;
    year = +event.target.textContent;
    loadData();
  }
}

function menuReady(menu, first) {
  container.appendChild(menu);
  current = first;
  loadData();
}

function loadData() {
  seismicData = [];
  ctx.clearRect(0, 0, stageW, stageH);
  resize();

  req
    .json({
      url: '../../data/ingeominas/eq' + year + '.json',
      container: container,
      loadingMsg: 'Loading Seismic Data',
    })
    .then(function (d) {
      seismicData = d;
      seismicDataI = 0;
      seismicDataLoaded = true;

      if (taDataLoaded) {
        render();
      }
    })
    .catch(function (err) {
      console.error(err);
    });

  if (!taDataLoaded) {
    json({
      url: '../../data/cmh/AtentadosTerroristas1988-2012.json',
      container: container,
      loadingMsg: 'Loading Violence Data',
    })
      .then(function (d) {
        taData = d;
        taDataLoaded = true;
        getFirstAttackOfYear();

        if (seismicDataLoaded) {
          render();
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  } else {
    taDataI = 0;
    getFirstAttackOfYear();
  }
}

function init() {
  yearsMenu(1993, 2015, year, clickEvent, menuReady);
}

function getFirstAttackOfYear() {
  var yearStart = Date.parse(year) / 1000;
  var dLength = taData.length;
  var i;

  for (i = 0; i < dLength; i++) {
    if (taData[i].date.unix >= yearStart) {
      taDataI = i;
      taTime = taData[i].date.unix;
      break;
    }
  }
}

function drawFloats(n, num) {
  if (n < 4) {
    stepY = -rad + newH - y1;
  }
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < framesLen; j++) {
      var step = i * (y1 * framesLen);
      var frame = tintasv1.frames[random(0, framesLen)];
      // ctx.rect(-x1, stepY - (j * y1) - step, newW, newH);
      if (n < 5) {
        ctx.drawImage(img, frame.x, 0, frame.w, frame.h, -x1, stepY - j * y1 + step, newW, newH);
      } else {
        ctx.drawImage(img, frame.x, 0, frame.w, frame.h, -x1, stepY + j * y1 - step, newW, newH);
      }
    }
  }
}

function render() {
  var len = seismicData.length;
  var step = stageW / len;
  var stepR = (Math.PI * 2) / len;

  ctx.drawImage(fondo, 0, 0, stageW, stageH);
  ctx.globalCompositeOperation = 'darken';
  ctx.globalAlpha = 0.8;

  function move(i) {
    var event = seismicData[i];
    var currTime = event.date.unix;
    var r = i * stepR;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(r);

    if (taTime && currTime >= taTime) {
      var taEvent = taData[taDataI];
      var fatal = taEvent.hasOwnProperty('fatal') ? taEvent.fatal : 0;
      var injured = taEvent.hasOwnProperty('injured') ? taEvent.injured : 0;
      var frameI = 0;
      var frameI = Muertos.frames[frameI + 10];
      var frameCenterX = Muertos.frames[0].w / 2;
      var frameCenterY = Muertos.frames[0].h / 2;

      for (var f = 0; f < fatal; f++) {
        var frameF = Muertos.frames[random(0, 9)];
        ctx.drawImage(
          img2,
          frameF.x,
          0,
          frameF.w,
          frameF.h,
          -frameCenterX,
          -rad - frameCenterY - f * (frameF.h / 10),
          frameF.w,
          frameF.h
        );
      }

      for (var ii = 0; ii < injured; ii++) {
        var frameII = Muertos.frames[random(10, 20)];
        ctx.drawImage(
          img2,
          frameII.x,
          frameII.y,
          frameII.w,
          frameII.h,
          -frameCenterX,
          -rad - frameCenterY - ii * (frameII.h / 300),
          frameII.w,
          frameII.h
        );
      }

      if (taDataI < taData.length - 1) {
        taDataI++;
        taTime = taEvent.date.unix;
      } else {
        taTime = false;
      }
    }

    if (event.hasOwnProperty('ml')) {
      var ml = event.ml;
      ml = Math.pow(2, ml) / 2;

      function aggregate() {
        var int = Math.floor(ml);
        var float = +(ml % 1).toFixed(1).slice(-1);

        if (int < 1) {
          drawFloats(1, float);
        } else {
          drawFloats(int, float);
        }
      }

      function stretch() {
        var frame = tintasv1.frames[random(0, framesLen)];

        if (ml < 5) {
          ctx.rotate(r - Math.PI);
          ctx.drawImage(img, frame.x, 0, frame.w, frame.h, -x1, rad - y1, newW, -newH * (ml / 4));
        } else {
          ctx.rotate(r);
          ctx.drawImage(img, frame.x, 0, frame.w, frame.h, -x1, -rad + y1 + 50, newW, -newH * (ml / 4));
        }
      }

      // aggregate();
      stretch();

      ctx.restore();
    }
  }

  function renderAll() {
    for (var i = 0; i < len; i++) {
      move(i);
    }
  }

  function animate() {
    count++;

    if (count < len) {
      move(count);
      animReq = requestAnimationFrame(animate);
    } else {
      console.log('end');
    }
  }
  // animate();
  renderAll();
}
