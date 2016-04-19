(function() {
  'use strict';
  var container = document.getElementById('ddd-container');

  /*----------  SET STAGE  ----------*/
  var stage    = DDD.canvas(container);
  var timeline = DDD.canvas(container);

  /*----------  GLOBALS  ----------*/
  var current = '';
  var currentI = 0;
  var points = [];
  var timeStart = 0;
  var timeEnd = 0;
  var step = 0;
  var animReq;
  var mode = 1;
  var TWO_PI = Math.PI * 2;
  var map = new DDD.Map({
    center: {lon: -71.999996, lat: 4.000002} // Center of Colombia
  });
  var year   = 2008;
  var req    = new DDD.DataRequest();
  var d      = {};
  var perlin = new PerlinNoise();
  var max    = 300;

  var img = new Image();
  img.onload = function() {
    init();
    drawBG();
  };
  img.src = '../../img/backgrounds/white-paper2.jpg';

  var cats = {
    'Amenaza': '#F0F0F0',
    'Artefacto Explosivo Improvisado': '#A5A7AD',
    'Ataque a bienes culturales y religiosos': '#000000',
    'Ataque a infraestructura militar/policial': '#BBBBBB',
    'Ataque a infraestructura vial': '#A8A4A4',
    'Ataque a misión humanitaria': '#010000',
    'Ataque a misión médica': '#170301',
    'Ataque y/o ocupación y/o uso infraestructura y/o bienes civiles': '#020100',
    'Ataques a bienes indispensables para la superviviencia de la población civil': '#7C7573',
    'Atentado': '#DAD1C7',
    'Bloqueo de vías y/o Retén ilegal': '#FEFFF0',
    'Combates': '#090101',
    'Comunidades en riesgo': '#000000',
    'Confinamiento/Bloqueo de comunidades': '#000000',
    'Desaparición forzada': '#000000',
    'Desplazamiento': '#FFFAF1',
    'Emboscada': '#FEFFF7',
    'Enfrentamiento entre actores no estatales': '#000000',
    'Eventos de fuego amigo': '#000000',
    'Explosivo encontrado': '#EFFFF9',
    'Fosas Comunes': '#000000',
    'Herida de civil en acción bélica': '#B6BAB4',
    'Herida intencional en persona protegida': '#E5EBD9',
    'Homicidio': '#000000',
    'Hostigamiento': '#F3E7E2',
    'Incursión': '#E2E3EB',
    'Intento de homicidio': '#AFAFB6',
    'Masacre': '#000000',
    'Mina antipersonal': '#000000',
    'Muerte de civil en acción bélica': '#000000',
    'Munición sin explotar': '#303030',
    'Reclutamiento forzado': '#080D02',
    'Secuestro': '#000000',
    'Toma de rehenes': '#CFCFCF',
    'Tortura': '#000000',
    'Uso de civiles como escudo': '#000000',
    'Violencia sexual': '#CE18C9'
  };

  /*==================================
  =            YEARS MENU            =
  ==================================*/
  function clickEvent(event) {
    if (event.target !== current) {
      window.cancelAnimationFrame(animReq);
      req.abort();
      DDD.resetCurrent(current, event.target);
      current = event.target;
      year = Number(event.target.textContent);

      mode = 1;
      clearStage();
      initValues();
      loadData();
    }
  }

  function menuReady(menu, first) {
    var random = document.createElement('li');
    random.innerText = 'Random';
    random.onclick = function() {
      window.cancelAnimationFrame(animReq);
      req.abort();
      clearStage();
      initValues();
      loadData();
      mode = 2;
      console.log('tick');
      return false;
    };
    random.style.backgroundColor = '#EDE397';
    menu.appendChild(random);
    container.appendChild(menu);
    current = first;
    loadData();
  }
  /*=====  End of YEARS MENU  ======*/

  function init() {
    initValues();
    DDD.yearsMenu(2008, 2015, year, clickEvent, menuReady);
  }

  function drawBG() {
    stage.ctx.save();
    stage.ctx.globalAlpha = 1;
    stage.ctx.drawImage(img, 0, 0, 1764, 1250, 0, 0, stage.canvas.width, stage.canvas.height);
    stage.ctx.restore();
  }

  function initValues() {
    stage.w = timeline.w = stage.canvas.width = window.innerWidth;
    stage.h = timeline.h = timeline.canvas.height = window.innerHeight;
    stage.center.x = stage.w / 2 | 0;
    stage.center.y = stage.h / 2 | 0;
    stage.ctx.globalAlpha = 0.05;
    map.updateSize(stage.w, stage.h);

    points    = [];
    currentI  = 0;
    timeStart = Date.parse(year + '/01/01 00:00:00') / 1000;
    timeEnd   = Date.parse(year + 1 + '/01/01 00:00:00') / 1000;
    step      = stage.w / (timeEnd - timeStart);

    drawBG();
  }

  function clearStage() {
    stage.ctx.clearRect(0, 0, stage.w, stage.h);
    timeline.ctx.clearRect(0, 0, timeline.w, timeline.h);
  }

  function animate() {
    if (currentI < d.length) {
      var amount = 0;
      var loc;

      if (mode === 1) {
        amount = d[currentI].hasOwnProperty('vTotal') ? d[currentI].vTotal : 0;
        loc = map.convertCoordinates(d[currentI].lon, d[currentI].lat);
        perlin.setSeed(amount);
      } else if (mode === 2) {
        amount = DDD.random(0, DDD.random(1, 50));
        loc = {
          x: DDD.random(0, stage.w) - stage.center.x,
          y: DDD.random(0, stage.h) - stage.center.y
        };
      }

      var timeEvent = d[currentI].hasOwnProperty('fecha') ? d[currentI].fecha.unix : null;
      var timeX = timeEvent - timeStart;

      perlin.setSeed(amount);

      if (amount > 0) {
        generatePoints(amount, loc.x + stage.center.x, loc.y + stage.center.y, d[currentI].cat[0]);
      }

      for (var i = points.length - 1; i > 0; i--) {
        var p = points[i];
        p.update();

        if (p.finished) {
          points.splice(i, 1);
        }
      }

      if (currentI === 0) {
        timeline.ctx.beginPath();
        timeline.ctx.moveTo(timeX * step, timeline.h - 2);
      }

      timeline.ctx.lineTo(timeX * step, timeline.h - 2);
      timeline.ctx.stroke();

      currentI++;
      animReq = requestAnimationFrame(animate);
    }
  }

  function generatePoints(amount, x, y, cat) {
    var color;

    if (mode === 1) {
      color = cats[cat];
    } else if (mode === 2) {
      var keys = Object.keys(cats);
      var randomKey = keys[ DDD.random(0, keys.length) ];
      color = cats[randomKey];
    }
    // var color = cats[cat];
    amount = amount < max ? amount : max;

    for (var i = 0; i < amount; i++) {
      points.push(new Point(x, y, amount + i, color));
    }
  }

  /*===============================
  =            HELPERS            =
  ===============================*/
  function loadData() {
    req.json({
      url: '../../data/monitor/violencia-geo-' + year + '.json',
      container: container,
      loadingMsg: 'Loading data',
    })
    .then(function(res) {
      d = res;
      animate();
    })
    .catch(function(err) {
      console.error(err);
    });
  }

  /*----------  POINT  ----------*/
  var Point = function(x, y, r, color) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.finished = false;
    this.timer = 0;
    this.color = color;
  };

  Point.prototype.update = function() {
    var xv = Math.cos(perlin.noise(this.x * 0.01, this.y * 0.01) * (this.r * TWO_PI));
    var yv = Math.sin(perlin.noise(this.x * 0.01, this.y * 0.01) * (this.r * TWO_PI));
    var xt = this.x + xv;
    var yt = this.y + yv;

    if (this.timer >= 800) {
      this.finished = true;
    } else if (this.x > stage.w || this.x < 0 || this.y > stage.h || this.y < 0) {
      this.finished = true;
    }

    stage.ctx.beginPath();
    stage.ctx.moveTo(xt, yt);
    stage.ctx.lineTo(this.x, this.y);
    stage.ctx.strokeStyle = this.color;
    stage.ctx.stroke();

    this.x = xt;
    this.y = yt;

    this.timer++;
  };

  /*----------  NOISE  ----------*/
  /**
   * Perlin Noise from processing-js (modified to learn what things do and use only what requiered here)
   * https://github.com/processing-js/processing-js/blob/50ccecf274612df1db8dcfe38ac220f0c12d6e79/src/P5Functions/Math.js#L510-L677
   */
  function Marsaglia(i1, i2) {
    var z = i1 || 362436069;
    var w = i2 || 521288629;

    this.intGenerator = function() {
      z = (36969 * (z & 65535) + (z >>> 16)) & 0xFFFFFFFF;
      w = (18000 * (w & 65535) + (w >>> 16)) & 0xFFFFFFFF;
      return (((z & 0xFFFF) << 16) | (w & 0xFFFF)) & 0xFFFFFFFF;
    };
  }

  function PerlinGenerator(seed) {
    var rnd = new Marsaglia(seed, (seed << 16) + (seed >> 16));
    var i;
    var j;
    var perm = new Uint8Array(512);

    for (i = 0; i < 256; ++i) {
      perm[i] = i;
    }

    for (i = 0; i < 256; ++i) {
      var t = perm[j = rnd.intGenerator() & 0xFF];
      perm[j] = perm[i];
      perm[i] = t;
    }

    for (i = 0; i < 256; ++i) {
      perm[i + 256] = perm[i];
    }

    function grad2d(i, x, y) {
      var v = (i & 1) === 0 ? x : y;
      return (i & 2) === 0 ? -v : v;
    }

    function lerp(t, a, b) {
      return a + t * (b - a);
    }

    this.noise2d = function(x, y) {
      var X = Math.floor(x) & 255;
      var Y = Math.floor(y) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      var fx = (3 - 2 * x) * x * x;
      var fy = (3 - 2 * y) * y * y;
      var p0 = perm[X] + Y;
      var p1 = perm[X + 1] + Y;
      return lerp(
        fy,
        lerp(fx, grad2d(perm[p0], x, y), grad2d(perm[p1], x - 1, y)),
        lerp(fx, grad2d(perm[p0 + 1], x, y - 1), grad2d(perm[p1 + 1], x - 1, y - 1))
      );
    };
  }

  function PerlinNoise() {
    this.octaves = 4;
    this.fallout = 0.5;
  }

  PerlinNoise.prototype.updateDetail = function(octaves, fallout) {
    this.octaves = octaves;
    if (fallout !== null) {
      this.fallout = fallout;
    }
  };

  PerlinNoise.prototype.setSeed = function(x, y) {
    this.generator = new PerlinGenerator(x, y);
  };

  PerlinNoise.prototype.noise = function(x, y) {
    var effect = 1;
    var k      = 1;
    var sum    = 0;

    for (var i = 0; i < this.octaves; ++i) {
      effect *= this.fallout;
      sum += effect * (1 + this.generator.noise2d(k * x, k * y)) / 2;
      k *= 2;
    }
    return sum;
  };

  /*=====  End of HELPERS  ======*/
})();
