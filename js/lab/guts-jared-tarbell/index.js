// CREDITS
// I did not make this, just translated into JS for learning purposes
// See original code at http://www.complexification.net/gallery/machines/guts/
// Guts
// j.tarbell   April, 2005
import { canvas } from 'dddrawings';
import ColorManager from './ColorManager';
import CPath from './CPath';

const container = document.getElementById('ddd-container');
const stage = canvas(container);

/*----------  GLOBAL VARIABLES  ----------*/
const num = 11;
let cPaths = [];
let animReq;
const colors = new ColorManager();

colors.takeColor('/img/assets/nude.gif').then(() => {
  colors.initPixels(stage);
  begin();
  draw();
});

function begin() {
  for (let i = 0; i < num; i++) {
    cPaths[i] = new CPath(i, colors, stage);
  }
}

function draw() {
  for (let c = 0; c < num; c++) {
    if (cPaths[c].moveme) {
      cPaths[c].grow();
    }
  }
  stage.ctx.putImageData(colors.imgData, 0, 0);
  animReq = requestAnimationFrame(draw);
}

document.body.addEventListener('click', () => {
  colors.pixels.forEach(p => (p = 255));
  begin();
});
