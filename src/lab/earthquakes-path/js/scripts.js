(function() {
  'use strict';

  var req  = new DDD.DataRequest();
  var req2 = new DDD.DataRequest();
  var animReq;

  /*----------  SET STAGE  ----------*/
  var container = document.getElementById('ddd-container');
  var loading   = document.createElement('div');
  var bg        = DDD.canvas(container);
  var stage     = DDD.canvas(container);
  stage.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';

  // MAP
  var map       = new DDD.Map({zoom: 13});
  var col       = [];
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

  DDD.yearsMenu(1993, 2015, 2003, yearClickEvent, yearsMenuReady);

  /*===========================
  =            MAP            =
  ===========================*/
  function processMapData(data) {
    map.newCenter(data.center[0], data.center[1]);

    data.coordinates.forEach(function(polygon) {
      polygon.forEach(function(layer) {
        layer.forEach(function(node) {
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

  function drawMap(d, ctx, mode) {
    if (mode === 1) {
      ctx.beginPath();
    }
    ctx.save();
    ctx.translate(stage.center.x, stage.center.y);
    d.forEach(function(node, i) {
        var coords = map.convertCoordinates(node.lon, node.lat);

        if (mode === 1) {
          if (i === 0) {
            ctx.moveTo(coords.x, coords.y);
          } else {
            ctx.lineTo(coords.x, coords.y);
          }
        }

        if (mode === 0) {
          ctx.fillRect(coords.x, coords.y, 1, 1);
        }
      });
    ctx.restore();

    if (mode === 1) {
      ctx.fill();
    }
  }
  /*=====  End of MAP  ======*/

  /*==========================
  =            EQ            =
  ==========================*/
  function updateEQMap(year) {
    req.json('../../data/ingeominas/eq' + year + '.json', processEQData, null, container, 'Loading Seismic Data', loading);
  }

  function processEQData(data) {
    eqData = data;

    checkMapState();

    function checkMapState() {
      if (mapLoaded) {
        if (animating) {
          playerI = 0;
          animReq = requestAnimationFrame(animate);
        } else {
          drawMap(data, stage.ctx, optionMode);
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
  function animate() {
    if (playerI === 0) {
      stage.ctx.clearRect(0, 0, stage.w, stage.h);
    }

    if (eqData.length > 0 && playerI < eqData.length) {
      var coords = map.convertCoordinates(eqData[playerI].lon, eqData[playerI].lat);

      stage.ctx.save();
      stage.ctx.translate(stage.center.x, stage.center.y);
      if (optionMode === 1) {
        if (playerI > 0) {
          var coords2 = map.convertCoordinates(eqData[playerI - 1].lon, eqData[playerI - 1].lat);
          stage.ctx.beginPath();
          stage.ctx.moveTo(coords.x, coords.y);
          stage.ctx.lineTo(coords2.x, coords2.y);
          stage.ctx.stroke();
        }
      }
      if (optionMode === 0) {
        stage.ctx.fillRect(coords.x, coords.y, 1, 1);
      }
      stage.ctx.restore();

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
  function yearsMenuReady(menu, currEle) {
    container.appendChild(menu);
    currentYear = currEle;
    updateEQMap(currEle.textContent);
    req2.json('../../data/geo/col-50m.json', processMapData, null, container, 'Loading Map Data', loading);
    optionsMenu();
  }

  function yearClickEvent(event) {
    req.abort();
    loading.innerHTML = '';
    loading.style.opacity = 1;
    window.cancelAnimationFrame(animReq);
    DDD.resetCurrent(currentYear, event.target);
    currentYear = event.target;
    stage.ctx.clearRect(0, 0, stage.w, stage.h);
    updateEQMap(currentYear.textContent);
  }
  /*=====  End of YEARS MENU  ======*/

  /*====================================
  =            OPTIONS MENU            =
  ====================================*/
  function optionsMenu() {
    var c = document.createElement('ul');
    var options = ['dots', 'lines'];

    options.forEach(function(ele, i) {
      var option = document.createElement('li');
      option.textContent = ele;
      option.style.cursor = 'pointer';

      if (ele === 'lines') {
        currentOption = option;
        option.className = 'current';
      }

      option.onclick = function(event) {
        loading.style.opacity = 1;
        playerI = 0;
        animating = false;
        resetAnimationBTN();
        DDD.resetCurrent(currentOption, event.target);
        currentOption = event.target;
        stage.ctx.clearRect(0, 0, stage.w, stage.h);
        optionMode = i;
        updateEQMap(currentYear.textContent);

        return false;
      };

      c.appendChild(option);
    });

    animateOption(c);

    c.style.position = 'absolute';
    c.style.top      = '40%';
    c.style.zIndex   = 9999;
    container.appendChild(c);
  }

  function animateOption(c) {
    animateBTN.innerHTML       = '&#9658';
    animateBTN.style.padding   = '0.3em';
    animateBTN.style.listStyle = 'none';
    animateBTN.style.margin    = '0.5em 0';
    animateBTN.style.cursor    = 'pointer';
    c.appendChild(animateBTN);

    animateBTN.onclick = function() {
      animating = true;
      resetAnimationBTN();

      return false;
    };
  }

  function resetAnimationBTN() {
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

})();
