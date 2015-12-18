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
  var taData = {
    raw: [],
    current: []
  };
  var flock = [];
  var eqDataI = 0;
  var taDataI = 0;
  var nextAttack;
  var num = 1555; // 1555 victims from 1988-2012
  var vLimit = 10;
  var animReq;
  var mode = -1;
  var currentX = 0;
  var currentY = 0;
  var TWO_PI = Math.PI * 2;
  var tick = 0;
  var eqReq = new DREQ();
  var taReq = new DREQ();

  // SPRITE
  var img = new Image();
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
  var currentYear = 2003;

  // ASSETS
  var assets = {
    eqData: {
      url: '../../data/ingeominas/eq' + currentYear + '.json',
      update: function() {
        this.url = '../../data/ingeominas/eq' + currentYear + '.json';
      },
      loaded: false
    },
    taData: {
      url: '../../data/cmh/ta.json',
      loaded: false
    },
    birdSprite: {
      url: '../../img/sprites/bird2.png',
      loaded: false
    }
  };
  var assestsLoaded = 0;
  var totalAssets = Object.keys(assets).length;


  /*----------  CREATE CANVAS  ----------*/
  var canvas = document.createElement('canvas');
  var ctx    = canvas.getContext('2d');
  canvas.width  = stageW;
  canvas.height = stageH;
  container.appendChild(canvas);

  yearsListMenu (1993, 2015, currentYear, yearClickEvent, menuReady);

  function menuReady (menu, currentBtn) {
    container.appendChild(menu);
    current = currentBtn;
    currentYear = currentBtn.textContent;
    init();
  }

  function yearClickEvent (event) {
    eqReq.abort(); // Stop any current download, if any.
    loading.style.opacity = 1;
    window.cancelAnimationFrame(animReq);

    ctx.clearRect(0, 0, stageW, stageH);
    currentYear = event.target.textContent;
    resetCurrentClass(current, event.target);
    current = event.target;
    eqDataI = 0;
    taDataI = 0;
    if (assets.taData.loaded) {
      taData.current = taData.raw.hasOwnProperty(currentYear) ? taData.raw[currentYear] : [];
    }
    assestsLoaded--;
    assets.eqData.update();
    init();
    console.log(taData.current);
  }

  function init() {
    eqReq.getD(assets.eqData.url, function (data) {
      eqData = data;
      assets.eqData.loaded = true;
      assestsLoaded++;
    });

    if (!assets.taData.loaded) {
      taReq.getD(assets.taData.url, function (data) {
        taData.raw = data;
        taData.current = data.hasOwnProperty(currentYear) ? data[currentYear] : null;
        nextAttack = taData.current[0].date.unix;
        assets.taData.loaded = true;
        assestsLoaded++;
      });
    }

    if (!assets.birdSprite.loaded) {
      img.onload = function () {
        assestsLoaded++;
        assets.birdSprite.loaded = true;
      };
      img.src = assets.birdSprite.url;
    }

    checkAssetsLoaded();
  }

  function checkAssetsLoaded() {
    if (assestsLoaded === totalAssets) {
      for (var i = 0; i < num; i++) {
        var x = getRandom(-stageH, 0);
        var y = getRandom(0, stageH);
        flock[i] = new Bird(x, y);
      }
      loading.style.opacity = 0;
      animReq = requestAnimationFrame(animate);
    } else {
      animReq = requestAnimationFrame(checkAssetsLoaded);
    }
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

  function animate () {
    if (eqDataI < eqData.length) {
      var d = eqData[eqDataI];

      if (d.ml > 4 || eqDataI === 0) {
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

      if ( nextAttack < Number(d.utc) ) {
        taDataI = (taDataI + 1) > taData.current.length ? taData.current.length : taDataI + 1;
        console.log(taDataI)
        nextAttack = taData.current[taDataI].date.unix;
        mode = 3;
      }

      if (mode > -1) {
        mode -= 0.04;
      } else {
        mode = -1;
      }

      tick++;
      eqDataI++;
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

/**

  TODO:
  - check distance for acceleration of birds if far from objective and slow for closer
  - If mode is positive, make sure birds rotate away.

 */


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