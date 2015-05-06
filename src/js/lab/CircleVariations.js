(function() {
  'use strict';
  var container      = document.getElementById('ddd-container');
  var canvas         = document.createElement('canvas');
  var ctx            = canvas.getContext('2d');
  var loading        = document.getElementById('ddd-loading');
  var eqData         = [];
  var eqIndex        = 0;
  var animate        = false;
  var imgObj         = new Image();
  var defaultSprite  = 'pencil';
  var ddd, currentYearBtn, currentStrokeBtn;

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
      sprite: '../../img/sprites/ink_f14_w588-h142_offx18-offy138.jpg',
      cols: 14,
      rows: 1,
      width: 588,
      height: 142,
      offX: 18,
      offY: 138,
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
    yearEnd: 2014,
    opacity: 0.2,
    width: window.innerWidth,
    height: window.innerHeight
  };

  function updateOptions (data) {
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

  function init () {
    // Start with some default options
    options.year = options.yearStart;
    updateOptions(sprites[defaultSprite]);

    setupInterface();
    ddd = new Drawing();
    requestData();
    ddd.loadSprite();
  }

  function requestData() {
    var oReq = new XMLHttpRequest();
    var reqURL = '../../data/ingeominas/eq' + options.year + '.json';

    oReq.open('GET', reqURL, true);
    oReq.overrideMimeType('application/json');

    oReq.onreadystatechange = function () {
      if (oReq.readyState == 4) {
        if (oReq.status == '200') {
          eqData = JSON.parse(oReq.responseText);
          ddd.draw();
        } else {
          console.log('Error loading data.');
        }
      }
    };
    oReq.send();
  }

  function Drawing () {
    ctx.globalCompositeOperation = 'multiply';
    this.stopAnimation = false;
    this.yearEnd    = options.year + 1;
    this.yearLength = ( Date.parse(this.yearEnd) - Date.parse(options.year) ) * 0.001;
    this.secondsW   = 360 / this.yearLength;
  }

  Drawing.prototype.loadSprite = function () {
    imgObj.onload = this.imgLoaded.bind(this);
    imgObj.src    = options.sprite;
  };

  Drawing.prototype.imgLoaded = function () {
    this.draw();
    loading.style.opacity = 0;
  };

  Drawing.prototype.draw = function () {
    this.frameW = options.spriteW / options.spriteCols | 0;
    this.frameH = options.spriteH / options.spriteRows | 0;
    ctx.globalAlpha = options.opacity;

    if (animate) {
      this.lineAnimation();
    } else {
      for (var i = 0; i < eqData.length; i++) {
        // Check the range of the slider and render only within those values
        if ( eqData[i].ml >= options.rangeStart && eqData[i].ml <= options.rangeEnd ) {
          this.defineRenderOption(eqData[i].utc, eqData[i].ml);
        }
      }
    }
  };

  Drawing.prototype.defineRenderOption = function (utc, ml) {
    var eventDate  = Date.parse(utc) * 0.001;
    var dReset     = eventDate - (Date.parse(options.year) * 0.001);
    var rot        = dReset * this.secondsW;
    var magnitude  = ml;

    ctx.save();
    ctx.translate(options.width / 2, options.height / 2);
    ctx.rotate(rot * Math.PI / 180);

    if (options.spriteRows === 1) {
      this.oneRowSpriteStroke(magnitude);
    } else {
      this.multiRowSpriteStroke(magnitude);
    }

    ctx.restore();
  };

  Drawing.prototype.redraw = function (loadNewData) {
    loading.style.opacity = 1;
    eqIndex = 0;
    animate = currentStrokeBtn.classList.contains('play') ? true : false;

    this.clearCanvas();

    if (loadNewData) {
      eqData.pop();
      requestData();
    } else {
      this.draw();
    }
  };

  Drawing.prototype.updatePosition = function () {
    // only clear the canvas if it is not animating
    if (!animate) {
      this.clearCanvas();
      this.draw();
    }
  };

  Drawing.prototype.clearCanvas = function () {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#FFF';
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, options.width, options.height);
    ctx.restore();
  };

  Drawing.prototype.lineAnimation = function () {
    if (eqIndex < eqData.length) {
      this.defineRenderOption(eqData[eqIndex].utc, eqData[eqIndex].ml);

      requestAnimationFrame(this.lineAnimation.bind(this));
    } else {
      animate = false;
    }
    eqIndex++;
  };

  Drawing.prototype.oneRowSpriteStroke = function (magnitude) {
    for (var i = 0; i < options.spriteCols; i++) {
      if ( magnitude > (i * options.step) && magnitude <= ( (i + 1) * options.step ) ) {
        this.render(i, 0);
      }
    }
  };

  Drawing.prototype.multiRowSpriteStroke = function (magnitude) {
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

  Drawing.prototype.render = function (col, row) {
    ctx.drawImage(
      imgObj,
      col * this.frameW, row * this.frameH,
      this.frameW, this.frameH,
      -options.frameOffsetX, -(options.radius + options.frameOffsetY),
      this.frameW, this.frameH
    );
  };

  function setupInterface () {
    var yearsContainer   = document.createElement('ul');
    var strokesContainer = document.createElement('ul');

    var sliders = {
      radius: updateRadiusText(),
      magnitude: updateMagnitudeText(),
      opacity: updateOpacityText()
    };

    /*==========  CANVAS  ==========*/
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);

    /*==========  YEARS MENU  ==========*/
    yearsContainer.id = 'years';

    for (var year = options.yearStart; year <= options.yearEnd; year++) {
      var btn   = document.createElement('li');
      var label = document.createTextNode(year);

      if (year === options.yearStart) {
        btn.className = 'current';
        currentYearBtn = btn;
      }

      btn.appendChild(label);
      yearsContainer.appendChild(btn);
      btn.addEventListener('click', yearsClickEvent, false);
    }

    container.appendChild(yearsContainer);

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
  function yearsClickEvent (event) {
    resetCurrentClass(currentYearBtn, event.target);
    currentYearBtn = event.target;
    options.year = Number(currentYearBtn.textContent);

    ddd.redraw(true);
  }

  function strokesClickEvent (event) {
    var prevSprite = currentStrokeBtn.dataset.sprite;
    var newSprite = event.target.dataset.sprite;

    resetCurrentClass(currentStrokeBtn, event.target);
    updateOptions(sprites[newSprite]);

    if (prevSprite !== newSprite) {
      ddd.loadSprite();
    }

    ddd.redraw(false);
    currentStrokeBtn = event.target;
  }

  function resetCurrentClass (old, target) {
    old.classList.remove('current');
    target.classList.add('current');
  }

  function updateRadiusText () {
    return 'Radius: ' + options.radius + 'px';
  }

  function updateMagnitudeText () {
    return options.rangeStart + ' - ' + options.rangeEnd + ' Ml';
  }

  function updateOpacityText () {
    return 'Opacity: ' + options.opacity;
  }

  /*===============================
  =            SLIDERS            =
  ===============================*/
  function createSliders () {
    $('#slider-radius').slider({
      orientation: 'horizontal',
      animate: 'fast',
      range: 'min',
      min: 0,
      max: 300,
      value: options.radius,
      slide: function(event, ui) {
        options.radius = ui.value;
        event.target.firstElementChild.textContent = updateRadiusText();
        ddd.updatePosition();
      }
    });

    $('#slider-magnitude').slider({
      orientation: 'horizontal',
      animate: 'fast',
      range: true,
      min: options.rangeStart,
      max: options.rangeEnd,
      step: 0.1,
      values: [options.rangeStart, options.rangeEnd],
      slide: function (event, ui) {
        options.rangeStart = ui.values[0];
        options.rangeEnd = ui.values[1];
        event.target.firstElementChild.textContent = updateMagnitudeText();
        ddd.updatePosition();
      }
    });

    $('#slider-opacity').slider({
      orientation: 'horizontal',
      animate: 'fast',
      range: "min",
      min: 0.1,
      max: 1,
      step: 0.1,
      value: options.opacity,
      slide: function (event, ui) {
        options.opacity = ui.value;
        event.target.firstElementChild.textContent = updateOpacityText();
        ddd.updatePosition();
      }
    });
  }

  /*-----  End of SLIDERS  ------*/

  /*========================================
  =            START EVERYTHING            =
  ========================================*/
  init();
  /*-----  End of START EVERYTHING  ------*/
})();
