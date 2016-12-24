(function() {
  'use strict';

  /*----------  GLOBALS  ----------*/
  var animReq;
  var currentYear;
  var year         = 2003;
  var seismicData  = [];
  var seismicDataI = 0;
  var taData       = [];
  var taDataI      = 0;
  var taTime;
  var taDataLoaded = false;
  var tick         = 0;
  var PI           = Math.PI;
  var HALF_PI      = PI / 2;
  var TWO_PI       = PI * 2;
  var _neighborhoodRadius = 200;
  var _maxSpeed = DDD.random(6, 10, true);

  var oReq     = new DDD.DataRequest();
  var stageW   = window.innerWidth;
  var stageH   = window.innerHeight;
  var currentX = 0;
  var currentY = 0;
  var currentZ = 200;
  var centerX  = stageW / 2 | 0;
  var centerY  = stageH / 2 | 0;
  var target   = new DDD.Vector();
  var end;

  var assetsLoaded = 0;

  var imgData = {
    cb: imgReady,
    url: '/img/sprites/rotating_triangle.png',
    frames: [
      {x: 0, y: 0, w: 41, h: 50},
      {x:  41, y: 0, w: 41, h: 50},
      {x:  82, y: 0, w: 41, h: 50},
      {x: 123, y: 0, w: 41, h: 50},
      {x: 164, y: 0, w: 41, h: 50},
      {x: 205, y: 0, w: 41, h: 50},
      {x: 246, y: 0, w: 41, h: 50},
      {x: 287, y: 0, w: 41, h: 50},
      {x: 328, y: 0, w: 41, h: 50},
      {x: 369, y: 0, w: 41, h: 50},
      {x: 411, y: 0, w: 41, h: 50},
      {x: 452, y: 0, w: 41, h: 50},
      {x: 493, y: 0, w: 41, h: 50},
      {x: 534, y: 0, w: 41, h: 50},
      {x: 575, y: 0, w: 41, h: 50},
      {x: 616, y: 0, w: 41, h: 50},
      {x: 657, y: 0, w: 41, h: 50},
      {x: 698, y: 0, w: 41, h: 50},
      {x: 739, y: 0, w: 41, h: 50}
    ]
  };
  var framesXLength = imgData.frames.length;

  var numParticles = 2000;

  /*----------  SET STAGE  ----------*/
  var container = document.getElementById('ddd-container');
  var webgl     = new DDD.Webgl(container);
  var stage     = new DDD.Stage(imgData, webgl, numParticles);

  var map = new DDD.Map({
    center: {lon: -71.999996, lat: 4.000002} // Center of Colombia
  });

  function imgReady() {
    DDD.yearsMenu(1993, 2015, year, yearClickEvent, function(menu, currEle) {
      container.appendChild(menu);
      currentYear = currEle;
      loadData();
    });
  }

  function assetLoaded() {
    assetsLoaded += 1;

    if (assetsLoaded === 2) {
      init();
    }

  }

  function loadData() {
    oReq.json({
      url: '../../data/ingeominas/eq' + year + '.json',
      container: container,
      loadingMsg: 'Loading Seismic Data'
    })
    .then(function(d) {
      seismicData = d;
      seismicDataI = 0;
      assetLoaded();
    })
    .catch(function(err) {
      console.error(err);
    });

    if (!taDataLoaded) {
      DDD.json({
        url: '../../data/cmh/AtentadosTerroristas1988-2012.json',
        container: container,
        loadingMsg: 'Loading Violence Data'
      })
      .then(function(d) {
        taData = d;
        taDataLoaded = true;
        getFirstAttackOfYear();
        assetLoaded();
      })
      .catch(function(err) {
        console.error(err);
      });
    }
  }

  function yearClickEvent(event) {
    if (event.target !== currentYear) {
      window.cancelAnimationFrame(animReq);
      assetsLoaded -= 1;
      oReq.abort();
      DDD.resetCurrent(currentYear, event.target);
      currentYear = event.target;
      year = Number(event.target.textContent);
      stage.children = [];
      getFirstAttackOfYear();

      loadData();
    }
  }

  function getFirstAttackOfYear() {
    var yearStart = Date.parse(year) / 1000;
    var dLength = taData.length;
    var i;

    for (i = 0; i < dLength; i++) {
      if (taData[i].date.unix >= yearStart) {
        taDataI = i;
        taTime  = taData[i].date.unix;
        break;
      }
    }
  }

  function init() {
    var i = numParticles - 1;

    for (i; i >= 0; i--) {
      stage.particle(new Bird());
    }
    animReq = requestAnimationFrame(animate);
  }

  function attackHold(coords, end) {
    var cl = stage.children.length;
    var vector = new DDD.Vector(coords.x + centerX, coords.y + centerY);

    function hold(timestamp) {
      if (timestamp < end) {
        var i = cl - 1;

        for (i; i >= 0; i--) {
          var bird = stage.children[i];
          vector.setZ(bird.position.z);
          bird.repulse(vector);
        }
        animReq = requestAnimationFrame(hold);
      }
    }

    animReq = requestAnimationFrame(hold);
  }

  function animate(timestamp) {
    if (seismicDataI < seismicData.length) {
      var d = seismicData[seismicDataI];
      var currTime = d.date.unix;

      if (taTime && currTime >= taTime) {
        console.log('attack');
        var impact = taData[taDataI].fatal ? taData[taDataI].fatal * 100 : 0;
        impact += taData[taDataI].injured ? taData[taDataI].injured * 30 : 0;

        var attackCoords = map.convertCoordinates(taData[taDataI].place.lon, taData[taDataI].place.lat);
        attackHold(attackCoords, timestamp + impact);

        if (taDataI < taData.length - 1) {
          taDataI++;
          taTime = taData[taDataI].date.unix;
        } else {
          taTime = false;
        }
      }

      if (d.ml > 3 || seismicDataI === 0) {
        var coords = map.convertCoordinates(d.lon, d.lat);
        target.set(coords.x + centerX, coords.y + centerY, d.km || 200);
      }

      updateBirds();

      webgl.render(stage);
      tick++;
      seismicDataI++;
      animReq = requestAnimationFrame(animate);
    } else {
      target.set(-stageW, centerY, -200);
      end = timestamp + 5000;
      animReq = requestAnimationFrame(endAnimation);
    }
  }

  function updateBirds() {
    var i = stage.children.length - 1;

    for (i; i >= 0; i--) {
      stage.children[i].update();
    }
  }

  function endAnimation(timestamp) {
    if (timestamp < end) {
      updateBirds();
      webgl.render(stage);
      animReq = requestAnimationFrame(endAnimation);
    } else {
      console.log('end');
      window.cancelAnimationFrame(animReq);
    }
  }

  var Bird = function() {
    this.rotation = 0.5;
    this.scale    = 1;
    this.alpha    = 1;
    this.x        = DDD.random(-stageW / 2, 0);
    this.y        = DDD.random(0, stageH);
    this.frame    = DDD.random(0, framesXLength);

    this.position = new DDD.Vector();
    this.velocity = new DDD.Vector();

    this.position.x = DDD.random(-stageW, stageW * 2);
    this.position.y = DDD.random(-stageH, stageH * 2);
    this.position.z = DDD.random(-300, -200, true);

    this.velocity.x = DDD.random(1, 2, true);
    this.velocity.y = DDD.random(1, 2, true);
    this.velocity.z = DDD.random(1, 2, true);

    this.acceleration = new DDD.Vector();
    this.steer = new DDD.Vector();
    this.posSum = new DDD.Vector();
    this.separate = new DDD.Vector();
  };

  Bird.prototype.run = function() {
    if (Math.random() > 0.5) {
      this.flock();
    }
    this.move();
  };

  Bird.prototype.flock = function() {
    this.acceleration.add(this.reach(0.005));
    this.acceleration.add(this.separation(stage.children));
  };

  Bird.prototype.move = function() {
    this.velocity.add(this.acceleration);
    var l = this.velocity.length();

    if (l > _maxSpeed) {
      this.velocity.divideScalar(l / _maxSpeed);
    }

    this.position.add(this.velocity);
    this.acceleration.set(0, 0, 0);
  };

  Bird.prototype.repulse = function(v) {
    var distance = this.position.distanceTo(v);

    if (distance < stageW) {
      this.steer.subVectors(this.position, v);
      this.steer.multiplyScalar(0.5 / distance);
      this.acceleration.add(this.steer);
    }
  };

  Bird.prototype.reach = function(amount) {
    this.steer.subVectors(target, this.position);
    this.steer.multiplyScalar(amount);
    return this.steer;
  };

  Bird.prototype.separation = function(flock) {
    this.posSum.set(0, 0 , 0);
    var i = numParticles - 1;

    for (i; i >= 0; i -= 11) {
      if (Math.random() > 0.5) {
        continue;
      }
      var bird = flock[i];
      var distance = bird.position.distanceTo(this.position);

      if (distance > 0 && distance <= _neighborhoodRadius) {
        this.separate.subVectors(this.position, bird.position);
        this.separate.normalize();
        this.separate.divideScalar(distance);
        this.posSum.add(this.separate);
      }
    }

    return this.posSum;
  };

  Bird.prototype.update = function() {
    this.run();

    this.ry = Math.atan2(-this.velocity.y, this.velocity.x);
    this.rz = (Math.asin(this.velocity.z / this.velocity.length())) * 180 / PI;
    this.x = this.position.x;
    this.y = this.position.y;

    this.rotation = this.ry > 0 ? HALF_PI - this.ry : HALF_PI - this.ry + TWO_PI;
    this.frame = this.rz > 0 ? this.rz / framesXLength | 0 : (this.rz + 360) / framesXLength | 0;

    this.alpha = this.position.z / 300;

    if (this.alpha < 0) {
      this.alpha = 0;
    } else if (this.alpha > 1) {
      this.alpha = 1;
    }

    this.scale = this.position.z / 450;

    if (this.scale < 0) {
      this.scale = 0;
    }
  };

})();
