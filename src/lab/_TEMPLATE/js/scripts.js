(function () {
  'use strict';
  var loaded    = false;
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');

  /*----------  CREATE CANVAS  ----------*/
  var canvas = document.createElement('canvas');
  var ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  var centerX = canvas.width / 2  | 0;
  var centerY = canvas.height / 2 | 0;
  container.appendChild(canvas);

  function init () {
    loading.style.opacity = 0;
  }

  init();
})();