(function() {
  'use strict';
  var loaded    = false;
  var container = document.getElementById('ddd-container');
  container.style.color = 'white';
  document.body.style.backgroundColor = 'black';

  /*----------  GLOBAL VARIABLES  ----------*/
  var animReq;
  var rawData          = [];
  var uniqueBeatValues = [];
  var beats            = [];
  var beatsGrid        = {};

  var minMaxValues = {
    raw: {min: 100000, max: 0},
    beat: {min: 100000, max: 0}
  };

  var di      = 0;
  var flip    = false;
  var rStep   = 0;
  var xStep   = 0;
  var nStep   = 0;
  var rowsNet = 6;
  var co      = 1;

  /*----------  CREATE CANVAS  ----------*/
  var stage = DDD.canvas(container);
  var grid  = DDD.canvas(container);
  var base  = DDD.canvas(container);
  var offT  = DDD.canvas(null);

  grid.ctx.fillStyle                = 'rgba(255, 89, 237, 1)';
  grid.ctx.strokeStyle              = 'rgba(255, 89, 237, 0.1)';
  base.ctx.strokeStyle              = 'rgba(255, 236, 37, 0.05)';
  stage.ctx.strokeStyle             = 'rgba(255, 236, 37, 1)';
  base.ctx.fillStyle                = 'rgba(255, 89, 237, 1)';
  grid.ctx.globalCompositeOperation = 'darken';

  DDD.json({
    url: '../../data/pulse/heart.2.json',
    container: container,
    loadingMsg: 'Loading Pulse Data'
  })
  .then(processData)
  .catch(function(err) {
    console.error(err);
  });

  function processData(data) {
    for (var i = 0; i < data.beats.length / 3; i++) {
      var point = data.beats[i];
      var value = Number(point.substr(1));

      if (point.charAt(0) === 'B') {
        rawData.push({bpm: value});

        checkMinMax(value, 'beat');
        newArrayBeats(value);
      }
    }
    rStep = 360 / rawData.length;
    xStep = stage.w / rawData.length;
    nStep = stage.w / uniqueBeatValues.length;

    for (var y = 0; y < rowsNet; y++) {
      for (var x = 0; x < uniqueBeatValues.length / rowsNet; x++) {
        var gxStep = stage.w / (uniqueBeatValues.length / rowsNet);
        var gyStep = stage.h / rowsNet;
        var cx = (x * gxStep) + (gxStep / 2);
        var cy = (y * gyStep) + (gyStep / 2);

        var key = (((uniqueBeatValues.length / rowsNet) - 1) * y) + (y + x);
        beats[ uniqueBeatValues[key] ] = new Beat(cx, cy);
        beatsGrid[ uniqueBeatValues[key] ] = {x: cx, y: cy};
      }
    }
    // console.log(beatsGrid)
    // Init timeline
    drawTimeline();
  }

  function newArrayBeats(value) {
    var alreadyExists = uniqueBeatValues.some(function(element) {
      return element === value;
    });

    if (!alreadyExists) {
      uniqueBeatValues.push(value);
    }

    uniqueBeatValues.sort(sortNumber);
  }

  function sortNumber(a, b) {
    return a - b;
  }

  function checkMinMax(value, type) {
    if (value < minMaxValues[type].min) {
      minMaxValues[type].min = value;
    }

    if (value > minMaxValues[type].max) {
      minMaxValues[type].max = value;
    }
  }

  function drawTimeline() {
    for (var i = 0; i < rawData.length; i++) {
      // for (var i = 0; i < 300; i++) {
      drawHorizNode(rawData[i].bpm, i, base.ctx);
      drawRadialNode(rawData[i].bpm, i, base.ctx);
      // drawNetwork(i);
    }

    for (var b in beatsGrid) {
      base.ctx.fillRect(beatsGrid[b].x, beatsGrid[b].y, 3, 3);
    }
    animReq = requestAnimationFrame(animateTimeline);
  }

  function drawHorizNode(val, i, ctx) {
    var x = i * xStep;
    ctx.beginPath();
    ctx.moveTo(x, stage.h);
    ctx.lineTo(x, stage.h - val);
    ctx.stroke();
  }

  function drawRadialNode(val, i, ctx) {
    var r = i * rStep;
    ctx.save();
    ctx.translate(stage.center.x, stage.center.y / 2);
    ctx.rotate(r * Math.PI / 180);
    ctx.moveTo(0, -50);
    ctx.lineTo(0, -50 - val);
    ctx.stroke();
    ctx.restore();
  }

  function drawNetwork(i) {
    var key = rawData[i].bpm;
    var thisBeat = beats[key];
    thisBeat.draw();
  }

  function animateTimeline() {
    if (di < rawData.length) {
      drawHorizNode(rawData[di].bpm, di, stage.ctx);
      drawRadialNode(rawData[di].bpm, di, stage.ctx);
      drawNetwork(di);

      di++;
      animReq = requestAnimationFrame(animateTimeline);
    } else {
      co -= 0.01;
      offT.ctx.clearRect(0, 0, stage.w, stage.h);
      offT.ctx.globalAlpha = co;
      offT.ctx.drawImage(stage.canvas, 0, 0, stage.w, stage.h);
      offT.ctx.drawImage(grid.canvas, 0, 0, stage.w, stage.h);
      stage.ctx.clearRect(0, 0, stage.w, stage.h);
      stage.ctx.drawImage(offT.canvas, 0, 0, stage.w, stage.h);
      grid.ctx.clearRect(0, 0, stage.w, stage.h);

      if (co <= 0.5) {
        di = 0;
        co = 1;
      }
      animReq = requestAnimationFrame(animateTimeline);
    }

  }

  function Beat(x, y) {
    this.x = x;
    this.y = y;
    this.count = 0;
    this.f = 0;
  }
  // add relationship between beats to increase the combination possibilities with the objects created.
  // if the only property that defines a new image is the beat value, there is about 48 options in total,
  // triggering them as they appear is ok, but more predictable in comparison to the data viz timeline.
  Beat.prototype.draw = function(v) {
    // grid.ctx.clearRect(0, 0, stage.w, stage.h);
    this.count++;
    grid.ctx.beginPath();
    // grid.ctx.moveTo();
    grid.ctx.arc(this.x, this.y, this.count, 0, 2 * Math.PI);
    grid.ctx.stroke();

    var r = di * rStep;
    grid.ctx.save();
    // grid.ctx.strokeStyle = 'rgba(255, 89, 237, 0.5)';
    grid.ctx.translate(this.x, this.y);
    grid.ctx.rotate(r * Math.PI / 180);
    grid.ctx.moveTo(0, 0);
    grid.ctx.lineTo(0, -this.count);
    grid.ctx.stroke();
    grid.ctx.restore();
  };

})();
