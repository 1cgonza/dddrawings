// CREDITS
// I did not make this, just translated into JS for learning purposes
// See original code at http://www.complexification.net/gallery/machines/guts/
// Guts
// j.tarbell   April, 2005
import { canvas, random, HALF_PI } from 'dddrawings';
import ColorManager from './ColorManager';
import CPath from './CPath';

const container = document.getElementById('ddd-container');
const stage = canvas(container);
let stageW = stage.w;
let stageH = stage.h;
let centerX = stage.center.x;
let centerY = stage.center.y;

/*----------  GLOBAL VARIABLES  ----------*/
let goodColors = [];
const num = 11;
let cPaths = [];
let pixels;
let imgData;
let animReq;
const colors = new ColorManager();

colors.takeColor('/img/assets/nude.gif').then(colors => {
  goodColors = colors;
  init();
});

function init() {
  stage.ctx.fillStyle = '#FFF';
  stage.ctx.fillRect(0, 0, stageW, stageH);
  imgData = stage.ctx.getImageData(0, 0, stageW, stageH);
  pixels = imgData.data;

  begin();
  draw();
}

function someColor() {
  return goodColors[random(0, goodColors.length)];
}

function begin() {
  for (let i = 0; i < num; i++) {
    cPaths[i] = new CPath(i, colors, centerX, centerY, stage.h);
  }
}

function draw() {
  for (let c = 0; c < num; c++) {
    if (cPaths[c].moveme) {
      cPaths[c].grow();
    }
  }
  stage.ctx.putImageData(imgData, 0, 0);
  animReq = requestAnimationFrame(draw);
}

function setPixelColor(i, rgb, a) {
  const a1 = 1 - a;
  const r2 = pixels[i];
  const g2 = pixels[i + 1];
  const b2 = pixels[i + 2];

  // Blend painter color with existing pixel based on alpha.
  pixels[i] = rgb[0] * a + r2 * a1;
  pixels[i + 1] = rgb[1] * a + g2 * a1;
  pixels[i + 2] = rgb[2] * a + b2 * a1;
}

document.body.addEventListener('click', () => {
  pixels.forEach(p => (p = 255));
  begin();
});
