/**
 * I found McDonald's work to be unique in the way that a simple interaction seem to create a tactile experience.
 * At the same time, the abstract render suggests to me a responsive simulation of a living system with "emotions".
 * As the title suggests, he was aiming for "empathy".
 * To learn how he did this, I translated the code he originally created on Processing into JavScript.
 * All credits go to Kyle McDonald.
 * See the original source code: http://www.openprocessing.org/sketch/1182
 * and more of his work at http://kylemcdonald.net/
 */

import { canvas, random, PI } from 'dddrawings';

/*----------  SET STAGE  ----------*/
const stage = canvas(document.getElementById('ddd-container'));
let stageW;
let stageH;
let centerX;
let centerY;

/*----------  GLOBALS  ----------*/
let animReq;
let n;
let bd;
let pmouseX = 0;
let pmouseY = 0;
let mouseX = 0;
let mouseY = 0;

const sp = 0.001;
const sl = 0.97;
let all = [];

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.s = 0;
    this.c = 0;
  }

  sense() {
    if (pmouseX !== 0 || pmouseY !== 0) {
      this.s +=
        (sp * this.det(this.x, this.y, pmouseX, pmouseY, mouseX, mouseY)) /
        (this.dist(this.x, this.y, mouseX, mouseY) + 1);
    }
    this.s *= sl;
    this.c += this.s;

    const d = bd * this.s + 0.001;

    stage.ctx.beginPath();
    stage.ctx.moveTo(this.x, this.y);
    stage.ctx.lineTo(this.x + d * Math.cos(this.c), this.y + d * Math.sin(this.c));
    stage.ctx.stroke();
  }

  det(x1, y1, x2, y2, x3, y3) {
    return (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1);
  }

  dist(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }
}

function init() {
  for (let i = 0; i < n; i++) {
    const a = i + random(0, PI / 9, true);
    const r = (i / n) * centerY * (((n - i) / n) * 3.3) + random(-3, 3, true) + 3;
    all.push(new Cell(r * Math.cos(a) + centerX, r * Math.sin(a) + centerY));
  }
  // console.log(cells);
  animReq = requestAnimationFrame(animate);
}

function animate() {
  stage.ctx.clearRect(0, 0, stageW, stageH);
  for (let i = n - 1; i >= 0; i--) {
    all[i].sense();
  }
  pmouseX = mouseX;
  pmouseY = mouseY;
  animReq = requestAnimationFrame(animate);
}

document.onmousemove = (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  return false;
};

document.body.onclick = () => {
  for (let i = n - 1; i >= 0; i--) {
    all[i].c = 0;
  }
};

function resize() {
  window.cancelAnimationFrame(animReq);
  stageW = window.innerWidth;
  stageH = window.innerHeight;
  centerX = (stageW / 2) | 0;
  centerY = (stageH / 2) | 0;
  stage.canvas.width = stageW;
  stage.canvas.height = stageH;
  stage.ctx.strokeStyle = 'rgba(0, 0, 0, 0.14)';

  n = stageW * 5;
  bd = stageH / 4;
  all = [];
  init();
}

window.onresize = resize;

resize();
