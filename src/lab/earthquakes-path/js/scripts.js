(function () {
  'use strict';

  /*----------  GLOBALS  ----------*/
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');
  var stageW = window.innerWidth;
  var stageH = window.innerHeight;
  var centerX = stageW / 2  | 0;
  var centerY = stageH / 2 | 0;
  var req  = new DREQ();
  var req2 = new DREQ();
  var animReq;

  // MAP
  var col = [];
  var mapCenter;
  var mapZoom = 13;
  var mapLoaded = false;

  // EQ
  var eqData = [];
  var eqLoaded = false;

  // Menu
  var currentYear;
  var currentOption;
  var optionMode = 1;
  var animating = false;
  var animateBTN = document.createElement('li');

  // Animate
  var playerI = 0;

  /*----------  CREATE CANVAS  ----------*/
  var bg = createCanvas( container, { zi: 1 } );
  var eq = createCanvas( container, { zi: 2 } );
  eq.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';

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

  /*===========================
  =            MAP            =
  ===========================*/
  function processMapData (data) {
    mapCenter = convertCoordinates(data.center[0], data.center[1], mapZoom);
    data.coordinates.forEach(function (polygon) {
      polygon.forEach(function (layer) {
        layer.forEach(function (node) {
          col.push({
            lon: node[0],
            lat: node[1]
          });
        });
      });
    });

    drawMap(col, bg.ctx, 0);
    mapLoaded = true;
  }

  function drawMap (d, ctx, mode) {
    if (mode === 1) ctx.beginPath();
    ctx.save();
      ctx.translate(centerX, centerY);
      d.forEach(function (node, i) {
        var coords = convertCoordinates(node.lon, node.lat, mapZoom);

        if (mode === 1) {
          if (i === 0) {
            ctx.moveTo(coords.x, coords.y);
          } else {
            ctx.lineTo(coords.x, coords.y);
          }
        }
        if (mode === 0) ctx.fillRect( coords.x, coords.y, 1, 1 );
      });
    ctx.restore();
    if (mode === 1) ctx.fill();
  }
  /*=====  End of MAP  ======*/

  /*==========================
  =            EQ            =
  ==========================*/
  function updateEQMap (year) {
    req.getD( '../../data/ingeominas/eq' + year + '.json', processEQData );
  }

  function processEQData (data) {
    eqData = data;

    checkMapState();

    function checkMapState() {
      if (mapLoaded) {
        if (animating) {
          playerI = 0;
          animReq = requestAnimationFrame(animate);
        } else {
          drawMap(data, eq.ctx, optionMode);
        }

        loading.style.opacity = 0;
      } else {
        animReq = requestAnimationFrame(checkMapState);
      }
    }
  }
  /*=====  End of EQ  ======*/

  /*===============================
  =            ANIMATE            =
  ===============================*/
  function animate () {
    if (playerI === 0) {
      eq.ctx.clearRect(0, 0, stageW, stageH);
    }

    if (eqData.length > 0 && playerI < eqData.length) {
      var coords = convertCoordinates(eqData[playerI].lon, eqData[playerI].lat, mapZoom);

      eq.ctx.save();
        eq.ctx.translate(centerX, centerY);
          if (optionMode === 1) {
            if (playerI > 0) {
              var coords2 = convertCoordinates(eqData[playerI - 1].lon, eqData[playerI - 1].lat, mapZoom);
              eq.ctx.beginPath();
              eq.ctx.moveTo(coords.x, coords.y);
              eq.ctx.lineTo(coords2.x, coords2.y);
              eq.ctx.stroke();
            }
          }
        if (optionMode === 0) eq.ctx.fillRect( coords.x, coords.y, 1, 1 );
      eq.ctx.restore();

      playerI++;
      animReq = requestAnimationFrame(animate);
    } else {
      console.log('done');
      window.cancelAnimationFrame(animReq);
    }
  }
  /*=====  End of ANIMATE  ======*/

  /*==================================
  =            YEARS MENU            =
  ==================================*/
  function yearsMenuReady (menu, currEle) {
    container.appendChild(menu);
    currentYear = currEle;
    updateEQMap(currEle.textContent);
  }

  function yearClickEvent (event) {
    loading.style.opacity = 1;
    window.cancelAnimationFrame(animReq);
    resetCurrentClass(currentYear, event.target);
    currentYear = event.target;
    eq.ctx.clearRect(0, 0, stageW, stageH);
    updateEQMap(currentYear.textContent);
  }
  /*=====  End of YEARS MENU  ======*/

  /*====================================
  =            OPTIONS MENU            =
  ====================================*/
  function optionsMenu () {
    var c = document.createElement('ul');
    var options = ['dots', 'lines'];

    options.forEach(function (ele, i) {
      var option = document.createElement('li');
      option.textContent = ele;
      option.style.cursor = 'pointer';

      if (ele === 'lines') {
        currentOption = option;
        option.className = 'current';
      }

      option.addEventListener('click', function (event) {
        loading.style.opacity = 1;
        playerI = 0;
        animating = false;
        resetAnimationBTN();
        resetCurrentClass(currentOption, event.target);
        currentOption = event.target;
        eq.ctx.clearRect(0, 0, stageW, stageH);
        optionMode = i;
        updateEQMap(currentYear.textContent);
      }, false);

      c.appendChild(option);
    });

    animateOption(c);

    c.style.position = 'absolute';
    c.style.top = '40%';
    c.style.zIndex = 9999;
    container.appendChild(c);
  }

  function animateOption (c) {
    animateBTN.innerHTML = '&#9658';
    animateBTN.style.padding = '0.3em';
    animateBTN.style.listStyle = 'none';
    animateBTN.style.margin = '0.5em 0';
    animateBTN.style.cursor = 'pointer';
    c.appendChild(animateBTN);

    animateBTN.addEventListener('click', function () {
      animating = true;
      resetAnimationBTN();
    }, false);
  }

  function resetAnimationBTN () {
    if (animateBTN.className === 'on') {
      animating = false;
      animateBTN.innerHTML = '&#9658';
      animateBTN.className = '';
      window.cancelAnimationFrame(animReq);
    } else if (animating) {
      animReq = requestAnimationFrame(animate);
      animateBTN.innerHTML = '||';
      animateBTN.className = 'on';
    }
  }
  /*=====  End of OPTIONS MENU  ======*/

  function init () {
    yearsListMenu (1993, 2015, 2003, yearClickEvent, yearsMenuReady);
    req2.getD( '../../data/geo/col-50m.json', processMapData );
    optionsMenu();
  }

  init();
})();