(function () {
  'use strict';
  var loaded    = false;
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');
  document.body.style.backgroundColor = 'black';


  /*----------  GLOBAL VARIABLES  ----------*/
  var stageW = window.innerWidth;
  var stageH = window.innerHeight;
  var rawData          = [];
  var uniqueBeatValues = [];
  var beatsGrid        = {};
  var minMaxValues = {
    raw: {min: 100000, max: 0},
    beat: {min: 100000, max: 0}
  };
  var AR;
  var di = 0;
  var centerX = stageW / 2;
  var centerY = stageH / 2;
  var flip = false;
  var rStep, xStep, nStep;
  var rowsNet = 6;
  var co = 1;

  /*----------  CREATE CANVAS  ----------*/
   var t   = createCanvas(container);
   var grid = createCanvas(container);
   var base = createCanvas(container);
   var offT = createCanvas(null);

   t.ctx.strokeStyle    = 'rgba(255, 236, 37, 1)';
   grid.ctx.fillStyle   = 'rgba(255, 89, 237, 1)';
   grid.ctx.strokeStyle = 'rgba(255, 89, 237, 0.1)';
   base.ctx.strokeStyle = 'rgba(255, 236, 37, 0.05)';
   base.ctx.fillStyle   = 'rgba(255, 89, 237, 1)';

  requestData('../../data/pulse/heart.2.json', processData);

  function processData (data) {
    for (var i = 0; i < data.beats.length / 3; i++) {
      var point = data.beats[i];
      var value = Number( point.substr(1) );

      if( point.charAt(0) === 'B' ) {
        rawData.push( {bpm: value} );

        checkMinMax(value, 'beat');
        newArrayBeats(value);
      }
    }
    rStep = 360 / rawData.length;
    xStep = stageW / rawData.length;
    nStep = stageW / uniqueBeatValues.length;

    for (var y = 0; y < rowsNet; y++) {
      for (var x = 0; x < uniqueBeatValues.length / rowsNet; x++) {
        var gxStep = stageW / (uniqueBeatValues.length / rowsNet);
        var gyStep = stageH / rowsNet;
        var cx = (x * gxStep) + (gxStep / 2);
        var cy = (y * gyStep) + (gyStep / 2);

        var key = ( ( (uniqueBeatValues.length / rowsNet) - 1 ) * y ) + (y + x);
        beatsGrid[ uniqueBeatValues[key] ] = {x: cx, y: cy};
      }
    }
    // Init timeline
    drawTimeline();
  }

  function newArrayBeats (value) {
    var alreadyExists = uniqueBeatValues.some(function (element) {
      return element === value;
    });

    if (!alreadyExists) {
      uniqueBeatValues.push(value);
    }

    uniqueBeatValues.sort(sortNumber);
  }

  function sortNumber (a, b) {
    return a - b;
  }

  function checkMinMax (value, type) {
    if (value < minMaxValues[type].min) {
      minMaxValues[type].min = value;
    }

    if (value > minMaxValues[type].max) {
      minMaxValues[type].max = value;
    }
  }

  function drawTimeline () {
    for (var i = 0; i < rawData.length; i++) {
      drawHorizNode(rawData[i].bpm, i, base.ctx);
      drawRadialNode(rawData[i].bpm, i, base.ctx);
      // drawNetwork(i);
    }

    for (var b in beatsGrid) {
      base.ctx.fillRect(beatsGrid[b].x - 1.5, beatsGrid[b].y -1.5, 3, 3);
    }
    AR = requestAnimationFrame(animateTimeline);
  }

  function drawHorizNode (val, i, ctx) {
    var x = i * xStep;
    ctx.beginPath();
    ctx.moveTo(x, stageH);
    ctx.lineTo(x, stageH - val);
    ctx.stroke();
  }

  function drawRadialNode (val, i, ctx) {
    var r = i * rStep;
    ctx.save();
      ctx.translate(centerX, centerY / 2);
      ctx.rotate(r * Math.PI / 180);
      ctx.moveTo(0, -50);
      ctx.lineTo(0, -50 - val);
      ctx.stroke();
    ctx.restore();
  }

  function drawNetwork (i) {
    flip = !flip;
    var prevKey = i > 0 ? rawData[i - 1].bpm : rawData[0].bpm;
    var key = rawData[i].bpm;
    var prev = beatsGrid[prevKey];
    var dest = beatsGrid[key];
    var push = flip ? key : -key;
    var midX = prev.x !== dest.x ? prev.x - ( (prev.x - dest.x) / 2) : prev.x - push;
    var midY = prev.y !== dest.y ? prev.y - ( (prev.y - dest.y) / 2) : prev.y - push;

    if ( prev.x !== dest.x && prev.y !== dest.y ) midY -= push;

    if (JSON.stringify(prev) !== JSON.stringify(dest) ) {
      grid.ctx.beginPath();
      grid.ctx.moveTo(prev.x, prev.y);
      grid.ctx.quadraticCurveTo( midX, midY, dest.x, dest.y );
      grid.ctx.stroke();
    }
  }

  function animateTimeline() {
    if (di < rawData.length) {
      drawHorizNode(rawData[di].bpm, di, t.ctx);
      drawRadialNode(rawData[di].bpm, di, t.ctx);
      drawNetwork(di);

      di++;
      AR = requestAnimationFrame(animateTimeline);
    } else {
      co -= 0.01;
      offT.ctx.clearRect(0, 0, stageW, stageH);
      offT.ctx.globalAlpha = co;
      offT.ctx.drawImage(t.canvas, 0, 0, stageW, stageH);
      offT.ctx.drawImage(grid.canvas, 0, 0, stageW, stageH);
      t.ctx.clearRect(0, 0, stageW, stageH);
      t.ctx.drawImage(offT.canvas, 0, 0, stageW, stageH);
      grid.ctx.clearRect(0, 0, stageW, stageH);

      if (co <= 0.5) {
        di = 0;
        co = 1;
      }
      AR = requestAnimationFrame(animateTimeline);
    }

  }

})();
