(function() {
  'use strict';

  var violenceReq = new DDD.DataRequest();
  var mapReq      = new DDD.DataRequest();

  /*----------  STAGE  ----------*/
  var container = document.getElementById('ddd-container');
  var loading = document.createElement('div');
  var bg    = DDD.canvas(container);
  var stage = DDD.canvas(container);
  var log   = DDD.canvas(container);

  loading.className = 'loading';
  bg.center.y = stage.center.y = bg.h / 1.5 | 0;
  container.appendChild(loading);

  /*----------  DATA  ----------*/
  var year   = 2009;
  var bodies = [];
  var d      = [];
  var geoD   = [];
  var dLoaded   = false;
  var geoLoaded = false;

  /*----------  ANIMATION  ----------*/
  var animReq;
  var dataI = 0;
  var hold  = 4;
  var tick  = 0;

  /*----------  MAP  ----------*/
  var map = new DDD.Map({
    zoom: 8,
    width: stage.w,
    height: stage.h,
    center: {lon: -71.999996, lat: 4.000002}
  });

  /*----------  TIME  ----------*/
  var prevTimePosition = 0;

  // Set dates range as ISO 8601 YYYY-MM-DDThh:mm:ss
  var dIni = Date.parse(year + '/01/01 00:00:00') / 1000;
  var dEnd = Date.parse(year + 1 + '/01/01 00:00:00') / 1000;

  /*----------  SPRITES  ----------*/
  var imgsLoaded = 0;
  var imgs = [
    {
      key: 'lines',
      options: {
        src: '/img/assets/sprites/lines-01-small.png',
        w: 295,
        h: 150,
        cols: 21,
        rows: 1,
        offX: 4,
        offY: 1
      }
    },
    {
      key: 'shadows',
      options: {
        src: '/img/assets/sprites/shadows-sprite.png',
        w: 318,
        h: 300,
        cols: 3,
        rows: 8,
        offX: 55,
        offY: 14
      }
    },
    {
      key: 'levit',
      options: {
        src: '/img/assets/sprites/levit.png',
        w: 3279,
        h: 165,
        cols: 30,
        rows: 1,
        offX: 68,
        offY: 161
      }
    }
  ];

  /*----------  MENU  ----------*/
  var current;
  DDD.yearsMenu(2008, 2016, year, yearClickEvent, menuReady);

  function yearClickEvent(event) {
    if (event.target !== current) {
      window.cancelAnimationFrame(animReq);
      loading.innerHTML = '';
      loading.style.opacity = 1;
      DDD.resetCurrent(current, event.target);
      violenceReq.abort();
      current = event.target;
      year = event.target.textContent;

      reloadStage();
    }
  }

  function menuReady(menu, currentFirst) {
    container.appendChild(menu);
    current = currentFirst;
  }

  function reloadStage() {
    dataI = 0;
    bodies = [];
    d = [];
    dLoaded = false;
    prevTimePosition = 0;
    dIni = Date.parse(year + '/01/01 00:00:00') / 1000;
    dEnd = Date.parse(year + 1 + '/01/01 00:00:00') / 1000;

    stage.ctx.clearRect(0, 0, stage.w, stage.h);
    log.ctx.clearRect(0, 0, log.w, log.h);
    bg.ctx.clearRect(0, 0, bg.w, bg.h);

    requestViolenceData();
    checkAssetsLoaded();
  }

  function requestViolenceData() {
    violenceReq.json({
      url: '../../data/monitor/violencia-' + year + '.json',
      container: container,
      loadingMsg: 'Loading Violence Data',
      loadingEle: loading
    })
    .then(function(res) {
      d = res.data;
      dLoaded = true;
    })
    .catch(function(err) {
      console.error(err);
    });
  }

  function init() {
    bg.ctx.globalCompositeOperation = 'darken';
    bg.ctx.fillStyle = 'white';

    requestViolenceData();
    mapReq.json({
      url: '../../data/geo/col-50m.json',
      container: container,
      loadingMsg: 'Loading Map Data',
      loadingEle: loading
    })
    .then(function(data) {
      geoD = data.coordinates;
      geoLoaded = true;
    })
    .catch(function(err) {
      console.error(err);
    });

    for (var i = 0; i < imgs.length; i++) {
      var sprite = new Sprite(imgs[i].options);
      sprite.img.onload = imgLoaded;
      sprite.img.src = sprite.src;
      window[imgs[i].key] = sprite;
    }

    checkAssetsLoaded();
  }

  function checkAssetsLoaded() {
    if (imgsLoaded === imgs.length && dLoaded && geoLoaded) {
      drawMap();
      animate();
    } else {
      animReq = requestAnimationFrame(checkAssetsLoaded);
    }
  }

  function imgLoaded() {
    imgsLoaded++;
  }

  function drawMap() {
    for (var i = 0; i < geoD.length; i++) {
      var poly = geoD[i];

      bg.ctx.beginPath();
      for (var l = 0; l < poly.length; l++) {
        var layer = poly[l];

        for (var n = 0; n < layer.length; n++) {
          var node = layer[n];
          var coords = map.convertCoordinates(node[0], node[1]);

          bg.ctx.save();
          bg.ctx.translate(bg.center.x, bg.center.y);
          bg.ctx.drawImage(
            lines.img,
            DDD.random(0, lines.cols) * lines.fw, 0,
            lines.fw, lines.fh,
            coords.x - lines.offX, coords.y - lines.offY,
            lines.fw, lines.fh
          );

          if (n === 0) {
            bg.ctx.moveTo(coords.x, coords.y);
          } else {
            bg.ctx.lineTo(coords.x, coords.y);
          }

          bg.ctx.restore();

        }
      }
      bg.ctx.closePath();

      bg.ctx.globalCompositeOperation = 'source-over';
      bg.ctx.fill();
    }
  }

  function animate() {
    if (dataI < d.length - 1) {
      if (tick === hold) {
        draw(dataI);
        tick = 0;
      }
      dataI++;
      tick++;
      animReq = requestAnimationFrame(animate);
    } else {
      window.cancelAnimationFrame(animReq);
    }
  }

  function debug() {
    for (var i = 0; i < d.length; i++) {
      draw(i);
    }
  }

  function draw(i) {
    var e = d[i];
    if (e.hasOwnProperty('vTotal') && e.hasOwnProperty('cat') && e.cat.indexOf('Homicidio') >= 0) {
      var total = d[i].vTotal;
      var date = d[i].fecha.unix;
      var elapsed = ((date - dIni) / 31536000) * stage.w;

      log.ctx.beginPath();
      log.ctx.moveTo(prevTimePosition, 0);
      log.ctx.lineTo(elapsed - (elapsed - prevTimePosition) / 2, total * 3);
      log.ctx.lineTo(elapsed, 0);
      log.ctx.stroke();
      prevTimePosition = elapsed;

      if ('lon' in e && 'lat' in e) {
        var coords = map.convertCoordinates(e.lon, e.lat);
        var fx = DDD.random(0, shadows.cols);
        var fy;

        for (var t = 0; t < total; t++) {
          var seq = new Levit(coords, t);
          bodies.push(seq);
        }

        bg.ctx.save();
        bg.ctx.translate(bg.center.x, bg.center.y);

        if (total > 0 && total === 1) {
          fy = 0;
        } else if (total <= 8) {
          fy = total;
        } else {
          fy = 8;
        }
        bg.ctx.globalCompositeOperation = 'source-atop';
        bg.ctx.drawImage(
          shadows.img,
          fx * shadows.fw, fy * shadows.fh,
          shadows.fw, shadows.fh,
          coords.x - shadows.offX, coords.y - shadows.offY,
          shadows.fw, shadows.fh
        );

        bg.ctx.restore();
      }
    }

    if (bodies.length > 0) {
      stage.ctx.save();
      stage.ctx.globalCompositeOperation = 'source-over';
      stage.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      stage.ctx.fillRect(0, 0, stage.w, stage.h);
      stage.ctx.restore();
      stage.ctx.drawImage(bg.canvas, 0, 0);

      for (var n = 0; n < bodies.length; n++) {
        if (!bodies[n].finished) {
          bodies[n].draw();
        }
      }
    }
  }

  /*===============================
  =            CLASSES            =
  ===============================*/
  /*----------  SPRITE  ----------*/
  var Sprite = function(op) {
    this.img = new Image();
    this.src = op.src;
    this.w = op.w;
    this.h = op.h;
    this.cols = op.cols;
    this.rows = op.rows;
    this.offX = op.offX;
    this.offY = op.offY;
    this.fw = this.w / this.cols | 0;
    this.fh = this.h / this.rows | 0;
  };

  /*----------  LEVIT  ----------*/
  function Levit(coords, num) {
    this.x = coords.x;
    this.y = coords.y;
    this.frameX = 0;
    this.finished = false;
    this.r = -num;
    this.forward = true;
    this.pushY = 0;
    this.count = 0;
  }

  Levit.prototype.draw = function() {
    if (this.count < levit.cols * 2) {
      if (!this.forward) {
        this.pushY += levit.fh / 15;
      }
      stage.ctx.save();
      stage.ctx.translate(stage.center.x, stage.center.y);
      stage.ctx.rotate(this.r * Math.PI / 20);
      stage.ctx.drawImage(
        levit.img,
        this.frameX * levit.fw, 0,
        levit.fw, levit.fh,
        this.x - levit.offX, this.y - levit.offY - this.pushY,
        levit.fw, levit.fh
      );
      stage.ctx.restore();

      if (this.forward) {
        this.frameX++;
      } else {
        this.frameX--;
      }
      this.count++;

      if (this.frameX === levit.cols - 1) {
        this.forward = false;
      }
    } else {
      this.del();
    }
  };

  Levit.prototype.del = function() {
    this.finished = true;
  };

  /*=====  End of CLASSES  ======*/

  init();
})();
