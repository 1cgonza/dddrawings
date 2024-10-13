// CREDITS
// I did not make this, just translated from Processing to JS for learning purposes
// See original code at http://www.complexification.net/gallery/machines/bubblechamber/
// Bubble Chamber
// j.tarbell   October, 2003
// Albuquerque, New Mexico
// complexification.net

// a generative painting system using random collisions of
// four unique orbit decaying particle types.

import { canvas, random, TWO_PI } from 'dddrawings';
import Muon from './Muon.js';
import Quark from './Quark.js';
import Hadron from './Hadron.js';
import Axion from './Axion.js';
/*----------  GLOBALS  ----------*/
// particle proportions
const maxMuon = 1789;
const maxQuark = 1300;
const maxHadron = 1000;
const maxAxion = 111;

// angle of collision (usually calculated with mouse position)
let collisionTheta;

// discrete universe of particles?
let muon = [];
let quark = [];
let hadron = [];
let axion = [];

/*----------  CREATE CANVAS  ----------*/
const stage = canvas(document.getElementById('ddd-container'));
let stageW = stage.w;
let stageH = stage.h;
let centerX = stage.center.x | 0;
let centerY = stage.center.y | 0;
stage.ctx.fillStyle = '#FFF';
stage.ctx.fillRect(0, 0, stageW, stageH);
let imgData = stage.ctx.getImageData(0, 0, stageW, stageH);
let pixels = imgData.data;

// instantiate universe of particles
for (let i = 0; i < maxAxion; i++) {
  axion[i] = new Axion(centerX, centerY, stageW, setPixelColor);
}

for (let ii = 0; ii < maxHadron; ii++) {
  hadron[ii] = new Hadron(centerX, centerY, stageW, stageH, setPixelColor);
}

for (let j = 0; j < maxQuark; j++) {
  quark[j] = new Quark(0, 0, centerX, centerY, stageW, stageH, setPixelColor);
}

for (let jj = 0; jj < maxMuon; jj++) {
  muon[jj] = new Muon(centerX, centerY, stageW, stageH, setPixelColor);
}

collideAll();
draw();

function draw() {
  // initial collision event has occured, ok to move the particles...
  // allow each particle in the universe one step
  for (let i = 0; i < hadron.length; i++) {
    hadron[i].move();
  }

  for (let ii = 0; ii < muon.length; ii++) {
    muon[ii].move();
  }

  for (let j = 0; j < quark.length; j++) {
    quark[j].move();
  }

  for (let jj = 0; jj < axion.length; jj++) {
    axion[jj].move();
  }

  stage.ctx.putImageData(imgData, 0, 0);
  requestAnimationFrame(draw);
}

function collideOne(event) {
  // eject a single particle, relative to position position
  let t;

  collisionTheta = Math.atan2(centerX - event.clientX, centerY / 2 - event.clientY);

  for (let i = 0; i < maxMuon; i++) {
    muon[i].updateCollisionTheta(collisionTheta);
  }

  for (let i = 0; i < maxQuark; i++) {
    quark[i].updateCollisionTheta(collisionTheta);
  }

  // choose a set of hadron particles to recollide
  if (hadron.length > 0) {
    t = random(0, hadron.length);
    hadron[t].collide();
  }

  // choose a set of quark particles to recollide
  if (quark.length > 0) {
    t = random(0, quark.length);
    quark[t].collide();
  }

  // choose a set of muon particles to recollide
  if (muon.length > 0) {
    t = random(0, muon.length);
    muon[t].collide();
  }

  // choose a set of axion particles to recollide
  if (axion.length > 0) {
    t = random(0, axion.length);
    axion[t].collide();
  }
}

function collideAll() {
  // random collision angle
  collisionTheta = random(0, TWO_PI, true);

  for (let i = 0; i < maxMuon; i++) {
    muon[i].updateCollisionTheta(collisionTheta);
  }

  for (let i = 0; i < maxQuark; i++) {
    quark[i].updateCollisionTheta(collisionTheta);
  }

  // particle super collision
  if (hadron.length > 0) {
    for (let i = 0; i < maxHadron; i++) {
      hadron[i].collide();
    }
  }

  if (quark.length > 0) {
    for (let ii = 0; ii < maxQuark; ii++) {
      quark[ii].collide();
    }
  }

  if (muon.length > 0) {
    for (let j = 0; j < maxMuon; j++) {
      muon[j].collide();
    }
  }

  if (axion.length > 0) {
    for (let jj = 0; jj < maxAxion; jj++) {
      axion[jj].collide();
    }
  }
}

function setPixelColor(i, rgb, a) {
  const a1 = 1 - a;
  const r2 = pixels[i];
  const g2 = pixels[i + 1];
  const b2 = pixels[i + 2];

  pixels[i] = rgb[0] * a + r2 * a1;
  pixels[i + 1] = rgb[1] * a + g2 * a1;
  pixels[i + 2] = rgb[2] * a + b2 * a1;
}

document.body.addEventListener('click', function (e) {
  // fire 11 of each particle type
  for (let k = 0; k < 11; k++) {
    collideOne(event);
  }
});

window.addEventListener('keyup', function (e) {
  if (event.keyCode === 32) {
    const n = pixels.length;

    for (let i = 0; i < n; i++) {
      pixels[i] = 255;
    }
    collideAll();
  }
});
