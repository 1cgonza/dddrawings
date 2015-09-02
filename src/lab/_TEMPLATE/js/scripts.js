(function () {
  'use strict';
  var loaded    = false;
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementsByClassName('loading')[0];

  /*==========  CREATE CANVAS  ==========*/
  var canvas = document.createElement('canvas');
  var ctx    = canvas.getContext('2d');
  var centerX, centerY;

  function resize () {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    centerX = canvas.width / 2 | 0;
    centerY = canvas.height / 2 | 0;
  }

  window.onresize = resize;
})();