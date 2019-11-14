import { canvas, json } from 'dddrawings';
import Beat from './Beat';

const container = document.getElementById('ddd-container');
container.style.color = 'white';
document.body.style.backgroundColor = 'black';

/*----------  GLOBAL VARIABLES  ----------*/
const minMaxValues = {
  raw: { min: 100000, max: 0 },
  beat: { min: 100000, max: 0 }
};
let rawData = [];
let uniqueBeatValues = [];
let beats = [];
let beatsGrid = {};
let di = 0;
let rStep = 0;
let xStep = 0;
let rowsNet = 6;
let co = 1;
let animReq;

/*----------  CREATE CANVAS  ----------*/
const stage = canvas(container);
const grid = canvas(container);
const base = canvas(container);
const offT = canvas(null);

grid.ctx.fillStyle = 'rgba(255, 89, 237, 1)';
grid.ctx.strokeStyle = 'rgba(255, 89, 237, 0.1)';
base.ctx.strokeStyle = 'rgba(255, 236, 37, 0.05)';
stage.ctx.strokeStyle = 'rgba(255, 236, 37, 1)';
base.ctx.fillStyle = 'rgba(255, 89, 237, 1)';
grid.ctx.globalCompositeOperation = 'darken';

json({
  url: '../../data/pulse/heart.2.json',
  container: container,
  loadingMsg: 'Loading Pulse Data'
})
  .then(processData)
  .catch(err => console.error(err));

function processData(data) {
  for (let i = 0; i < data.beats.length / 3; i++) {
    const point = data.beats[i];
    const value = Number(point.substr(1));

    if (point.charAt(0) === 'B') {
      rawData.push({ bpm: value });

      checkMinMax(value, 'beat');
      newArrayBeats(value);
    }
  }
  rStep = 360 / rawData.length;
  xStep = stage.w / rawData.length;

  for (let y = 0; y < rowsNet; y++) {
    for (let x = 0; x < uniqueBeatValues.length / rowsNet; x++) {
      const gxStep = stage.w / (uniqueBeatValues.length / rowsNet);
      const gyStep = stage.h / rowsNet;
      const cx = x * gxStep + gxStep / 2;
      const cy = y * gyStep + gyStep / 2;
      const key = (uniqueBeatValues.length / rowsNet - 1) * y + (y + x);

      beats[uniqueBeatValues[key]] = new Beat(cx, cy, grid.ctx);
      beatsGrid[uniqueBeatValues[key]] = { x: cx, y: cy };
    }
  }

  // Init timeline
  drawTimeline();
}

function newArrayBeats(value) {
  const alreadyExists = uniqueBeatValues.some(element => element === value);

  if (!alreadyExists) {
    uniqueBeatValues.push(value);
  }

  uniqueBeatValues.sort(sortNumber);
}

function sortNumber(a, b) {
  return a - b;
}

function checkMinMax(value, type) {
  if (value < minMaxValues[type].min) {
    minMaxValues[type].min = value;
  }

  if (value > minMaxValues[type].max) {
    minMaxValues[type].max = value;
  }
}

function drawTimeline() {
  rawData.forEach((d, i) => {
    drawHorizNode(d.bpm, i, base.ctx);
    drawRadialNode(d.bpm, i, base.ctx);
    // drawNetwork(i);
  });

  for (let b in beatsGrid) {
    base.ctx.fillRect(beatsGrid[b].x, beatsGrid[b].y, 3, 3);
  }

  animReq = requestAnimationFrame(animateTimeline);
}

function drawHorizNode(val, i, ctx) {
  const x = i * xStep;
  ctx.beginPath();
  ctx.moveTo(x, stage.h);
  ctx.lineTo(x, stage.h - val);
  ctx.stroke();
}

function drawRadialNode(val, i, ctx) {
  const r = i * rStep;
  ctx.save();
  ctx.translate(stage.center.x, stage.center.y / 2);
  ctx.rotate((r * Math.PI) / 180);
  ctx.moveTo(0, -50);
  ctx.lineTo(0, -50 - val);
  ctx.stroke();
  ctx.restore();
}

function drawNetwork(i) {
  const key = rawData[i].bpm;
  beats[key].draw(di, rStep);
}

function animateTimeline() {
  if (di < rawData.length) {
    drawHorizNode(rawData[di].bpm, di, stage.ctx);
    drawRadialNode(rawData[di].bpm, di, stage.ctx);
    drawNetwork(di);

    di++;
    animReq = requestAnimationFrame(animateTimeline);
  } else {
    co -= 0.01;
    offT.ctx.clearRect(0, 0, stage.w, stage.h);
    offT.ctx.globalAlpha = co;
    offT.ctx.drawImage(stage.canvas, 0, 0, stage.w, stage.h);
    offT.ctx.drawImage(grid.canvas, 0, 0, stage.w, stage.h);
    stage.ctx.clearRect(0, 0, stage.w, stage.h);
    stage.ctx.drawImage(offT.canvas, 0, 0, stage.w, stage.h);
    grid.ctx.clearRect(0, 0, stage.w, stage.h);

    if (co <= 0.5) {
      di = 0;
      co = 1;
    }
    animReq = requestAnimationFrame(animateTimeline);
  }
}
