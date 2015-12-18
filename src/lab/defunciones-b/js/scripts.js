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
  var centerY   = stageH / 2 | 0;

  /*----------  DATA  ----------*/
  var year   = 2008;
  var d      = [];
  var rain   = [];
  var dLoaded   = false;

  /*----------  ANIMATION  ----------*/
  var animReq;
  var dataI = 0;
  var hold  = 1;
  var tick  = 0;

  /*----------  MAP  ----------*/
  var colCenter = [-71.999996,4.000002];
  var mapZ = 8;
  var mapCenter = convertCoordinates(colCenter[0], colCenter[1], mapZ);

  /*----------  CANVAS  ----------*/
  var bg = createCanvas(container);
  var stage = createCanvas(container);

  /*----------  MENU  ----------*/
  var current;
  yearsListMenu(2008, 2015, year, yearClickEvent, menuReady);

  /*=====  End of GLOBALS  ======*/

  /*============================
  =            MENU            =
  ============================*/
  function menuReady (menu, currentFirst) {
    container.appendChild(menu);
    current = currentFirst;
  }

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

  /*=====  End of MENU  ======*/

  function reloadStage () {
    dataI = 0;
    d      = [];
    dLoaded   = false;

    bg.ctx.clearRect(0, 0, stageW, stageH);
    stage.ctx.clearRect(0, 0, stageW, stageH);

    requestViolenceData();
    checkAssetsLoaded();
  }

  function requestViolenceData () {
    requestData('../../data/monitor/violencia-geo-' + year + '.json', processViolenceData);
  }

  function processViolenceData (data) {
    d = data;
    dLoaded = true;
  }

  function init () {
    requestViolenceData();
    checkAssetsLoaded();
  }

  function checkAssetsLoaded () {
    if (dLoaded) {
      animate();
      loading.style.opacity = 0;
    } else {
      animReq = requestAnimationFrame(checkAssetsLoaded);
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

      if ('lon' in e && 'lat' in e) {
        var coords = convertCoordinates(e.lon, e.lat, mapZ);

        for (var t = 0; t < total; t++) {
          var drop = new Drop(coords.x  + centerX, coords.y  + centerY);
          rain.push(drop);
        }

      }
    }

    if (rain.length > 0) {
      stage.ctx.clearRect(0, 0, stageW, stageH);

      for (var j = 0; j < rain.length; j++) {
        var node = rain[j];

        if (node.alive) {
          if (node.mode === 1) {
            node.fall();
          }
          else if (node.mode === 2) {
            node.ripple();
          }
        } else {
          // rain.splice(j, 1);
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
  function Drop (x, y) {
    this.x = x;
    this.y = 0;
    this.dy = y;
    this.dx = x;
    this.alive = true;
    this.rippleR = y / 3;
    this.r = 3;
    this.mode = 1;
  }

  Drop.prototype.fall = function() {
    if (this.y >= this.dy) {
      this.mode++;
    } else {
      this.y += 3;
      stage.ctx.fillRect(this.x, this.y, 3, 9);
    }
  };

  Drop.prototype.ripple = function() {
    if (this.r >= this.rippleR) {
      this.alive = false;
    } else {
      this.r++;
      stage.ctx.save();
      stage.ctx.translate(this.dx, this.dy);
      stage.ctx.scale(2, 1);
      stage.ctx.beginPath();
      stage.ctx.arc(0, 0, this.r, 0, 2 * Math.PI);
      stage.ctx.restore();
      stage.ctx.stroke();
    }
  };
  /*=====  End of CLASSES  ======*/

  init();
})();