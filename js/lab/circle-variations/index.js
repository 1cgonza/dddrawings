import { canvas, DataRequest, yearsMenu, resetCurrent } from 'dddrawings'
import { create as createSlider } from 'nouislider'
import sprites from './sprites'

const container = document.getElementById('ddd-container')
const stage = canvas(container)

let eqData = []
let eqIndex = 0
let animating = false
let imgObj = new Image()
let imgLoaded = false
let defaultSprite = 'pencil'
let req = new DataRequest()
let drawing
let currentYearBtn
let currentStrokeBtn

let options = {
  radius: 150,
  rangeStart: 0,
  rangeEnd: 8,
  yearStart: 1993,
  yearEnd: 2015,
  opacity: 0.2
}

function updateOptions(data) {
  options.sprite = data.sprite
  options.spriteCols = data.cols
  options.spriteRows = data.rows
  options.spriteW = data.width
  options.spriteH = data.height
  options.frameOffsetX = data.offX
  options.frameOffsetY = data.offY
  options.opacity = data.opacity
  options.step = options.rangeEnd / data.cols
}

function requestData() {
  req
    .json({
      url: '/data/ingeominas/eq' + options.year + '.json',
      container: container,
      loadngMsg: 'Loading seismic data of year ' + options.year
    })
    .then(data => {
      eqData = data

      if (!imgLoaded) {
        loadSprite()
      } else {
        drawing.draw()
      }
    })
    .catch(err => console.error(err))
}

function loadSprite() {
  imgObj.onload = () => {
    imgLoaded = true
    drawing.draw()
  }
  imgObj.src = options.sprite
}

function animate() {
  if (animating) {
    if (eqIndex < eqData.length) {
      drawing.defineRenderMode(eqData[eqIndex].date.unix, eqData[eqIndex].ml)
      eqIndex++
    } else {
      animating = false
    }
  }
  requestAnimationFrame(animate)
}

function menuReady(menu, current) {
  container.appendChild(menu)
  currentYearBtn = current ? current : currentYearBtn
}

function setupInterface() {
  yearsMenu(
    options.yearStart,
    options.yearEnd,
    options.yearStart,
    yearsClickEvent,
    menuReady
  )

  var strokesContainer = document.createElement('ul')
  var sliders = {
    magnitude: updateMagnitudeText(),
    radius: updateRadiusText(),
    opacity: updateOpacityText()
  }

  /*==========  STROKES MENU  ==========*/
  strokesContainer.id = 'sprites'

  for (var sprite in sprites) {
    var strokeBtn = document.createElement('li')
    var strokeLabel = document.createElement('span')
    var strokePlay = document.createElement('span')

    strokeLabel.className = 'sprite-name'

    if (sprite === defaultSprite) {
      strokeLabel.classList.add('current')
      currentStrokeBtn = strokeLabel
    }

    strokeLabel.dataset.sprite = sprite
    strokeLabel.textContent = sprites[sprite].title
    strokeLabel.addEventListener('click', strokesClickEvent, false)

    strokePlay.className = 'play'
    strokePlay.dataset.sprite = sprite
    // Use innerHTML instead of textContent so this code generates an arrow symbol
    strokePlay.innerHTML = '&#9658;'
    strokePlay.addEventListener('click', strokesClickEvent, false)

    strokeBtn.appendChild(strokeLabel)
    strokeBtn.appendChild(strokePlay)
    strokesContainer.appendChild(strokeBtn)
  }

  container.appendChild(strokesContainer)

  /*==========  SLIDERS  ==========*/
  const slidersWrapper = document.createElement('div')
  slidersWrapper.className = 'slidersWrapper'
  container.appendChild(slidersWrapper)

  for (let slider in sliders) {
    let sliderInput = document.createElement('input')
    if (slider === 'magnitude') {
      sliderInput = document.createElement('div')
    }

    let sliderLabel = document.createElement('span')

    sliderInput.id = `slider-${slider}`
    sliderInput.classList.add('slider')
    sliderLabel.id = `slider-${slider}-val`
    sliderLabel.className = 'sliderValues'
    sliderLabel.textContent = sliders[slider]
    slidersWrapper.appendChild(sliderLabel)
    slidersWrapper.appendChild(sliderInput)
  }

  createSliders()
}

/*==========  CLICK EVENT CALLBACKS  ==========*/
function yearsClickEvent(event) {
  req.abort()
  resetCurrent(currentYearBtn, event.target)
  currentYearBtn = event.target
  options.year = Number(event.target.textContent)

  drawing.redraw(true)
}

function strokesClickEvent(event) {
  var prevSprite = currentStrokeBtn.dataset.sprite
  var newSprite = event.target.dataset.sprite

  resetCurrent(currentStrokeBtn, event.target)

  if (prevSprite !== newSprite) {
    updateOptions(sprites[newSprite])
    loadSprite()
  }
  currentStrokeBtn = event.target
  drawing.redraw(false)
}

function updateRadiusText() {
  return 'Radius: ' + options.radius + 'px'
}

function updateMagnitudeText() {
  return options.rangeStart + ' - ' + options.rangeEnd + ' Ml'
}

