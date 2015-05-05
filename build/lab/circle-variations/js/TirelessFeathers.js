(function () {
  'use strict';
  var options   = {};
  var loaded    = false;
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementsByClassName('loading')[0];

  var birdOptions = {
    img: '/img/sprites/curiousBird_fh7-fv5_w944-h1111.jpg',
    width: 944,
    height: 1111,
    cols: 7,
    rows: 5
  };

  var Sprite = function (options) {
    this.img    = options.img;
    this.width  = options.width;
    this.height = options.height;
    this.cols   = options.cols;
    this.rows   = options.rows;
  };

  var sprite = new Sprite(birdOptions);

  /*==========  CREATE CANVAS  ==========*/
  var canvas    = document.createElement('canvas');
  var ctx       = canvas.getContext('2d');
  var rect      = canvas.getBoundingClientRect();

  /**
  * Each frame on the sprite has an index x and y. The first on each axis is 0.
  * E.g.: The frame in index x0 and y0 is the top left frame.
  * When the page is first loaded we call frame x3 and y2 which is the bird in the center.
  **/
  var frameIndexX = 3;
  var frameIndexY = 2;

  /*==========  GET IMAGE SPRITE  ==========*/
  var birdSprite    = new Image();
  birdSprite.onload = init;
  birdSprite.src    = sprite.img;

  function init () {
    loaded = true;
    container.appendChild(canvas);
    container.removeChild(loading);

    sprite.cellW   = sprite.width / sprite.cols | 0;
    sprite.cellH   = sprite.height / sprite.rows | 0;
    sprite.centerX = sprite.cellW / 2 | 0;
    sprite.centerY = sprite.cellH / 2 | 0;

    setSize();
  }

  function setSize () {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    options.canvasCenterX = canvas.width / 2 | 0;
    options.canvasCenterY = canvas.height / 2 | 0;

    /**
    * Think of the screen as a grid that matches the one on the animation sprite.
    * So we measure a cell in the grid of the screen based on the number of frames in the sprite.
    **/
    options.canvasCellW = canvas.width / sprite.cols | 0;
    options.canvasCellH = canvas.height / sprite.rows | 0;

    render();
  }

  function render () {
    if (loaded) {
      // Since the image is not transparent, there is no need to clear the canvas.
      ctx.drawImage(
        birdSprite,                             // image
        frameIndexX * sprite.cellW,             // sx left corner of sprite
        frameIndexY * sprite.cellH,             // sy top corner of sprite
        sprite.cellW,                           // sWidth Width of mask in sprite
        sprite.cellH,                           // sHeight Height of mask in sprite
        options.canvasCenterX - sprite.centerX, // dx x position on canvas
        options.canvasCenterY - sprite.centerY, // dy y position on canvas
        sprite.cellW,                           // dWidth width of image (can be used to scale)
        sprite.cellH                            // dHeight height of image (can be used to scale)
      );
    }
  }

  function onMouseMove (event) {
    var mousePos = getMousePos(event);
    var frameX = 0;
    var frameY = 0;

    while ( frameX < sprite.cols ) {
      if (mousePos.x < options.canvasCellW * (frameX + 1) && mousePos.x > options.canvasCellW * frameX) {
        frameIndexX = frameX;
        break;
      }
      frameX += 1;
    }

    while ( frameY < sprite.rows ) {
      if (mousePos.y < options.canvasCellH * (frameY + 1) && mousePos.y > options.canvasCellH * frameY) {
        frameIndexY = frameY;
        break;
      }
      frameY += 1;
    }

    render();
  }

  function getMousePos (event) {
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  // We only try to update the frame when the mouse moves.
  canvas.addEventListener('mousemove', onMouseMove, false);

  window.onresize = setSize;
})();