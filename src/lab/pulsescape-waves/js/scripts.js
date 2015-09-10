(function () {
  'use strict';
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');

  /*----------  GLOBALS  ----------*/
  var rawData = [[]];
  var sliceH = 100;
  var rowI = 0;
  var counter = 0;
  var tick = 0;
  var stageW = window.innerWidth;
  container.style.backgroundColor = '#000000';

  requestData('../../data/pulse/heart.2.json', init);

  function init (data) {
    for (var i = 0; i < data.beats.length; i++) {
      var beat = data.beats[i];

      if (beat.charAt(0) === 'S') {
        rawData[rowI].push( Number( beat.substr(1) ) );
        counter++;
      }

      if (counter === (rowI + 1) * stageW) {
        rowI++;
        rawData[rowI] = [];
      }
    }

    createRows();
  }

  function createRows () {
    if (tick < rawData.length) {
      var data = rawData[tick];
      var canvas = document.createElement('canvas');
      canvas.width = stageW;
      canvas.height = sliceH;
      canvas.style.marginTop = -(sliceH / 1.2) + 'px';
      container.appendChild(canvas);

      new Drawing(data, canvas);
      tick++;
      requestAnimationFrame(createRows);
    } else {
      loading.style.opacity = 0;
    }
  }

  function Drawing(data, canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = '#FFFFFF';

    for (var i = 0; i < data.length; i++) {
      var yPos = sliceH - (data[i] - 440 );
      var halfPoint = sliceH - (sliceH - yPos) / 2;

      this.ctx.beginPath();
      this.ctx.moveTo( i, sliceH );
      this.ctx.quadraticCurveTo(i - yPos, halfPoint, i, yPos);
      this.ctx.strokeStyle = 'rgba(49, ' + ( 130 - (data[i] - 500 ) ) + ', ' + ( 200 - (data[i] - 500 ) ) + ', 0.7)';
      this.ctx.stroke();
      this.ctx.fillRect(i, yPos, 1.5, 1.5);
    }
  }
})();