(function () {
  'use strict';
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');

  /*----------  SET STAGE  ----------*/
  var stage    = createCanvas(container);
  var timeline = createCanvas(container);

  /*----------  GLOBALS  ----------*/
  var stageW, stageH, centerX, centerY, current, currentI, points, timeStart, timeEnd, step, animReq;
  var TWO_PI    = Math.PI * 2;
  var year      = 2008;
  var req       = new DREQ();
  var d         = {};
  var mapZoom   = 11;
  var mapCenter; // Center of Colombia
  var perlin    = new PerlinNoise();
  var max       = 300;

  var img = new Image();
  img.onload = function () {
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
  function clickEvent (event) {
    if (event.target !== current) {
      window.cancelAnimationFrame(animReq);
      req.abort();
      loading.style.opacity = 1;
      resetCurrentClass(current, event.target);
      current = event.target;
      year = Number(event.target.textContent);

      clearStage();
      initValues();
      loadData();
    }
  }

  function menuReady (menu, first) {
    container.appendChild(menu);
    current = first;
    loadData();
  }
  /*=====  End of YEARS MENU  ======*/

  function init() {
    initValues();
    yearsListMenu (2008, 2015, year, clickEvent, menuReady);
  }

  function drawBG() {
    stage.ctx.save();
    stage.ctx.globalAlpha = 1;
    stage.ctx.drawImage(img, 0, 0, 1764, 1250, 0, 0, stage.canvas.width, stage.canvas.height);
    stage.ctx.restore();
  }

  function initValues () {
    stageW   = window.innerWidth;
    stageH   = window.innerHeight;
    centerX  = stageW / 2 | 0;
    centerY  = stageH / 2 | 0;
    points    = [];
    currentI  = 0;
    timeStart = Date.parse(year + '-01-01 00:00:00');
    timeEnd   = Date.parse(year + 1 + '-01-01 00:00:00');
    step      = stageW / (timeEnd - timeStart);
    mapCenter = null;
    mapCenter = convertCoordinates(-71.999996, 4.000002); // Center of Colombia

    stage.canvas.width = stageW;
    stage.canvas.height = stageH;
    timeline.canvas.width = stageW;
    timeline.canvas.height = stageH;

    stage.ctx.globalAlpha = 0.05;

    drawBG();
  }

  function clearStage() {
    stage.ctx.clearRect(0, 0, stageW, stageH);
    timeline.ctx.clearRect(0, 0, stageW, stageH);
  }

  function dataReady (data) {
    d = data;
    loading.style.opacity = 0;
    animate();
  }

  function animate() {
    if (currentI < d.length) {
      var amount = d[currentI].hasOwnProperty('total_v') ? Number(d[currentI].total_v) : 0;
      var loc = convertCoordinates( d[currentI].lon, d[currentI].lat );
      var timeEvent = d[currentI].hasOwnProperty('fecha_ini') ? Date.parse( d[currentI].fecha_ini ) : null;
      var timeX = timeEvent - timeStart;
      perlin.setSeed( amount );

      if (amount > 0) {
        generatePoints( amount, loc.x + centerX, loc.y + centerY, d[currentI].cat[0] );
        // console.log(loc);
      }

      for(var i = points.length - 1; i > 0; i--) {
        var p = points[i];
        p.update();

        if (p.finished) {
          points.splice(i, 1);
        }
      }

      if (currentI === 0) {
        timeline.ctx.beginPath();
        timeline.ctx.moveTo( timeX * step, stageH - 2 );
      }

      timeline.ctx.lineTo( timeX * step, stageH - 2);
      timeline.ctx.stroke();

      currentI++;
      animReq = requestAnimationFrame(animate);
    }
    // else if (opacity <= 1) {
    //   stage.ctx.fillStyle = 'rgba(255, 255, 255, ' + opacity + ')';
    //   stage.ctx.fillRect(0, 0, stageW, stageH);

    //   opacity += 0.0005;
    //   animReq = requestAnimationFrame(animate);
    // }
  }

  function generatePoints(amount, x, y, cat) {
    var color = cats[cat];
    amount = amount < max ? amount : max;

    for (var i = 0; i < amount; i++) {
      points.push( new Point(x, y, amount + i, color) );
    }
  }

  /*===============================
  =            HELPERS            =
  ===============================*/
  function loadData () {
    req.getD('../../data/monitor/violencia-geo-' + year + '.json', dataReady);
  }

  /*----------  MAP COORDINATES TO X & Y  ----------*/
  function convertCoordinates (lon, lat) {
    var zoomX     = stageW * mapZoom;
    var zoomY     = centerY * mapZoom;
    var latRad    = Number(lat) * Math.PI / 180;
    var mercatorN = Math.log( Math.tan( (Math.PI / 4 ) + (latRad / 2) ) );
    var x         = (Number(lon) + 180) * (zoomX / 360);
    var y         = (zoomY - (zoomX * mercatorN / TWO_PI ) );

    if (mapCenter) {
      x -= mapCenter.x;
      y -= mapCenter.y;
    }

    return {x: x, y: y};
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
    var xv = Math.cos( perlin.noise(this.x * 0.01, this.y * 0.01) * (this.r * TWO_PI) );
    var yv = Math.sin( perlin.noise(this.x * 0.01, this.y * 0.01) * (this.r * TWO_PI) );
    var xt = this.x + xv;
    var yt = this.y + yv;

    if (this.timer >= 800) {
      this.finished = true;
    }
    else if (this.x > stageW || this.x < 0 || this.y > stageH || this.y < 0) {
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
      z = ( 36969 * (z & 65535) + (z >>> 16) ) & 0xFFFFFFFF;
      w = ( 18000 * (w & 65535) + (w >>> 16) ) & 0xFFFFFFFF;
      return ( ( (z & 0xFFFF) << 16 ) | (w & 0xFFFF) ) & 0xFFFFFFFF;
    };
  }

  function PerlinGenerator (seed) {
    var rnd = new Marsaglia( seed, (seed << 16) + (seed >> 16) );
    var i, j;
    var perm = new Uint8Array(512);

    for(i = 0; i < 256; ++i) {
      perm[i] = i;
    }

    for( i = 0; i < 256; ++i) {
      var t = perm[j = rnd.intGenerator() & 0xFF];
      perm[j] = perm[i];
      perm[i] = t;
    }

    for( i= 0; i < 256; ++i) {
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
        lerp( fx, grad2d(perm[p0], x, y), grad2d(perm[p1], x - 1, y) ),
        lerp( fx, grad2d(perm[p0 + 1], x, y - 1), grad2d(perm[p1 + 1], x - 1, y - 1) )
      );
    };
  }

  function PerlinNoise () {
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
      sum += effect * ( 1 + this.generator.noise2d(k * x, k * y) ) / 2;
      k *= 2;
    }
    return sum;
  };

  /*=====  End of HELPERS  ======*/
  // init();
})();