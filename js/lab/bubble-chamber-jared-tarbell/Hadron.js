// Hadron particle
// hadrons collide from totally random directions.
// those hadrons that do not exit the drawing area,
// tend to stabilize into perfect circular orbits.
// each hadron draws with a slight glowing emboss.
// the hadron itself is not drawn.

import { random, hexToRgb, convertAlpha, TWO_PI } from 'dddrawings';

export default class Hadron {
  constructor(x, y, stageW, stageH, setPixelColor) {
    this.x = x;
    this.y = y;
    this.centerX = x;
    this.centerY = y;
    this.stageW = stageW;
    this.stageH = stageH;
    this.setPixelColor = setPixelColor;
  }

  collide() {
    // initialize all parameters with random collision
    this.x = this.centerX;
    this.y = this.centerY;
    this.theta = random(0, TWO_PI, true);
    this.speed = random(0.5, 3.5, true);

    this.speedD = random(0.996, 1.001, true);
    this.thetaD = 0;
    this.thetaDD = 0;

    // rate of orbit decay
    while (Math.abs(this.thetaDD) < 0.00001) {
      this.thetaDD = random(-0.001, 0.001, true);
    }

    this.myc = hexToRgb('#00FF00');
  }

  move() {
    // the particle itself is unseen, not drawn
    // instead, draw shadow emboss
    const _x = this.x | 0;
    const _y = this.y | 0;
    const color1 = [255, 255, 255];
    const color2 = [0, 0, 0];
    const a = convertAlpha(28);

    // lighten pixel above hadron
    const _i1 = ((_y - 1) * this.stageW + _x) * 4;
    this.setPixelColor(_i1, color1, a);

    // darken pixel below
    const _i2 = ((_y + 1) * this.stageW + _x) * 4;
    this.setPixelColor(_i2, color2, a);

    // move
    this.x += this.speed * Math.sin(this.theta);
    this.y += this.speed * Math.cos(this.theta);

    // modify spin
    this.theta += this.thetaD;
    this.thetaD += this.thetaDD;

    // modify speed
    this.speed *= this.speedD;

    // random chance of subcollision event
    if (random(0, 1000) > 997) {
      // stablize orbit
      this.speedD = 1.0;
      this.thetaDD = 0.00001;
      if (random(0, 100) > 70) {
        // recollide
        this.x = this.centerX;
        this.y = this.centerY;
        this.collide();
      }
    }

    // do not allow particle to enter extreme offscreen areas
    if (this.x < -this.stageW || this.x > this.stageH * 2 || this.y < -this.stageH || this.y > this.stageH * 2) {
      this.collide();
    }
  }
}
