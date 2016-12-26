(function() {
  'use strict';

  /*----------  SET STAGE  ----------*/
  var stage = DDD.canvas(document.getElementById('ddd-container'));
  var stageW;
  var stageH;

  /*----------  SET GRID (Image Sprite) ----------*/
  var grid = {
    src: '/img/assets/sprites/curiousBird_fh7-fv5_w944-h1111.jpg',
    width: 944,
    height: 1111,
    cols: 7,
    rows: 5
  };

  /**
  * Each frame on the grid has an index x and y. The first on each axis is 0.
  * E.g.: The frame in index x0 and y0 is the top left frame.
  * When the page is first loaded we call frame x3 and y2 which is the bird in the center.
  **/
  grid.x = 3;
  grid.y = 2;

  grid.img        = new Image();
  grid.img.onload = init;
  grid.img.src    = grid.src;

  function init() {
    grid.cellW   = grid.width / grid.cols | 0;
    grid.cellH   = grid.height / grid.rows | 0;
    grid.centerX = grid.cellW / 2 | 0;
    grid.centerY = grid.cellH / 2 | 0;

    setSize();
  }

  function setSize() {
    stage.canvas.width  = stageW = window.innerWidth;
    stage.canvas.height = stageH = window.innerHeight;
    stage.center.x      = stageW / 2 | 0;
    stage.center.y      = stageH / 2 | 0;

    /**
    * Think of the screen as a grid that matches the one on the image sprite.
    * So we measure the size of a cell on the screen based on the number of frames in the sprite.
    **/
    stage.cellW = stageW / grid.cols | 0;
    stage.cellH = stageH / grid.rows | 0;

    render();

    return false;
  }

  function render() {
    // Since the image is not transparent, there is no need to clear the canvas.
    stage.ctx.drawImage(
      grid.img,                       // image
      grid.x * grid.cellW,            // sx left corner of grid
      grid.y * grid.cellH,            // sy top corner of grid
      grid.cellW,                     // sWidth Width of mask in grid
      grid.cellH,                     // sHeight Height of mask in grid
      stage.center.x - grid.centerX,  // dx x position on canvas
      stage.center.y - grid.centerY,  // dy y position on canvas
      grid.cellW,                     // dWidth width of image (can be used to scale)
      grid.cellH                      // dHeight height of image (can be used to scale)
    );
  }

  // We only update the frame when the mouse moves.
  stage.canvas.onmousemove = function(event) {
    grid.x = (event.clientX / stageW) * grid.cols | 0;
    grid.y = (event.clientY / stageH) * grid.rows | 0;

    render();

    return false;
  };

  window.onresize = setSize;
})();
