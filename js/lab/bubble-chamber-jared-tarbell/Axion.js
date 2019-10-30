// Axion particle
// the axion particle draws a bold black path.  axions exist
// in a slightly higher dimension and as such are drawn with
// elevated embossed shadows.  axions are quick to stabilize
// and fall into single pixel orbits axions automatically
// recollide themselves after stabilizing.

import { random, convertAlpha, TWO_PI } from 'dddrawings'

export default class Axion {
  constructor(x, y, stageW, setPixelColor) {
    this.x = x
    this.y = y
    this.centerX = x
    this.centerY = y
    this.stageW = stageW
    this.setPixelColor = setPixelColor
  }

  collide() {
    this.x = this.centerX
    this.y = this.centerY
    this.theta = random(0, TWO_PI, true)
    this.speed = random(1.0, 6.0, true)

    this.speedD = random(0.998, 1.0, true)
    this.thetaD = 0
    this.thetaDD = 0

    // rate of orbit decay
    while (Math.abs(this.thetaDD) < 0.00001) {
      this.thetaDD = random(-0.001, 0.001, true)
    }
  }

  move() {
    const _x = this.x | 0
    const _y = this.y | 0
    const color1 = [16, 16, 16]
    const color2 = [255, 255, 255]
    const color3 = [0, 0, 0]
    let a = convertAlpha(150)

    // draw - axions are high contrast
    const _i1 = (_y * this.stageW + _x) * 4
    this.setPixelColor(_i1, color1, a)

    // axions cast vertical glows, highlight/shadow emboss
    for (let dy = 1; dy < 5; dy++) {
      a = convertAlpha(30 - dy * 6)
      const _i2 = ((_y - dy) * this.stageW + _x) * 4
      this.setPixelColor(_i2, color2, a)
    }

    for (let dy2 = 1; dy2 < 5; dy2++) {
      a = convertAlpha(30 - dy2 * 6)
      const _i3 = ((_y + dy2) * this.stageW + _x) * 4
      this.setPixelColor(_i3, color3, a)
    }

    // move
    this.x += this.speed * Math.sin(this.theta)
    this.y += this.speed * Math.cos(this.theta)

    this.theta += this.thetaD

    // modify spin
    this.thetaD += this.thetaDD

    // modify speed
    this.speed *= this.speedD
    this.speedD *= 0.9999

    if (random(0, 100) > 30) {
      this.x = this.centerX
      this.y = this.centerY
      this.collide()
    }
  }
}
