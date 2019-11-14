import { canvas, random } from 'dddrawings';
import ColorManager from './ColorManager';
import Crack from './Crack';

/*----------  SET STAGE  ----------*/
const stage = canvas(document.getElementById('ddd-container'));

/*----------  GLOBALS  ----------*/
const colors = new ColorManager();
const maxNum = 200;
let stageW = window.innerWidth;
let stageH = window.innerHeight;
let num = 0;
let cracks = [];

colors.takeColor('/img/assets/pollockShimmering.gif').then(() => {
  const totalPixels = stageW * stageH;

  colors.initPixels(stage);

  for (let i = 0; i < totalPixels * 4; i++) {
    colors.pixels[i] = 255;
  }

  for (let i = 0; i < totalPixels; i++) {
    colors.cGrid[i] = 10001;
  }

  for (let k = 0; k < 16; k++) {
    const c = random(0, totalPixels - 1);
    colors.cGrid[c] = random(0, 360);
  }

  for (let k = 0; k < 3; k++) {
    makeCrack();
  }

  draw();
});

function draw() {
  for (let n = 0; n < num; n++) cracks[n].move();
  stage.ctx.putImageData(colors.imgData, 0, 0);
  requestAnimationFrame(draw);
}

function makeCrack() {
  if (num < maxNum) {
    cracks[num] = new Crack(colors, stageW, stageH, makeCrack);
    num++;
  }
}
