(function () {
  'use strict';
  var loaded    = false;
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');
  var t = new Transform();

  /*==========  CREATE CANVAS  ==========*/
  var canvas = document.createElement('canvas');
  var back = document.createElement('canvas');
  var ctx    = canvas.getContext('2d');
  var bCtx = back.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  back.width = canvas.width;
  back.height = canvas.height;
  var centerX = canvas.width / 2 | 0;
  var centerY = canvas.height / 2 | 0;

  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  back.style.position = 'absolute';
  back.style.top = '0';
  bCtx.fillStyle = '#F0E397';
  bCtx.fillRect(0, 0, canvas.width, canvas.height);
  // bCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  bCtx.fillStyle = '#AC5441';
  ctx.strokeStyle = '#F12E2A';

  /*----------  GLOBAL VARIABLES  ----------*/
  var secRadius = canvas.height / 3.2 | 0;
  var minRadius = canvas.height / 2.8 | 0;
  var hRadius   = canvas.height / 2.4 | 0;
  // var angleIncrement = 1.26 * Math.PI / 180; // 2 turns
  var angleIncrement = 0.54 * Math.PI / 180; // 1 turns
  var outerRad = canvas.height * 0.30;
  var offY = outerRad / 4;
  var prevMin = -1;
  var prevSec = -1;
  var t1000 = [];
  var t60 = [];
  var t24 = [];
  var backFontSize = 10;
  var date = new Date();
  var years = date.getUTCFullYear() - 1984;
  var months = date.getUTCMonth() + 1;
  var days = date.getUTCDate();
  var yearsCoords = {
    x: centerX - (centerX / 2) | 0,
    y: centerY - (centerY / 2) | 0
  };
  var monthsCoords = {
    x: centerX + (centerX / 2) | 0,
    y: centerY + (centerY / 2) | 0
  };
  var daysCoords = {
    x: centerX + (centerX / 1.5) | 0,
    y: centerY - (centerY / 1.5) | 0
  };

  container.appendChild(back);
  container.appendChild(canvas);

  function animate () {
    var d   = new Date(); // Return date in UTC
    var ms  = d.getMilliseconds();
    var sec = d.getSeconds();
    var min = d.getMinutes();
    var h   = d.getHours();

    msClockSpiral(ms, sec, min, h);
    requestAnimationFrame(animate);
  }

  function msClockSpiral (ms, sec, min, h) {
    /*----------  CLEAR CANVAS  ----------*/
    t.reset();
    setTransformOnCtx(t.m);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /*----------  INIT PATH  ----------*/
    ctx.beginPath();

    /*----------  MOVE TO CENTER  ----------*/
    ctx.moveTo(centerX, centerY + offY);

    /*----------  MILLISECONDS  ----------*/
    setTransformOnCtx(t1000[ms]);
    ctx.lineTo(0, 0);

    /*----------  SECONDS  ----------*/
    setTransformOnCtx(t60[sec]);
    ctx.lineTo(0.5, -secRadius);

    /*----------  MINUTES  ----------*/
    setTransformOnCtx(t60[min]);
    ctx.lineTo(0.5, -minRadius);

    /*----------  HOURS  ----------*/
    setTransformOnCtx(t24[h]);
    ctx.lineTo(0.5, -hRadius);

    t.reset();
    setTransformOnCtx(t.m);

    /*----------  DAYS  ----------*/
    ctx.lineTo( daysCoords.x, daysCoords.y );

    /*----------  MONTHS  ----------*/
    ctx.lineTo( monthsCoords.x, monthsCoords.y );

    /*----------  YEARS  ----------*/
    ctx.lineTo( yearsCoords.x, yearsCoords.y );

    /*----------  DRAW LINE  ----------*/
    // Finally draw the lines.
    ctx.stroke();
  }

  function setTransformOnCtx (tr) {
    ctx.setTransform( tr[0], tr[1], tr[2], tr[3], tr[4], tr[5] );
  }

  function createBackground () {
    var count = 0;
    drawYears();
    drawMonths();
    drawDays();

    while (count < 1000) {
      saveTransforms(count);
      count++;
    }
  }

  function saveTransforms (value) {
    if (value < 24) {
      t.reset();
      t.translateAndRotate(centerX, centerY, (value * 15) * Math.PI / 180);
      t24[value] = getCurrentTranforms();
      drawCircle(hRadius, 3, value);
    }

    if (value < 60) {
      t.reset();
      t.translateAndRotate(centerX, centerY, (value * 6) * Math.PI / 180);
      t60[value] = getCurrentTranforms();
      drawCircle(secRadius, 1, value);
      drawCircle(minRadius, 2, value);
    }

    t.reset();

    var newValue = value > 500 ? value - 1000 : value;
    var ratio     = newValue / 500;
    var angle     = newValue * angleIncrement;
    var spiralRad = ratio * outerRad;
    var x         = centerX + Math.cos(angle) * spiralRad;
    var y         = centerY + Math.sin(angle) * spiralRad;

    t.translate(x, y + offY);
    t1000[value] = getCurrentTranforms();
    drawMs();
  }

  function getCurrentTranforms () {
    return [t.m[0], t.m[1], t.m[2], t.m[3], t.m[4], t.m[5]];
  }

  function drawCircle (radius, size, value) {
    bCtx.setTransform( t.m[0], t.m[1], t.m[2], t.m[3], t.m[4], t.m[5] );
    bCtx.fillRect(0, -radius, size, size);
    // bCtx.strokeText(value, 0, -radius);
  }

  function drawMs () {
    bCtx.setTransform( t.m[0], t.m[1], t.m[2], t.m[3], t.m[4], t.m[5] );
    bCtx.fillRect(0, 0, 1, 1);
  }

  function drawYears () {
    bCtx.save();
      bCtx.translate( yearsCoords.x, yearsCoords.y );
      for (var y = 0; y < years; y++) {
        for (var s = 0; s < 111; s++) {
          bCtx.rotate((s + y) * Math.PI / 180);
          bCtx.fillRect(s + y | 0, 0, 1, 1);
        }
      }
    bCtx.restore();
  }

  function drawMonths () {
    bCtx.save();
      bCtx.translate( monthsCoords.x, monthsCoords.y );
      for (var i = 1; i < 24; i++) {
        for (var j = 0; j < months; j++) {
          bCtx.rotate((i) * Math.PI / 180);
          bCtx.fillRect(i * j, 0, 1.5, 1.5);
        }
      }
    bCtx.restore();
  }

  function drawDays () {
    var TWO_PI = Math.PI * 2;

    for (var i = 1; i < 100; i++) {
      var x = 30 * Math.sin( TWO_PI / i ) + daysCoords.x;
      var y = 30 * Math.cos( TWO_PI / i ) + daysCoords.y;
      bCtx.fillRect(x, y, 1, 1);
    }
  }

  createBackground();
  animate();
  loading.style.opacity = 0;

})();
