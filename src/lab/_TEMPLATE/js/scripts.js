(function() {
  'use strict';

  /*----------  SET STAGE  ----------*/
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');
  var stage     = createCanvas(container);

  /*----------  GLOBALS  ----------*/
  var stageW  = window.innerWidth;
  var stageH  = window.innerHeight;
  var centerX = stageW / 2 | 0;
  var centerY = stageH / 2 | 0;

  function init() {
    loading.style.opacity = 0;
  }

  init();
})();
