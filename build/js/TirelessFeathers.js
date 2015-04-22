(function() {
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementsByClassName('loading')[0];

  /*==========  CREATE CANVAS  ==========*/
  var canvas    = document.createElement('canvas');
  canvas.id     = 'canvas';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  container.appendChild(canvas);

  /*==========  DEFINE THE OPTIONS FOR THE SPRITE  ==========*/
  var options = {
    width: 944,
    height: 1111,
    numberOfFramesX: 7,
    numberOfFramesY: 5
  };

  /*==========  GET IMAGE SPRITE  ==========*/
  var birdSprite = new Image();
  birdSprite.onload = function() {
    container.removeChild(loading);
    new Bird();
  };
  birdSprite.src = '/img/sprites/curiousBird_fh7-fv5_w944-h1111.jpg';

  /*============================
  =            BIRD            =
  ============================*/
  function Bird() {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');

    /**
    *
    * This is a neat function in JavaScript.
    * It returns the values of bottom, height, left, right, top and width of the element we want.
    * It is useful in our case so we can get mouse positions only within the bounding box of the canvas.
    *
    **/
    this.rect = this.canvas.getBoundingClientRect();

    /**
    *
    * Each frame on the sprite has an index x and y. The first on each axis is 0.
    * E.g.: The frame in index x0 and y0 is the top left frame.
    * When the page is first loaded we call frame x3 and y2 which is the bird in the center.
    *
    **/
    this.frameIndexX = 3;
    this.frameIndexY = 2;

    /**
    *
    * Think of the screen as a grid that matches the one on the animation sprite.
    * So we measure a cell in the grid of the screen based on the number of frames in the sprite.
    *
    **/
    this.canvasCellWidth = this.canvas.width / options.numberOfFramesX;
    this.canvasCellHeight = this.canvas.height / options.numberOfFramesY;

    /**
    *
    * Now we measure the size of a cell in the animation sprite.
    * In this case we base the measurement on the size of the image we loaded.
    *
    **/
    this.spriteCellWidth = options.width / options.numberOfFramesX;
    this.spriteCellHeight = options.height / options.numberOfFramesY;

    // render the first frame to get us started as soon as the image sprite finishes loading.
    this.render();

    // Now we can start listening to the mouse position and render again when things change.
    this.startListening();
  }

  Bird.prototype.startListening = function() {
    // We only try to update the frame when the mouse moves.
    this.canvas.addEventListener('mousemove', function(event) {
      var mousePos = this.getMousePos(event);

      // Assign this.frameIndexX based on the updated mouse position
      for (var i = 0; i < options.numberOfFramesX; i++) {
        if (mousePos.x < this.canvasCellWidth * (i + 1) && mousePos.x > this.canvasCellWidth * i) {
          this.frameIndexX = i;
        }
      };

      // Assign the this.frameIndexY based on the updated mouse position
      for (var i = 0; i < options.numberOfFramesY; i++) {
        if (mousePos.y < this.canvasCellHeight * (i + 1) && mousePos.y > this.canvasCellHeight * i) {
          this.frameIndexY = i;
        }
      };

      this.render();
    }.bind(this), false);
  };

  Bird.prototype.getMousePos = function(event) {
    return {
      x: event.clientX - this.rect.left,
      y: event.clientY - this.rect.top
    };
  };

  Bird.prototype.render = function() {
    // Since the image is not transparent, there is no need to clear the canvas.
    this.ctx.drawImage(
      birdSprite,                                           // image
      this.frameIndexX * this.spriteCellWidth,              // sx left corner of sprite
      this.frameIndexY * this.spriteCellHeight,             // sy top corner of sprite
      this.spriteCellWidth,                                 // sWidth Width of mask in sprite
      this.spriteCellHeight,                                // sHeight Height of mask in sprite
      this.canvas.width / 2 - (this.spriteCellWidth / 2),   // dx x position on canvas
      this.canvas.height / 2 - (this.spriteCellHeight / 2), // dy y position on canvas
      this.spriteCellWidth,                                 // dWidth width of image (can be used to scale)
      this.spriteCellHeight                                 // dHeight height of image (can be used to scale)
    );
  };

  /*-----  End of BIRD  ------*/
})();