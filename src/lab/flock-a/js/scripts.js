flag = 0;
(function () {
  'use strict';

  /*----------  GLOBALS  ----------*/
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');
  var stageW = window.innerWidth;
  var stageH = window.innerHeight;
  var centerX = stageW / 2  | 0;
  var centerY = stageH / 2 | 0;
  var eqData = [];
  var flock = [];
  var dataI = 0;
  var num = 1555; // 1555 victims from 1988-2012
  var vLimit = 10;
  var animReq;
  var mode = -1;
  var currentX = 0;
  var currentY = 0;
  var TWO_PI = Math.PI * 2;
  var tick = 0;

  // Sprite
  var img = new Image();
  var imgLoaded = false;
  var cols = 14;
  var rows = 1;
  var imgW = 614;
  var imgH = 50;
  var offX = 25;
  var offY = 25;
  var frameW = Math.round(imgW / cols);
  var frameH = Math.round(imgH / rows);

  // MAP
  var zoom = 13;
  var mapCenter = convertCoordinates(-71.999996, 4.000002);

  // MENU
  var current;
  var currentYear;

  /*----------  CREATE CANVAS  ----------*/
  var canvas = document.createElement('canvas');
  var ctx    = canvas.getContext('2d');
  canvas.width  = stageW;
  canvas.height = stageH;
  container.appendChild(canvas);

  yearsListMenu (1993, 2015, 2003, yearClickEvent, menuReady);

  function menuReady (menu, currentBtn) {
    container.appendChild(menu);
    current = currentBtn;
    currentYear = currentBtn.textContent;
    init();
  }

  function yearClickEvent (event) {
    window.cancelAnimationFrame(animReq);
    ctx.clearRect(0, 0, stageW, stageH);
    currentYear = event.target.textContent;

    resetCurrentClass(current, event.target);
    current = event.target;

    init();
  }

  function init() {
    requestData('../../data/ingeominas/eq' + currentYear + '.json', processEQData);
  }

  function convertCoordinates (lon, lat) {
    var zoomX = stageW * zoom;
    var zoomY = centerY * zoom;
    var latRad = Number(lat) * Math.PI / 180;
    var mercatorN = Math.log( Math.tan( (Math.PI / 4 ) + (latRad / 2) ) );
    var x = (Number(lon) + 180) * (zoomX / 360);
    var y = (zoomY - (zoomX * mercatorN / (Math.PI * 2) ) );

    if (mapCenter) {
      x -= mapCenter.x;
      y -= mapCenter.y;
    }

    return {x: x | 0, y: y | 0};
  }

  function processEQData (data) {
    eqData = data;

    for (var i = 0; i < num; i++) {
      var x = getRandom(-stageH, 0);
      var y = getRandom(0, stageH);
      flock[i] = new Bird(x, y);
    }

    if (!imgLoaded) {
      img.onload = imageReady;
      img.src = '../../img/sprites/bird2.png';
    }
  }

  function imageReady () {
    animReq = requestAnimationFrame(animate);
    loading.style.opacity = 0;
  }

  function animate () {
    if (dataI < eqData.length) {
      var d = eqData[dataI];

      if (d.ml > 4) {
        var coords = convertCoordinates(d.lon, d.lat);
        currentX = coords.x + centerX;
        currentY = coords.y + centerY;

      }

      if (tick > 3) {
        var orientationFix = mode === 1 ? Math.PI : 0;
        ctx.clearRect(0, 0, stageW, stageH);
        for (var i = 0; i < flock.length; i++) {
          flock[i].update(currentX, currentY);
          flock[i].draw(orientationFix);
        }
        tick = 0;
        ctx.fillRect(currentX, currentY, 5, 5);
      }
      tick++;

      dataI++;
      animReq = requestAnimationFrame(animate);
    } else {
      window.cancelAnimationFrame(animReq);
    }
  }

  function Bird (x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.mass = getRandom(20, 30);
    this.orientation = 0;
    this.turnSpeed = TWO_PI / 30;
    this.frameX = getRandom(0, 13);
  }

  Bird.prototype.update = function(tx, ty) {
    var dx = this.x - tx;
    var dy = this.y - ty;
    // var distance = Math.pow(dx, 2) + Math.pow(dy, 2);
    var theta = Math.atan2(dy, dx);
    var delta = theta - this.orientation;
    var deltaAbs = Math.abs(delta);

    if (deltaAbs > Math.PI) {
      delta = deltaAbs - TWO_PI;
    }

    if (delta !== 0) {
      var dir = delta / deltaAbs;
      this.orientation += dir * Math.min(this.turnSpeed, deltaAbs);
    }

    this.orientation %= TWO_PI;

    this.ax = this.mass * mode + 0.05;
    this.ay = (this.mass / 3) * mode;
    this.x += Math.cos(this.orientation) * this.ax;
    this.y += Math.sin(this.orientation) * this.ay;

    this.frameX++;

    if (this.frameX >= 14) {
      this.frameX = 0;
    }
  };

  Bird.prototype.draw = function(r) {
    ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.orientation - r);
      ctx.drawImage(
        img,
        this.frameX * frameW, 0,
        frameW, frameH,
        -offX, -offY,
        frameW, frameH
      );
    ctx.restore();
  };

})();