function updateOpacityText() {
  return 'Opacity: ' + options.opacity
}

/*===============================
  =            SLIDERS            =
  ===============================*/
function createSliders() {
  const radius = document.getElementById('slider-radius')
  radius.setAttribute('type', 'range')
  radius.setAttribute('min', 0)
  radius.setAttribute('max', 300)
  radius.value = options.radius
  radius.classList.add('sliderHorizontal')

  radius.oninput = e => {
    const label = document.getElementById('slider-radius-val')
    options.radius = +e.target.value
    label.textContent = updateRadiusText()
    drawing.updatePosition()
  }

  const magnitude = createSlider(document.getElementById('slider-magnitude'), {
    step: 0.1,
    start: [options.rangeStart, options.rangeEnd],
    connect: true,
    range: {
      min: options.rangeStart,
      max: options.rangeEnd
    }
  })

  magnitude.on('update', values => {
    const label = document.getElementById('slider-magnitude-val')
    options.rangeStart = values[0]
    options.rangeEnd = values[1]
    label.textContent = updateMagnitudeText()

    if (drawing) drawing.updatePosition()
  })

  const opacity = document.getElementById('slider-opacity')
  opacity.setAttribute('type', 'range')
  opacity.setAttribute('min', 0.1)
  opacity.setAttribute('max', 1)
  opacity.setAttribute('step', 0.1)
  opacity.value = options.opacity
  opacity.classList.add('sliderHorizontal')

  opacity.oninput = e => {
    const label = document.getElementById('slider-opacity-val')
    options.opacity = +e.target.value
    label.textContent = updateOpacityText()
    drawing.updatePosition()
  }
}

class Drawing {
  constructor(ctx, options) {
    this.ctx = ctx
    this.stopAnimation = false
    this.yearEnd = options.year + 1
    this.yearLength =
      (Date.parse(this.yearEnd) - Date.parse(options.year)) * 0.001
    this.secondsW = 360 / this.yearLength
  }

  draw() {
    this.ctx.globalAlpha = options.opacity
    this.frameW = (options.spriteW / options.spriteCols) | 0
    this.frameH = (options.spriteH / options.spriteRows) | 0

    if (!animating) {
      for (let i = 0; i < eqData.length; i++) {
        // Check the range of the slider and render only within those values
        if (
          eqData[i].ml >= options.rangeStart &&
          eqData[i].ml <= options.rangeEnd
        ) {
          this.defineRenderMode(eqData[i].date.unix, eqData[i].ml)
        }
      }
    }
  }

  defineRenderMode(unix, ml) {
    const ctx = this.ctx
    const dReset = unix - Date.parse(options.year) / 1000
    const rot = dReset * this.secondsW
    ctx.save()
    ctx.translate(stage.center.x, stage.center.y)
    ctx.rotate((rot * Math.PI) / 180)

    if (options.spriteRows === 1) {
      this.oneRowSpriteStroke(ml)
    } else {
      this.multiRowSpriteStroke(ml)
    }

    stage.ctx.restore()
  }

  redraw(loadNewData) {
    eqIndex = 0
    animating = currentStrokeBtn.classList.contains('play') ? true : false

    this.clearCanvas()

    if (loadNewData) {
      eqData.pop()
      requestData()
    } else {
      this.draw()
    }
  }

  updatePosition() {
    // only clear the canvas if it is not animating
    if (!animating) {
      this.clearCanvas()
      this.draw()
    }
  }

  clearCanvas() {
    const ctx = this.ctx;
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = '#FFF'
    ctx.globalAlpha = 1
    ctx.fillRect(0, 0, stage.w, stage.h)
    ctx.restore()
  }

  oneRowSpriteStroke(magnitude) {
    for (let i = 0; i < options.spriteCols; i++) {
      if (magnitude > i * options.step && magnitude <= (i + 1) * options.step) {
        this.render(i, 0)
      }
    }
  }

  multiRowSpriteStroke(magnitude) {
    let spriteColumn = 0
    let spriteRow = 0
    let mlValues = []
    /**
     * Check if number is float or integer.
     * % 1 = 0 means it is an int.
     * When a magnitude is an integer I know that it is always the first column in the sprite, so it can be assigned to index 0.
     **/
    if (magnitude % 1 === 0) {
      spriteRow = magnitude
      spriteColumn = 0
    } else {
      mlValues = magnitude.toString().split('.')
      spriteRow = mlValues[0]
      spriteColumn = mlValues[1]
    }

    this.render(spriteColumn, spriteRow)
  }

  render(col, row) {
    this.ctx.drawImage(
      imgObj,
      col * this.frameW,
      row * this.frameH,
      this.frameW,
      this.frameH,
      -options.frameOffsetX,
      -(options.radius + options.frameOffsetY),
      this.frameW,
      this.frameH
    )
  }
}

stage.canvas.width = window.innerWidth
stage.canvas.height = window.innerHeight

// Start with some default options
stage.ctx.globalCompositeOperation = 'multiply'
options.year = options.yearStart
updateOptions(sprites[defaultSprite])

setupInterface()
drawing = new Drawing(stage.ctx, options)
animate()
requestData()