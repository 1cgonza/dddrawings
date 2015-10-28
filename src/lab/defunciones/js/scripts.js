(function () {
  'use strict';
  /*===============================
  =            GLOBALS            =
  ===============================*/

  /*----------  STAGE  ----------*/
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');
  var stageW    = window.innerWidth;
  var stageH    = window.innerHeight;
  var centerX   = stageW / 2 | 0;
  var centerY   = stageH / 1.5 | 0;

  /*----------  DATA  ----------*/
  var years  = [2008, 2009, 2010, 2012];
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
  var colCenter = [-71.999996,4.000002];
  var mapZ = 8;
  var mapCenter = convertCoordinates(colCenter[0], colCenter[1], mapZ);

  /*----------  TIME  ----------*/
  var prevTimePosition = 0;
  // var today = Date.now();
  // var colOffset = 60 * 5000;

  // Set dates range as ISO 8601 YYYY-MM-DDThh:mm:ss
  var dIni = moment.tz(year + '-01-01T00:00:00', 'America/Bogota');
  var dEnd = moment.tz(year + '-12-31T12:59:59', 'America/Bogota');

  /*----------  SPRITES  ----------*/
  var imgsLoaded = 0;
  var imgs = [
    {
      key: 'lines',
      options: {
        // src: '../../img/sprites/lines-01-large.png',
        // w: 2877,
        // h: 1461,
        // cols: 21,
        // rows: 1,
        // offX: 43,
        // offY: 15
        // src: '../../img/sprites/lines-01-med.png',
        // w: 985,
        // h: 500,
        // cols: 21,
        // rows: 1,
        // offX: 14,
        // offY: 5
        src: '../../img/sprites/lines-01-small.png',
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
        src: '../../img/sprites/shadows-sprite.png',
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
        src: '../../img/sprites/levit.png',
        w: 3279,
        h: 165,
        cols: 30,
        rows: 1,
        offX: 68,
        offY: 161
      }
    }
  ];

  /*----------  CANVAS  ----------*/
  var bg = createCanvas(container, {
    w: stageW,
    h: stageH
  });

  var stage = createCanvas(container, {
    w: stageW,
    h: stageH,
  });

  var log = createCanvas(container, {
    w: stageW,
    h: stageH
  });

  /*----------  MENU  ----------*/
  var current;
  yearsListMenu(2008, 2015, year, yearClickEvent, menuReady);

  function yearClickEvent (event) {
    if (event.target !== current) {
      window.cancelAnimationFrame(animReq);
      loading.style.opacity = 1;
      resetCurrentClass(current, event.target);
      current = event.target;
      year = event.target.textContent;

      reloadStage();
    }
  }

  function menuReady (menu, currentFirst) {
    container.appendChild(menu);
    current = currentFirst;
  }

  /*=====  End of GLOBALS  ======*/

  function reloadStage () {
    dataI = 0;
    bodies = [];
    d      = [];
    dLoaded   = false;
    prevTimePosition = 0;
    dIni = moment.tz(year + '-01-01T00:00:00', 'America/Bogota');
    dEnd = moment.tz(year + '-12-31T12:59:59', 'America/Bogota');

    stage.ctx.clearRect(0, 0, stageW, stageH);
    log.ctx.clearRect(0, 0, stageW, stageH);
    bg.ctx.clearRect(0, 0, stageW, stageH);

    requestViolenceData();
    checkAssetsLoaded();
  }

  function requestViolenceData () {
    requestData('../../data/monitor/violencia-geo-' + year + '.json', processViolenceData);
  }

  function init () {
    // stage.ctx.globalCompositeOperation = 'darken';
    bg.ctx.globalCompositeOperation = 'darken';
    bg.ctx.fillStyle = 'white';

    requestViolenceData();
    requestData('../../data/geo/col-50m.json', processGeoData);

    for (var i = 0; i < imgs.length; i++) {
      var sprite = new Sprite(imgs[i].options);
      sprite.img.onload = imgLoaded;
      sprite.img.src = sprite.src;
      window[imgs[i].key] = sprite;
    }

    checkAssetsLoaded();
  }

  function checkAssetsLoaded () {
    if (imgsLoaded === imgs.length && dLoaded && geoLoaded) {
      drawMap();
      animate();
      loading.style.opacity = 0;
    } else {
      animReq = requestAnimationFrame(checkAssetsLoaded);
    }
  }

  function imgLoaded () {
    imgsLoaded++;
  }

  function processViolenceData (data) {
    d = data;
    dLoaded = true;
  }

  function processGeoData (data) {
    geoD = data.coordinates;
    geoLoaded = true;
  }

  function drawMap () {
    for (var i = 0; i < geoD.length; i++) {
      var poly = geoD[i];

      bg.ctx.beginPath();
      for (var l = 0; l < poly.length; l++) {
        var layer = poly[l];

        for (var n = 0; n < layer.length; n++) {
          var node = layer[n];
          var coords = convertCoordinates(node[0], node[1], mapZ);

          bg.ctx.save();
            bg.ctx.translate(centerX, centerY);
            bg.ctx.drawImage(
              lines.img,
              getRandom(0, lines.cols) * lines.fw, 0,
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

  function animate () {
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

  function draw (i) {
    var e = d[i];
    if ('total_v' in e && 'cat' in e && e.cat.indexOf('Homicidio') >= 0) {
      var total = Number(d[i].total_v);
      var date = moment.tz(d[i].fecha_ini, 'America/Bogota');
      var elapsed = ( (date - dIni) / 31536000000) * stageW;

      log.ctx.beginPath();
      log.ctx.moveTo(prevTimePosition, 0);
      log.ctx.lineTo(elapsed - (elapsed - prevTimePosition) / 2, total * 3);
      log.ctx.lineTo(elapsed, 0);
      log.ctx.stroke();
      prevTimePosition = elapsed;

      if ('lon' in e && 'lat' in e) {
        var coords = convertCoordinates(e.lon, e.lat, mapZ);
        for (var t = 0; t < total; t++) {
          var seq = new Levit(coords, t);
          bodies.push(seq);
        }

        bg.ctx.save();
          bg.ctx.translate(centerX, centerY);
          // bg.ctx.beginPath();
          // bg.ctx.arc(coords.x, coords.y, total, 0, 2 * Math.PI);
          // bg.ctx.fill();
          var fx = getRandom(0, shadows.cols);
          var fy;
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
      // stage.ctx.clearRect(0, 0, stageW, stageH);
      stage.ctx.save();
        stage.ctx.globalCompositeOperation = 'source-over';
        stage.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        // stage.ctx.fillStyle = 'rgba(255, 255, 140, 0.8)';
        stage.ctx.fillRect(0, 0, stageW, stageH);
      stage.ctx.restore();
      stage.ctx.drawImage(bg.canvas, 0, 0);

      for (var n = 0; n < bodies.length; n++) {
        if (!bodies[n].finished) {
          bodies[n].draw();
        }
      }
    }
  }

  function convertCoordinates (lon, lat, zoom) {
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

  /*===============================
  =            CLASSES            =
  ===============================*/
  /*----------  SPRITE  ----------*/
  var Sprite = function (op) {
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
  function Levit (coords, num) {
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
      if (!this.forward) this.pushY += levit.fh / 15;
      stage.ctx.save();
        stage.ctx.translate(centerX, centerY);
        stage.ctx.rotate(this.r * Math.PI / 20);
        // stage.ctx.beginPath();
        // stage.ctx.arc(this.x, this.y - this.frameX * 3, this.frameX, 0, 2 * Math.PI);
        // stage.ctx.stroke();
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
      if (this.frameX === levit.cols - 1) this.forward = false;
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