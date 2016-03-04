(function() {
  'use strict';
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');
  var stage     = DDD.canvas(container);

  var eqData        = [];
  var eqIndex       = 0;
  var animating     = false;
  var imgObj        = new Image();
  var imgLoaded     = false;
  var defaultSprite = 'pencil';
  var req           = new DDD.DataRequest();
  var drawing;
  var currentYearBtn;
  var currentStrokeBtn;

  var sprites = {
    pencil: {
      title: 'Pencil',
      sprite: '../../img/sprites/pencil_f4_w80-h60.png',
      cols: 4,
      rows: 1,
      width: 80,
      height: 60,
      offX: 10,
      offY: 60,
      opacity: 0.2
    },
    ink: {
      title: 'Ink',
      sprite: '../../img/sprites/ink_f14_w840_h200_offx26_offy197.png',
      cols: 14,
      rows: 1,
      width: 840,
      height: 200,
      offX: 26,
      offY: 197,
      opacity: 0.9
    },
    birds: {
      title: 'Birds',
      sprite: '../../img/sprites/curiousBird_fh7-fv5_w944-h1111.jpg',
      cols: 7,
      rows: 5,
      width: 944,
      height: 1111,
      offX: 67,
      offY: 190,
      opacity: 0.3
    },
    numbers: {
      title: 'Numbers',
      sprite: '../../img/sprites/numbersFrom0to6_9_col10_row_7_w3050_h1638_offx162_offy176.jpg',
      cols: 10,
      rows: 7,
      width: 3050,
      height: 1638,
      offX: 162,
      offY: 176,
      opacity: 0.1
    }
  };

  var options = {
    radius: 150,
    rangeStart: 0,
    rangeEnd: 8,
    yearStart: 1993,
    yearEnd: 2015,
    opacity: 0.2,
  };

  function updateOptions(data) {
    options.sprite       = data.sprite;
    options.spriteCols   = data.cols;
    options.spriteRows   = data.rows;
    options.spriteW      = data.width;
    options.spriteH      = data.height;
    options.frameOffsetX = data.offX;
    options.frameOffsetY = data.offY;
    options.opacity      = data.opacity;
    options.step         = options.rangeEnd / data.cols;
  }

  function init() {
    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;

    // Start with some default options
    stage.ctx.globalCompositeOperation = 'multiply';
    options.year = options.yearStart;
    updateOptions(sprites[defaultSprite]);

    setupInterface();
    drawing = new Drawing();
    animate();

    req.getD('../../data/ingeominas/eq' + options.year + '.json', dataReady);
  }

  function dataReady(data) {
    loading.style.opacity = 0;
    eqData = data;

    if (!imgLoaded) {
      loadSprite();
    } else {
      drawing.draw();
    }
  }

  function loadSprite() {
    imgObj.onload = function() {
      imgLoaded = true;
      drawing.draw();
      loading.style.opacity = 0;
    };
    imgObj.src = options.sprite;
  }

  function animate() {
    if (animating) {
      if (eqIndex < eqData.length) {
        drawing.defineRenderMode(eqData[eqIndex].utc, eqData[eqIndex].ml);
        eqIndex++;
      } else {
        animating = false;
      }
    }
    requestAnimationFrame(animate);
  }

  function menuReady(menu, current) {
    container.appendChild(menu);
    currentYearBtn = current ? current : currentYearBtn;
  }

  function setupInterface() {
    DDD.yearsMenu(
      options.yearStart,
      options.yearEnd,
      options.yearStart,
      yearsClickEvent,
      menuReady
    );

    var strokesContainer = document.createElement('ul');
    var sliders = {
      radius: updateRadiusText(),
      magnitude: updateMagnitudeText(),
      opacity: updateOpacityText()
    };

    /*==========  STROKES MENU  ==========*/
    strokesContainer.id = 'sprites';

    for (var sprite in sprites) {
      var strokeBtn   = document.createElement('li');
      var strokeLabel = document.createElement('span');
      var strokePlay  = document.createElement('span');

      strokeLabel.className = 'sprite-name';

      if (sprite === defaultSprite) {
        strokeLabel.classList.add('current');
        currentStrokeBtn = strokeLabel;
      }

      strokeLabel.dataset.sprite = sprite;
      strokeLabel.textContent = sprites[sprite].title;
      strokeLabel.addEventListener('click', strokesClickEvent, false);

      strokePlay.className = 'play';
      strokePlay.dataset.sprite = sprite;
      // Use innerHTML instead of textContent so this code generates an arrow symbol
      strokePlay.innerHTML = '&#9658;';
      strokePlay.addEventListener('click', strokesClickEvent, false);

      strokeBtn.appendChild(strokeLabel);
      strokeBtn.appendChild(strokePlay);
      strokesContainer.appendChild(strokeBtn);
    }

    container.appendChild(strokesContainer);

    /*==========  SLIDERS  ==========*/
    for (var slider in sliders) {
      var sliderDiv = document.createElement('div');
      var sliderLabel = document.createElement('span');

      sliderDiv.id = 'slider-' + slider;
      sliderLabel.className = 'slider-values';
      sliderLabel.textContent = sliders[slider];
      sliderDiv.appendChild(sliderLabel);
      container.appendChild(sliderDiv);
    }

    createSliders();
  }

  /*==========  CLICK EVENT CALLBACKS  ==========*/
  function yearsClickEvent(event) {
    req.abort();
    DDD.resetCurrent(currentYearBtn, event.target);
    currentYearBtn = event.target;
    options.year = Number(event.target.textContent);

    drawing.redraw(true);
  }

  function strokesClickEvent(event) {
    var prevSprite = currentStrokeBtn.dataset.sprite;
    var newSprite = event.target.dataset.sprite;

    DDD.resetCurrent(currentStrokeBtn, event.target);

    if (prevSprite !== newSprite) {
      updateOptions(sprites[newSprite]);
      loadSprite();
    }
    currentStrokeBtn = event.target;
    drawing.redraw(false);
  }

  function updateRadiusText() {
    return 'Radius: ' + options.radius + 'px';
  }

  function updateMagnitudeText() {
    return options.rangeStart + ' - ' + options.rangeEnd + ' Ml';
  }

  function updateOpacityText() {
    return 'Opacity: ' + options.opacity;
  }

  /*===============================
  =            SLIDERS            =
  ===============================*/
  function createSliders() {
    $('#slider-radius').slider({
      orientation: 'horizontal',
      animating: 'fast',
      range: 'min',
      min: 0,
      max: 300,
      value: options.radius,
      slide: function(event, ui) {
        options.radius = ui.value;
        event.target.firstElementChild.textContent = updateRadiusText();
        drawing.updatePosition();
      }
    });

    $('#slider-magnitude').slider({
      orientation: 'horizontal',
      animating: 'fast',
      range: true,
      min: options.rangeStart,
      max: options.rangeEnd,
      step: 0.1,
      values: [options.rangeStart, options.rangeEnd],
      slide: function(event, ui) {
        options.rangeStart = ui.values[0];
        options.rangeEnd = ui.values[1];
        event.target.firstElementChild.textContent = updateMagnitudeText();
        drawing.updatePosition();
      }
    });

    $('#slider-opacity').slider({
      orientation: 'horizontal',
      animating: 'fast',
      range: 'min',
      min: 0.1,
      max: 1,
      step: 0.1,
      value: options.opacity,
      slide: function(event, ui) {
        options.opacity = ui.value;
        event.target.firstElementChild.textContent = updateOpacityText();
        drawing.updatePosition();
      }
    });
  }

  /*-----  End of SLIDERS  ------*/

  /*===============================
  =            CLASSES            =
  ===============================*/
  function Drawing() {
    this.stopAnimation = false;
    this.yearEnd    = options.year + 1;
    this.yearLength = (Date.parse(this.yearEnd) - Date.parse(options.year)) * 0.001;
    this.secondsW   = 360 / this.yearLength;
  }

  Drawing.prototype.draw = function() {
    stage.ctx.globalAlpha = options.opacity;
    this.frameW = options.spriteW / options.spriteCols | 0;
    this.frameH = options.spriteH / options.spriteRows | 0;
    if (!animating) {
      for (var i = 0; i < eqData.length; i++) {
        // Check the range of the slider and render only within those values
        if (eqData[i].ml >= options.rangeStart && eqData[i].ml <= options.rangeEnd) {
          this.defineRenderMode(eqData[i].utc, eqData[i].ml);
        }
      }
    }
  };

  Drawing.prototype.defineRenderMode = function(utc, ml) {
    var eventDate  = utc;
    var dReset     = eventDate - (Date.parse(options.year) * 0.001);
    var rot        = dReset * this.secondsW;
    var magnitude  = ml;

    stage.ctx.save();
    stage.ctx.translate(stage.center.x, stage.center.y);
    stage.ctx.rotate(rot * Math.PI / 180);

    if (options.spriteRows === 1) {
      this.oneRowSpriteStroke(magnitude);
    } else {
      this.multiRowSpriteStroke(magnitude);
    }

    stage.ctx.restore();
  };

  Drawing.prototype.redraw = function(loadNewData) {
    loading.style.opacity = 1;
    eqIndex = 0;
    animating = currentStrokeBtn.classList.contains('play') ? true : false;

    this.clearCanvas();

    if (loadNewData) {
      eqData.pop();
      req.json('../../data/ingeominas/eq' + options.year + '.json', dataReady);
    } else {
      loading.style.opacity = 0;
      this.draw();
    }
  };

  Drawing.prototype.updatePosition = function() {
    // only clear the canvas if it is not animating
    if (!animating) {
      this.clearCanvas();
      this.draw();
    }
  };

  Drawing.prototype.clearCanvas = function() {
    stage.ctx.save();
    stage.ctx.globalCompositeOperation = 'destination-out';
    stage.ctx.fillStyle = '#FFF';
    stage.ctx.globalAlpha = 1;
    stage.ctx.fillRect(0, 0, stage.w, stage.h);
    stage.ctx.restore();
  };

  Drawing.prototype.oneRowSpriteStroke = function(magnitude) {
    for (var i = 0; i < options.spriteCols; i++) {
      if (magnitude > (i * options.step) && magnitude <= ((i + 1) * options.step)) {
        this.render(i, 0);
      }
    }
  };

  Drawing.prototype.multiRowSpriteStroke = function(magnitude) {
    var spriteColumn = 0;
    var spriteRow    = 0;
    var mlValues     = [];
    /**
    * Check if number is float or integer.
    * % 1 = 0 means it is an int.
    * When a magnitude is an integer I know that it is always the first column in the sprite, so it can be assigned to index 0.
    **/
    if (magnitude % 1 === 0) {
      spriteRow = magnitude;
      spriteColumn = 0;
    } else {
      mlValues     = magnitude.toString().split('.');
      spriteRow    = mlValues[0];
      spriteColumn = mlValues[1];
    }

    this.render(spriteColumn, spriteRow);
  };

  Drawing.prototype.render = function(col, row) {
    stage.ctx.drawImage(
      imgObj,
      col * this.frameW, row * this.frameH,
      this.frameW, this.frameH,
      -options.frameOffsetX, -(options.radius + options.frameOffsetY),
      this.frameW, this.frameH
    );
  };
  /*=====  End of CLASSES  ======*/

  /*========================================
  =            START EVERYTHING            =
  ========================================*/
  init();
  /*-----  End of START EVERYTHING  ------*/
})();
