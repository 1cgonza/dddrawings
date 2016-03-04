(function() {
  'use strict';

  var violenceReq = new DDD.DataRequest();
  var mapReq      = new DDD.DataRequest();

  /*----------  STAGE  ----------*/
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');

  var stage = DDD.canvas(container);
  var log   = DDD.canvas(container);

  /*----------  DATA  ----------*/
  var year   = 2009;
  var rain = [];
  var d      = [];
  var geoD   = [];
  var dLoaded   = false;
  var geoLoaded = false;

  /*----------  ANIMATION  ----------*/
  var animReq;
  var dataI = 0;
  var hold  = 1;
  var tick  = 0;

  /*----------  MAP  ----------*/
  var map = new DDD.Map({zoom: 8, width: stage.w, height: stage.h, center: {lon: -71.999996, lat: 4.000002}});

  /*----------  TIME  ----------*/
  var prevTimePosition = 0;

  // Set dates range as ISO 8601 YYYY-MM-DDThh:mm:ss
  var dIni = moment.tz(year + '-01-01T00:00:00', 'America/Bogota');
  var dEnd = moment.tz(year + '-12-31T12:59:59', 'America/Bogota');

  /*----------  MENU  ----------*/
  var current;
  DDD.yearsMenu(2008, 2015, year, yearClickEvent, menuReady);

  function yearClickEvent(event) {
    if (event.target !== current) {
      window.cancelAnimationFrame(animReq);
      loading.style.opacity = 1;
      DDD.resetCurrent(current, event.target);
      current = event.target;
      year = event.target.textContent;

      reloadStage();
    }
  }

  function menuReady(menu, currentFirst) {
    container.appendChild(menu);
    current = currentFirst;
    requestViolenceData();
  }

  function reloadStage() {
    dataI = 0;
    rain = [];
    d      = [];
    dLoaded   = false;
    prevTimePosition = 0;
    dIni = moment.tz(year + '-01-01T00:00:00', 'America/Bogota');
    dEnd = moment.tz(year + '-12-31T12:59:59', 'America/Bogota');

    stage.ctx.clearRect(0, 0, stage.w, stage.h);
    log.ctx.clearRect(0, 0, log.w, log.h);

    requestViolenceData();
  }

  function requestViolenceData() {
    violenceReq.getD('../../data/monitor/violencia-geo-' + year + '.json', function(data) {
      d = data;
      dLoaded = true;
      loading.style.opacity = 0;
      animate();
    });
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
    if ('total_v' in e && 'cat' in e && e.cat.indexOf('Homicidio') >= 0) {
      var total = Number(d[i].total_v);
      var date = moment.tz(d[i].fecha_ini, 'America/Bogota');
      var elapsed = ((date - dIni) / 31536000000) * stage.w;

      log.ctx.beginPath();
      log.ctx.moveTo(prevTimePosition, 0);
      log.ctx.lineTo(elapsed - (elapsed - prevTimePosition) / 2, total * 3);
      log.ctx.lineTo(elapsed, 0);
      log.ctx.stroke();
      prevTimePosition = elapsed;

      if ('lon' in e && 'lat' in e) {
        var coords = map.convertCoordinates(e.lon, e.lat);

        for (var t = 0; t < total; t++) {
          var drop = new Drop(coords.x + stage.center.x, coords.y + stage.center.y);
          rain.push(drop);
        }
      }
    }

    if (rain.length > 0) {
      stage.ctx.clearRect(0, 0, stage.w, stage.h);

      for (var j = 0; j < rain.length; j++) {
        var node = rain[j];

        if (node.alive) {
          if (node.mode === 1) {
            node.fall();
          } else if (node.mode === 2) {
            node.ripple();
          }
        } else {
          // rain.splice(j, 1);
        }
      }
    }
  }

  /*===============================
  =            CLASSES            =
  ===============================*/
  function Drop(x, y) {
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

})();
