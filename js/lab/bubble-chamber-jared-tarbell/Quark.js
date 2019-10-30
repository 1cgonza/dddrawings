// Quark particle
// the quark draws as a translucent black.  their large numbers
// create fields of blackness overwritten only by the glowing shadows of Hadrons.
// quarks are allowed to accelerate away with speed decay values above 1.0
// each quark has an entangled friend.  both particles are drawn identically,
// mirrored along the y-axis.
import { random, convertAlpha } from 'dddrawings'

export default class Quark {
  constructor(x, y, centerX, centerY, stageW, stageH, setPixelColor) {
    this.x = x
    this.y = y
    this.centerX = centerX
    this.centerY = centerY
    this.stageW = stageW
    this.stageH = stageH
    this.collisionTheta = 0
    this.setPixelColor = setPixelColor
  }

  collide() {
    // initialize all parameters with random collision
    this.x = this.centerX
    this.y = this.centerY
    this.theta = this.collisionTheta + random(-0.11, 0.11, true)
    this.speed = random(0.5, 3.0, true)

    this.speedD = random(0.996, 1.001, true)
    this.thetaD = 0
    this.thetaDD = 0

    // rate of orbit decay
    while (Math.abs(this.thetaDD) < 0.00001) {
      this.thetaDD = random(-0.001, 0.001, true)
    }
  }

  move() {
    var _x = this.x | 0
    var _y = this.y | 0
    var color = [0, 0, 0]
    var a = convertAlpha(32)

    // draw
    var _i1 = (_y * this.stageW + _x) * 4
    this.setPixelColor(_i1, color, a)
    // draw anti-particle
    var _i2 = (_y * this.stageW + (this.stageW - _x)) * 4
    this.setPixelColor(_i2, color, a)

    // move & turn
    this.x += this.speed * Math.sin(this.theta)
    this.y += this.speed * Math.cos(this.theta)

    this.theta += this.thetaD

    // modify spin
    this.thetaD += this.thetaDD

    // modify speed
    this.speed *= this.speedD

    if (random(0, 1000) > 997) {
      this.speed *= -1
      this.speedD = 2 - this.speedD
    }

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
