import { canvas, random, TWO_PI, PI } from 'dddrawings'
import Particle from './Particle'

/*----------  SET STAGE  ----------*/
let stage = canvas(document.getElementById('ddd-container'))
let ctx = stage.ctx
let centerX = stage.center.x
let centerY = stage.center.y

/*----------  GLOBALs  ----------*/
const num = 5000 // total number of particles
let blackout = false // blackout is production control of white or black filaments
let kaons = [] // kaons is array of path tracing particles
let count = 0

ctx.fillRect(0, 0, stage.w, stage.h)
const emitX = 30 * Math.sin(TWO_PI / num) + centerX
const emitY = 30 * Math.cos(TWO_PI / num) + centerY

// begin with particle sling-shot around ring origin
for (let i = 0; i < num; i++) {
  let r = (PI * i) / num
  kaons.push(new Particle(emitX, emitY, r, blackout))
}

draw()

stage.canvas.onclick = switchBlackout


function draw() {
  if (count === 2) {
    for (let i = 0; i < num; i++) {
      let particle = kaons[i]
      let _x = particle.x
      let _y = particle.y + centerY

      particle.move()

      ctx.strokeStyle = particle.color
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(centerX + _x, _y)
      ctx.lineTo(centerX + particle.x, centerY + particle.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(centerX - _x, _y)
      ctx.lineTo(centerX - particle.x, centerY + particle.y)
      ctx.stroke()
      ctx.restore()

      particle.update(blackout)
    }

    // randomly switch blackout periods
    if (random(0, 10000) > 9950) {
      switchBlackout()
    }

    count = 0
  }

  count++
  requestAnimationFrame(draw)
}

function switchBlackout() {
  blackout = !blackout
}