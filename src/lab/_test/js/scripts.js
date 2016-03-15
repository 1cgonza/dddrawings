(function() {
  'use strict';

  /*----------  SET STAGE  ----------*/
  var container = document.getElementById('ddd-container');

  /*----------  GLOBALS  ----------*/
  var stageW  = window.innerWidth;
  var stageH  = window.innerHeight;
  var centerX = stageW / 2 | 0;
  var centerY = stageH / 2 | 0;

  DDD.json('/data/pulse/heart.json', dataReady, null, container, 'Loading Data');

  function dataReady(d) {
    console.log(d);
  }
})();
