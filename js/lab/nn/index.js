import { canvas, Map, random, DataRequest, yearsMenu, resetCurrent } from 'dddrawings';
import Point from './Point';
import PerlinNoise from './PerlinNoise';
import cats from './categories';

/*----------  SET STAGE  ----------*/
const container = document.getElementById('ddd-container');
const stage = canvas(container);
const timeline = canvas(container);

/*----------  GLOBALS  ----------*/
const req = new DataRequest();
const perlin = new PerlinNoise();
const map = new Map({
  center: {
    lon: -74.297313,
    lat: 4.570917
  } // Center of Colombia
});
const max = 3000;

let current = '';
let currentI = 0;
let points = [];
let timeStart = 0;
let timeEnd = 0;
let step = 0;
let animReq;
let mode = 1;
let year = 2016;
let d = {};

const img = new Image();
img.onload = () => {
  init();
  drawBG();
};
img.src = '/img/assets/backgrounds/white-paper2.jpg';

/*==================================
  =            YEARS MENU            =
  ==================================*/
function clickEvent(event) {
  if (event.target !== current) {
    window.cancelAnimationFrame(animReq);
    req.abort();
    resetCurrent(current, event.target);
    current = event.target;
    year = Number(event.target.textContent);

    mode = 1;
    clearStage();
    initValues();
    loadData();
  }
}

function menuReady(menu, first) {
  var random = document.createElement('li');
  random.innerText = 'Random';
  random.onclick = () => {
    window.cancelAnimationFrame(animReq);
    req.abort();
    clearStage();
    initValues();
    loadData();
    mode = 2;
  };
  random.style.backgroundColor = '#EDE397';
  menu.appendChild(random);
  container.appendChild(menu);
  current = first;
  loadData();
}
/*=====  End of YEARS MENU  ======*/

function init() {
  initValues();
  yearsMenu(2008, 2016, year, clickEvent, menuReady);
}

function drawBG() {
  stage.ctx.save();
  stage.ctx.globalAlpha = 1;
  stage.ctx.drawImage(img, 0, 0, 1764, 1250, 0, 0, stage.canvas.width, stage.canvas.height);
  stage.ctx.restore();
}

function initValues() {
  stage.w = timeline.w = stage.canvas.width = window.innerWidth;
  stage.h = timeline.h = timeline.canvas.height = window.innerHeight;
  stage.center.x = (stage.w / 2) | 0;
  stage.center.y = (stage.h / 2) | 0;
  stage.ctx.globalAlpha = 0.05;
  map.updateSize(stage.w, stage.h);

  points = [];
  currentI = 0;
  timeStart = Date.parse(`${year}/01/01 00:00:00`) / 1000;
  timeEnd = Date.parse(`${year + 1}/01/01 00:00:00`) / 1000;
  step = stage.w / (timeEnd - timeStart);

  drawBG();
}

function clearStage() {
  stage.ctx.clearRect(0, 0, stage.w, stage.h);
  timeline.ctx.clearRect(0, 0, timeline.w, timeline.h);
}

function animate() {
  if (currentI < d.length) {
    let amount = 0;
    let loc;

    if (mode === 1) {
      amount = d[currentI].hasOwnProperty('vTotal') ? d[currentI].vTotal : 0;
      loc = map.convertCoordinates(d[currentI].lon, d[currentI].lat);
    } else if (mode === 2) {
      amount = random(0, random(1, 50));
      loc = {
        x: random(0, stage.w) - stage.center.x,
        y: random(0, stage.h) - stage.center.y
      };
    }

    const timeEvent = d[currentI].hasOwnProperty('fecha') ? d[currentI].fecha.unix : null;
    const timeX = timeEvent - timeStart;

    perlin.setSeed(amount);

    if (amount > 0) {
      generatePoints(amount, loc.x + stage.center.x, loc.y + stage.center.y, d[currentI].cat[0]);
    }

    for (let i = points.length - 1; i > 0; i--) {
      const p = points[i];

      if (p.finished) {
        points.splice(i, 1);
      }

      p.update(perlin, stage.w, stage.h);
    }

    if (currentI === 0) {
      timeline.ctx.beginPath();
      timeline.ctx.moveTo(timeX * step, timeline.h - 2);
    }

    timeline.ctx.lineTo(timeX * step, timeline.h - 2);
    timeline.ctx.stroke();

    currentI++;

    animReq = requestAnimationFrame(animate);
  }
}

function generatePoints(amount, x, y, cat) {
  let color;

  if (mode === 1) {
    color = cats[cat];
  } else if (mode === 2) {
    const keys = Object.keys(cats);
    const randomKey = keys[random(0, keys.length)];
    color = cats[randomKey];
  }

  amount = amount < max ? amount : max;

  for (let i = 0; i < amount; i++) {
    points.push(new Point(x, y, amount + i, color, stage.ctx));
  }
}

function loadData() {
  req
    .json({
      url: `../../data/monitor/violencia-${year}.json`,
      container: container,
      loadingMsg: 'Loading data'
    })
    .then(res => {
      d = res.data;
      animate();
    })
    .catch(err => console.error(err));
}
