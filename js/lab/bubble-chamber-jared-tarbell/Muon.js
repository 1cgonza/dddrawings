// Muon particle
//   the muon is a colorful particle with an entangled friend.
//   draws both itself and its horizontally symmetric partner.
//   a high range of speed and almost no speed decay allow the
//   muon to reach the extents of the window, often forming rings
//   where theta has decayed but speed remains stable.  result
//   is color almost everywhere in the general direction of collision,
//   stabilized into fuzzy rings.

import { random, convertAlpha, TWO_PI } from 'dddrawings'
import goodcolor from './goodColors'

export default class Muon {
  constructor(x, y, stageW, stageH, setPixelColor) {
    this.x = x
    this.y = y
    this.centerX = x
    this.centerY = y
    this.stageW = stageW
    this.stageH = stageH
    this.myc = goodcolor[0]
    this.mya = goodcolor[goodcolor.length - 1]
    this.collisionTheta = 0
    this.setPixelColor = setPixelColor
  }

  collide() {
    // initialize all parameters
    this.x = this.centerX
    this.y = this.centerY
    this.speed = random(2, 32)
    this.speedD = random(0.0001, 0.001, true)

    // rotation
    this.theta = this.collisionTheta + random(-0.1, 0.1, true)
    this.thetaD = 0
    this.thetaDD = 0

    // ensure that there IS decay
    while (Math.abs(this.thetaDD) < 0.001) {
      // rate of orbit decay
      this.thetaDD = random(-0.1, 0.1, true)
    }

    // color is determined by direction of movement
    const c = (((goodcolor.length - 1) * (this.theta + Math.PI)) / TWO_PI) | 0
    if (c >= goodcolor.length || c < 0) {
      // SAFETY: this is giving me problems
      // println("whoa: "+c);
    } else {
      this.myc = goodcolor[c]
      // anti-particle color
      this.mya = goodcolor[goodcolor.length - c - 1]
    }
  }

  move() {
    const _x = this.x | 0
    const _y = this.y | 0
    var a = convertAlpha(42)

    // draw
    const _i1 = (_y * this.stageW + _x) * 4
    this.setPixelColor(_i1, this.myc, a)
    // draw anti-particle
    const _i2 = (_y * this.stageW + (this.stageW - _x)) * 4
    this.setPixelColor(_i2, this.mya, a)

    // move
    this.x += this.speed * Math.sin(this.theta)
    this.y += this.speed * Math.cos(this.theta)

    // rotate
    this.theta += this.thetaD

    // modify spin
    this.thetaD += this.thetaDD

    // modify speed
    this.speed -= this.speedD

    // do not allow particle to enter extreme offscreen areas
    if (
      this.x < -this.stageW ||
      this.x > this.stageW * 2 ||
      this.y < -this.stageH ||
      this.y > this.stageH * 2
    ) {
      this.collide()
    }
  }

  updateCollisionTheta(val) {
    this.collisionTheta = val
  }
}
