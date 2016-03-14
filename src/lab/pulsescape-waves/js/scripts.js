(function() {
  'use strict';
  var container = document.getElementById('ddd-container');

  /*----------  GLOBALS  ----------*/
  var rawData = [[]];
  var sliceH  = 100;
  var rowI    = 0;
  var counter = 0;
  var tick    = 0;
  container.style.backgroundColor = '#000000';

  DDD.json('../../data/pulse/heart.2.json', init, null, container, 'Loading Pulse Data');

  function init(data) {
    for (var i = 0; i < data.beats.length; i++) {
      var beat = data.beats[i];

      if (beat.charAt(0) === 'S') {
        rawData[rowI].push(Number(beat.substr(1)));
        counter++;
      }

      if (counter === (rowI + 1) * window.innerWidth) {
        rowI++;
        rawData[rowI] = [];
      }
    }

    createRows();
  }

  function createRows() {
    if (tick < rawData.length) {
      var data = rawData[tick];
      var row = DDD.canvas(container,
        {
          h: 100,
          position: 'initial',
          css: {marginTop: -(sliceH / 1.2) + 'px'}
        }
      );

      new Drawing(data, row);
      tick++;
      requestAnimationFrame(createRows);
    }
  }

  function Drawing(data, row) {
    this.canvas = row.canvas;
    this.ctx    = row.ctx;
    this.ctx.fillStyle = '#FFFFFF';

    for (var i = 0; i < data.length; i++) {
      var yPos      = sliceH - (data[i] - 440);
      var halfPoint = sliceH - (sliceH - yPos) / 2;

      this.ctx.beginPath();
      this.ctx.moveTo(i, sliceH);
      this.ctx.quadraticCurveTo(i - yPos, halfPoint, i, yPos);
      this.ctx.strokeStyle = 'rgba(49, ' + (130 - (data[i] - 500)) + ', ' + (200 - (data[i] - 500)) + ', 0.7)';
      this.ctx.stroke();
      this.ctx.fillRect(i, yPos, 1.5, 1.5);
    }
  }
})();
