import { canvas, Transform, TWO_PI, PI } from 'dddrawings';

/*----------  SET STAGE  ----------*/
const container = document.getElementById('ddd-container');
const bg = canvas(container);
const stage = canvas(container);
const ctx = stage.ctx;

bg.ctx.fillStyle = '#F0E397';
bg.ctx.fillRect(0, 0, bg.w, bg.h);
bg.ctx.fillStyle = '#AC5441';
ctx.strokeStyle = '#F12E2A';

/*----------  GLOBAL VARIABLES  ----------*/
const t = new Transform();
const date = new Date();
const secRadius = (stage.h / 3.2) | 0;
const minRadius = (stage.h / 2.8) | 0;
const hRadius = (stage.h / 2.4) | 0;
const angleIncrement = (0.54 * Math.PI) / 180; // 1 turns
const outerRad = stage.h * 0.3;
const offY = outerRad / 4;
const years = date.getUTCFullYear() - 1984;
const months = date.getUTCMonth() + 1;
const yearsCoords = {
  x: (stage.center.x - stage.center.x / 2) | 0,
  y: (stage.center.y - stage.center.y / 2) | 0,
};
const monthsCoords = {
  x: (stage.center.x + stage.center.x / 2) | 0,
  y: (stage.center.y + stage.center.y / 2) | 0,
};
const daysCoords = {
  x: (stage.center.x + stage.center.x / 1.5) | 0,
  y: (stage.center.y - stage.center.y / 1.5) | 0,
};
let t1000 = [];
let t60 = [];
let t24 = [];

createBackground();
animate();

function animate() {
  const d = new Date(); // Return date in UTC
  const ms = d.getMilliseconds();
  const sec = d.getSeconds();
  const min = d.getMinutes();
  const h = d.getHours();

  msClockSpiral(ms, sec, min, h);
  requestAnimationFrame(animate);
}

function msClockSpiral(ms, sec, min, h) {
  /*----------  CLEAR CANVAS  ----------*/
  t.reset();
  setTransformOnCtx(t.m);
  ctx.clearRect(0, 0, stage.w, stage.h);

  /*----------  INIT PATH  ----------*/
  ctx.beginPath();

  /*----------  MOVE TO CENTER  ----------*/
  ctx.moveTo(stage.center.x, stage.center.y + offY);

  /*----------  MILLISECONDS  ----------*/
  setTransformOnCtx(t1000[ms]);
  ctx.lineTo(0, 0);

  /*----------  SECONDS  ----------*/
  setTransformOnCtx(t60[sec]);
  ctx.lineTo(0.5, -secRadius);

  /*----------  MINUTES  ----------*/
  setTransformOnCtx(t60[min]);
  ctx.lineTo(0.5, -minRadius);

  /*----------  HOURS  ----------*/
  setTransformOnCtx(t24[h]);
  ctx.lineTo(0.5, -hRadius);

  t.reset();
  setTransformOnCtx(t.m);

  /*----------  DAYS  ----------*/
  ctx.lineTo(daysCoords.x, daysCoords.y);

  /*----------  MONTHS  ----------*/
  ctx.lineTo(monthsCoords.x, monthsCoords.y);

  /*----------  YEARS  ----------*/
  ctx.lineTo(yearsCoords.x, yearsCoords.y);

  /*----------  DRAW LINE  ----------*/
  // Finally draw the lines.
  ctx.stroke();
}

function setTransformOnCtx(tr) {
  ctx.setTransform(tr[0], tr[1], tr[2], tr[3], tr[4], tr[5]);
}

function createBackground() {
  let count = 0;
  drawYears();
  drawMonths();
  drawDays();

  while (count < 1000) {
    saveTransforms(count);
    count++;
  }
}

function saveTransforms(value) {
  if (value < 24) {
    t.reset();
    t.translateAndRotate(stage.center.x, stage.center.y, (value * 15 * PI) / 180);
    t24[value] = getCurrentTranforms();
    drawCircle(hRadius, 3, value);
  }

  if (value < 60) {
    t.reset();
    t.translateAndRotate(stage.center.x, stage.center.y, (value * 6 * PI) / 180);
    t60[value] = getCurrentTranforms();
    drawCircle(secRadius, 1, value);
    drawCircle(minRadius, 2, value);
  }

  t.reset();

  const newValue = value > 500 ? value - 1000 : value;
  const ratio = newValue / 500;
  const angle = newValue * angleIncrement;
  const spiralRad = ratio * outerRad;
  const x = stage.center.x + Math.cos(angle) * spiralRad;
  const y = stage.center.y + Math.sin(angle) * spiralRad;

  t.translate(x, y + offY);
  t1000[value] = getCurrentTranforms();
  drawMs();
}

function getCurrentTranforms() {
  return [t.m[0], t.m[1], t.m[2], t.m[3], t.m[4], t.m[5]];
}

function drawCircle(radius, size, value) {
  bg.ctx.setTransform(t.m[0], t.m[1], t.m[2], t.m[3], t.m[4], t.m[5]);
  bg.ctx.fillRect(0, -radius, size, size);
  // debug points
  // bg.ctx.strokeText(value, 0, -radius);
}

function drawMs() {
  bg.ctx.setTransform(t.m[0], t.m[1], t.m[2], t.m[3], t.m[4], t.m[5]);
  bg.ctx.fillRect(0, 0, 1, 1);
}

function drawYears() {
  bg.ctx.save();
  bg.ctx.translate(yearsCoords.x, yearsCoords.y);

  for (let y = 0; y < years; y++) {
    for (let s = 0; s < 111; s++) {
      bg.ctx.rotate(((s + y) * PI) / 180);
      bg.ctx.fillRect((s + y) | 0, 0, 1, 1);
    }
  }
  bg.ctx.restore();
}

function drawMonths() {
  bg.ctx.save();
  bg.ctx.translate(monthsCoords.x, monthsCoords.y);
  for (let i = 1; i < 24; i++) {
    for (let j = 0; j < months; j++) {
      bg.ctx.rotate((i * PI) / 180);
      bg.ctx.fillRect(i * j, 0, 1.5, 1.5);
    }
  }
  bg.ctx.restore();
}

function drawDays() {
  for (let i = 1; i < 100; i++) {
    const x = 30 * Math.sin(TWO_PI / i) + daysCoords.x;
    const y = 30 * Math.cos(TWO_PI / i) + daysCoords.y;
    bg.ctx.fillRect(x, y, 1, 1);
  }
}
