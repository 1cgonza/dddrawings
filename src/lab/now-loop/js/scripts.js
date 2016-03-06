(function() {
  'use strict';
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');

  /*----------  SET STAGE  ----------*/
  var bg      = DDD.canvas(container);
  var stage   = DDD.canvas(container);

  bg.ctx.fillStyle = '#F0E397';
  bg.ctx.fillRect(0, 0, bg.w, bg.h);
  bg.ctx.fillStyle = '#AC5441';
  stage.ctx.strokeStyle = '#F12E2A';

  /*----------  GLOBAL VARIABLES  ----------*/
  var TWO_PI = Math.PI * 2;
  var t = new DDD.Transform();
  var secRadius = stage.h / 3.2 | 0;
  var minRadius = stage.h / 2.8 | 0;
  var hRadius   = stage.h / 2.4 | 0;
  // var angleIncrement = 1.26 * Math.PI / 180; // 2 turns
  var angleIncrement = 0.54 * Math.PI / 180; // 1 turns
  var outerRad = stage.h * 0.30;
  var offY = outerRad / 4;
  var prevMin = -1;
  var prevSec = -1;
  var t1000 = [];
  var t60 = [];
  var t24 = [];
  var date = new Date();
  var years = date.getUTCFullYear() - 1984;
  var months = date.getUTCMonth() + 1;
  var days = date.getUTCDate();
  var yearsCoords = {
    x: stage.center.x - (stage.center.x / 2) | 0,
    y: stage.center.y - (stage.center.y / 2) | 0
  };
  var monthsCoords = {
    x: stage.center.x + (stage.center.x / 2) | 0,
    y: stage.center.y + (stage.center.y / 2) | 0
  };
  var daysCoords = {
    x: stage.center.x + (stage.center.x / 1.5) | 0,
    y: stage.center.y - (stage.center.y / 1.5) | 0
  };

  function animate() {
    var d   = new Date(); // Return date in UTC
    var ms  = d.getMilliseconds();
    var sec = d.getSeconds();
    var min = d.getMinutes();
    var h   = d.getHours();

    msClockSpiral(ms, sec, min, h);
    requestAnimationFrame(animate);
  }

  function msClockSpiral(ms, sec, min, h) {
    /*----------  CLEAR CANVAS  ----------*/
    t.reset();
    setTransformOnCtx(t.m);
    stage.ctx.clearRect(0, 0, stage.w, stage.h);

    /*----------  INIT PATH  ----------*/
    stage.ctx.beginPath();

    /*----------  MOVE TO CENTER  ----------*/
    stage.ctx.moveTo(stage.center.x, stage.center.y + offY);

    /*----------  MILLISECONDS  ----------*/
    setTransformOnCtx(t1000[ms]);
    stage.ctx.lineTo(0, 0);

    /*----------  SECONDS  ----------*/
    setTransformOnCtx(t60[sec]);
    stage.ctx.lineTo(0.5, -secRadius);

    /*----------  MINUTES  ----------*/
    setTransformOnCtx(t60[min]);
    stage.ctx.lineTo(0.5, -minRadius);

    /*----------  HOURS  ----------*/
    setTransformOnCtx(t24[h]);
    stage.ctx.lineTo(0.5, -hRadius);

    t.reset();
    setTransformOnCtx(t.m);

    /*----------  DAYS  ----------*/
    stage.ctx.lineTo(daysCoords.x, daysCoords.y);

    /*----------  MONTHS  ----------*/
    stage.ctx.lineTo(monthsCoords.x, monthsCoords.y);

    /*----------  YEARS  ----------*/
    stage.ctx.lineTo(yearsCoords.x, yearsCoords.y);

    /*----------  DRAW LINE  ----------*/
    // Finally draw the lines.
    stage.ctx.stroke();
  }

  function setTransformOnCtx(tr) {
    stage.ctx.setTransform(tr[0], tr[1], tr[2], tr[3], tr[4], tr[5]);
  }

  function createBackground() {
    var count = 0;
    drawYears();
    drawMonths();
    drawDays();

    while (count < 1000) {
      saveTransforms(count);
      count++;
    }
  }

  function saveTransforms(value) {
    if (value < 24) {
      t.reset();
      t.translateAndRotate(stage.center.x, stage.center.y, (value * 15) * Math.PI / 180);
      t24[value] = getCurrentTranforms();
      drawCircle(hRadius, 3, value);
    }

    if (value < 60) {
      t.reset();
      t.translateAndRotate(stage.center.x, stage.center.y, (value * 6) * Math.PI / 180);
      t60[value] = getCurrentTranforms();
      drawCircle(secRadius, 1, value);
      drawCircle(minRadius, 2, value);
    }

    t.reset();

    var newValue  = value > 500 ? value - 1000 : value;
    var ratio     = newValue / 500;
    var angle     = newValue * angleIncrement;
    var spiralRad = ratio * outerRad;
    var x         = stage.center.x + Math.cos(angle) * spiralRad;
    var y         = stage.center.y + Math.sin(angle) * spiralRad;

    t.translate(x, y + offY);
    t1000[value] = getCurrentTranforms();
    drawMs();
  }

  function getCurrentTranforms() {
    return [t.m[0], t.m[1], t.m[2], t.m[3], t.m[4], t.m[5]];
  }

  function drawCircle(radius, size, value) {
    bg.ctx.setTransform(t.m[0], t.m[1], t.m[2], t.m[3], t.m[4], t.m[5]);
    bg.ctx.fillRect(0, -radius, size, size);
    // bg.ctx.strokeText(value, 0, -radius);
  }

  function drawMs() {
    bg.ctx.setTransform(t.m[0], t.m[1], t.m[2], t.m[3], t.m[4], t.m[5]);
    bg.ctx.fillRect(0, 0, 1, 1);
  }

  function drawYears() {
    bg.ctx.save();
    bg.ctx.translate(yearsCoords.x, yearsCoords.y);
    for (var y = 0; y < years; y++) {
      for (var s = 0; s < 111; s++) {
        bg.ctx.rotate((s + y) * Math.PI / 180);
        bg.ctx.fillRect(s + y | 0, 0, 1, 1);
      }
    }
    bg.ctx.restore();
  }

  function drawMonths() {
    bg.ctx.save();
    bg.ctx.translate(monthsCoords.x, monthsCoords.y);
    for (var i = 1; i < 24; i++) {
      for (var j = 0; j < months; j++) {
        bg.ctx.rotate((i) * Math.PI / 180);
        bg.ctx.fillRect(i * j, 0, 1.5, 1.5);
      }
    }
    bg.ctx.restore();
  }

  function drawDays() {
    for (var i = 1; i < 100; i++) {
      var x = 30 * Math.sin(TWO_PI / i) + daysCoords.x;
      var y = 30 * Math.cos(TWO_PI / i) + daysCoords.y;
      bg.ctx.fillRect(x, y, 1, 1);
    }
  }

  createBackground();
  animate();
  loading.style.opacity = 0;

})();
