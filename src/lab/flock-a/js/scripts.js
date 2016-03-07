(function() {
  'use strict';

  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');

  /*----------  SET STAGE  ----------*/
  var stage = DDD.canvas(container);

  /*----------  GLOBALS  ----------*/
  var eqData = [];
  var taData = {raw: [], current: []};
  var flock = [];
  var eqDataI = 0;
  var taDataI = 0;
  var nextAttack;
  var num = 1555; // 1555 victims from 1988-2012
  var animReq;
  var mode = -1;
  var currentX = 0;
  var currentY = 0;
  var TWO_PI = Math.PI * 2;
  var tick = 0;
  var eqReq = new DDD.DataRequest();
  var taReq = new DDD.DataRequest();

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
  var map = new DDD.Map({
    zoom: 13, width: stage.w, height: stage.h,
    center: {lon: -71.999996, lat: 4.000002}
  });

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

  DDD.html.yearsMenu(1993, 2015, currentYear, yearClickEvent, menuReady);

  function menuReady(menu, currentBtn) {
    container.appendChild(menu);
    current = currentBtn;
    currentYear = currentBtn.textContent;
    init();
  }

  function yearClickEvent(event) {
    eqReq.abort(); // Stop any current download, if any.
    loading.style.opacity = 1;
    window.cancelAnimationFrame(animReq);

    stage.ctx.clearRect(0, 0, stage.w, stage.h);
    currentYear = event.target.textContent;
    DDD.html.resetCurrent(current, event.target);
    current = event.target;
    eqDataI = 0;
    taDataI = 0;
    mode = -1;
    if (assets.taData.loaded) {
      taData.current = taData.raw.hasOwnProperty(currentYear) ? taData.raw[currentYear] : [];
    }
    assestsLoaded--;
    assets.eqData.update();
    init();
  }

  function init() {
    eqReq.json(assets.eqData.url, function(data) {
      eqData = data;
      assets.eqData.loaded = true;
      assestsLoaded++;
    });

    if (!assets.taData.loaded) {
      taReq.json(assets.taData.url, function(data) {
        taData.raw = data;
        taData.current = data.hasOwnProperty(currentYear) ? data[currentYear] : null;
        nextAttack = taData.current[0].date.unix;
        assets.taData.loaded = true;
        assestsLoaded++;
      });
    }

    if (!assets.birdSprite.loaded) {
      img.onload = function() {
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
        var x = DDD.random(-stage.h, 0);
        var y = DDD.random(0, stage.h);
        flock[i] = new Bird(x, y);
      }
      loading.style.opacity = 0;
      animReq = requestAnimationFrame(animate);
    } else {
      animReq = requestAnimationFrame(checkAssetsLoaded);
    }
  }

  function animate() {
    if (eqDataI < eqData.length) {
      var d = eqData[eqDataI];

      if (d.ml > 4 || eqDataI === 0) {
        var coords = map.convertCoordinates(d.lon, d.lat);
        currentX = coords.x + stage.center.x;
        currentY = coords.y + stage.center.y;
      }

      if (tick > 3) {
        var orientationFix = mode === 1 ? Math.PI : 0;
        stage.ctx.clearRect(0, 0, stage.w, stage.h);

        for (var i = 0; i < flock.length; i++) {
          flock[i].update(currentX, currentY);
          flock[i].draw(orientationFix);
        }

        tick = 0;
        stage.ctx.fillRect(currentX, currentY, 5, 5);
      }

      /**
        TODO:
        - Fix dates so both data sets match in time, right now, not all TA are getting triggered on a year play.
       */
      if (taDataI < taData.current.length - 1 && nextAttack < +d.utc) {
        taDataI++;
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

  function Bird(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.mass = DDD.random(20, 30);
    this.orientation = 0;
    this.turnSpeed = TWO_PI / 30;
    this.frameX = DDD.random(0, 13);
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
    stage.ctx.save();
    stage.ctx.translate(this.x, this.y);
    stage.ctx.rotate(this.orientation - r);
    stage.ctx.drawImage(
      img,
      this.frameX * frameW, 0,
      frameW, frameH,
      -offX, -offY,
      frameW, frameH
    );
    stage.ctx.restore();
  };

})();
