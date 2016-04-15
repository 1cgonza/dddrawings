(function() {
  'use strict';

  /*----------  GLOBALS  ----------*/
  var animReq;
  var currentYear;
  var year         = 2014;
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
  var _maxSpeed = DDD.random(4, 10, true);

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
      {x: 0, y: 0, w: 41.101694915254235, h: 50},
      {x: 41.101694915254235, y: 0, w: 41.101694915254235, h: 50},
      {x: 82.20338983050847, y: 0, w: 41.101694915254235, h: 50},
      {x: 123.30508474576271, y: 0, w: 41.101694915254235, h: 50},
      {x: 164.40677966101694, y: 0, w: 41.101694915254235, h: 50},
      {x: 205.50847457627117, y: 0, w: 41.101694915254235, h: 50},
      {x: 246.61016949152543, y: 0, w: 41.101694915254235, h: 50},
      {x: 287.7118644067796, y: 0, w: 41.101694915254235, h: 50},
      {x: 328.8135593220339, y: 0, w: 41.101694915254235, h: 50},
      {x: 369.91525423728814, y: 0, w: 41.101694915254235, h: 50},
      {x: 411.01694915254234, y: 0, w: 41.101694915254235, h: 50},
      {x: 452.1186440677966, y: 0, w: 41.101694915254235, h: 50},
      {x: 493.22033898305085, y: 0, w: 41.101694915254235, h: 50},
      {x: 534.3220338983051, y: 0, w: 41.101694915254235, h: 50},
      {x: 575.4237288135593, y: 0, w: 41.101694915254235, h: 50},
      {x: 616.5254237288135, y: 0, w: 41.101694915254235, h: 50},
      {x: 657.6271186440678, y: 0, w: 41.101694915254235, h: 50},
      {x: 698.728813559322, y: 0, w: 41.101694915254235, h: 50},
      {x: 739.8305084745763, y: 0, w: 41.101694915254235, h: 50}
    ]
  };
  var framesXLength = imgData.frames.length;

  var numParticles = 2000;

  /*----------  SET STAGE  ----------*/
  var container = document.getElementById('ddd-container');
  var webgl     = new DDD.Webgl(container);
  var stage     = new DDD.Stage(imgData, webgl, numParticles, {
    scale: true,
    position: true,
    rotation: true,
    uvs: true,
    alpha: true
  });

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
    oReq.json(
      '../../data/ingeominas/eq' + year + '.json',
      processEQData, null, container, 'Loading Seismic Data'
    );

    if (!taDataLoaded) {
      DDD.json(
        '../../data/cmh/AtentadosTerroristas1988-2012.json',
        processTAData, null, container, 'Loading Violence Data'
      );
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

  function processTAData(d) {
    taData = d;
    taDataLoaded = true;
    getFirstAttackOfYear();
    assetLoaded();
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

  function processEQData(d) {
    seismicData = d;
    seismicDataI = 0;
    assetLoaded();
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

      if (tick > 0) {
        updateBirds();
        tick = 0;
      }

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
    this.anchor   = new DDD.Point(0.5);
    this.scale    = new DDD.Point(1, 1);
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
      var steer = new DDD.Vector();
      steer.subVectors(this.position, v);
      steer.multiplyScalar(0.5 / distance);
      this.acceleration.add(steer);
    }
  };

  Bird.prototype.reach = function(amount) {
    var steer = new DDD.Vector();
    steer.subVectors(target, this.position);
    steer.multiplyScalar(amount);
    return steer;
  };

  Bird.prototype.separation = function(flock) {
    var bird;
    var distance;
    var posSum = new DDD.Vector();
    var repulse = new DDD.Vector();
    var flockSize = flock.length;
    var i = flockSize - 1;

    for (i; i >= 0; i -= 11) {
      if (Math.random() > 0.5) {
        continue;
      }
      bird = flock[i];
      distance = bird.position.distanceTo(this.position);

      if (distance > 0 && distance <= _neighborhoodRadius) {
        repulse.subVectors(this.position, bird.position);
        repulse.normalize();
        repulse.divideScalar(distance);
        posSum.add(repulse);
      }
    }

    return posSum;
  };

  Bird.prototype.update = function() {
    this.run();

    this.ry = Math.atan2(-this.velocity.y, this.velocity.x);
    this.rz = (Math.asin(this.velocity.z / this.velocity.length())) * 180 / PI;
    this.x = this.position.x;
    this.y = this.position.y;

    this.rotation = this.ry > 0 ? HALF_PI - this.ry : HALF_PI - this.ry + TWO_PI;
    this.frame = this.rz > 0 ? this.rz / framesXLength | 0 : (this.rz + 360) / framesXLength | 0;

    this.alpha = (this.position.z) / 300;

    if (this.alpha < 0) {
      this.alpha = 0;
    } else if (this.alpha > 1) {
      this.alpha = 1;
    }

    this.scale.set(this.position.z / 250);

    if (this.scale.x < 0) {
      this.scale.set(0);
    }
  };

})();
