import { canvas, Map, yearsMenu, resetCurrent, DataRequest } from 'dddrawings';
const req = new DataRequest();
const req2 = new DataRequest();
let animReq;

/*----------  SET STAGE  ----------*/
const container = document.getElementById('ddd-container');
const loading = document.createElement('div');
const bg = canvas(container);
const stage = canvas(container);
stage.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';

// MAP
const map = new Map({ zoom: 10 });
let col = [];
let mapLoaded = false;

// EQ
let eqData = [];

// Menu
let currentYear;
let currentOption;
let optionMode = 1;
let animating = false;
const animateBTN = document.createElement('li');

// Animate
let playerI = 0;

yearsMenu(1993, 2015, 2003, yearClickEvent, yearsMenuReady);

/*===========================
  =            MAP            =
  ===========================*/
function processMapData(data) {
  map.newCenter(data.center[0], data.center[1]);

  data.coordinates.forEach(polygon => {
    polygon.forEach(layer => {
      layer.forEach(node => {
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
  d.forEach((node, i) => {
    const coords = map.convertCoordinates(node.lon, node.lat);

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
  req
    .json({
      url: '../../data/ingeominas/eq' + year + '.json',
      container: container,
      loadingMsg: 'Loading Seismic Data',
      loadingEle: loading
    })
    .then(initProcess)
    .catch(err => console.error(err));
}
/*=====  End of EQ  ======*/

function initProcess(data) {
  if (data) {
    eqData = data;
  }

  checkMapState();

  function checkMapState() {
    if (mapLoaded) {
      if (animating) {
        playerI = 0;
        animReq = requestAnimationFrame(animate);
      } else {
        drawMap(eqData, stage.ctx, optionMode);
      }
    } else {
      animReq = requestAnimationFrame(checkMapState);
    }
  }
}

/*===============================
  =            ANIMATE            =
  ===============================*/
function animate() {
  if (playerI === 0) {
    stage.ctx.clearRect(0, 0, stage.w, stage.h);
  }

  if (eqData.length > 0 && playerI < eqData.length) {
    const coords = map.convertCoordinates(eqData[playerI].lon, eqData[playerI].lat);

    stage.ctx.save();
    stage.ctx.translate(stage.center.x, stage.center.y);
    if (optionMode === 1) {
      if (playerI > 0) {
        const coords2 = map.convertCoordinates(eqData[playerI - 1].lon, eqData[playerI - 1].lat);
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
  req2
    .json({
      url: '../../data/geo/col-50m.json',
      container: container,
      loadingMsg: 'Loading Map Data',
      loadingEle: loading
    })
    .then(processMapData)
    .catch(err => console.error(err));
  optionsMenu();
}

function yearClickEvent(event) {
  req.abort();
  loading.innerHTML = '';
  loading.style.opacity = 1;
  window.cancelAnimationFrame(animReq);
  resetCurrent(currentYear, event.target);
  currentYear = event.target;
  stage.ctx.clearRect(0, 0, stage.w, stage.h);
  updateEQMap(currentYear.textContent);
}
/*=====  End of YEARS MENU  ======*/

/*====================================
  =            OPTIONS MENU            =
  ====================================*/
function optionsMenu() {
  const c = document.createElement('ul');

  ['dots', 'lines'].forEach((ele, i) => {
    const option = document.createElement('li');
    option.textContent = ele;
    option.style.cursor = 'pointer';

    if (ele === 'lines') {
      currentOption = option;
      option.className = 'current';
    }

    option.onclick = event => {
      loading.style.opacity = 1;
      playerI = 0;
      animating = false;
      resetAnimationBTN();
      resetCurrent(currentOption, event.target);
      currentOption = event.target;
      stage.ctx.clearRect(0, 0, stage.w, stage.h);
      optionMode = i;
      initProcess(null);

      return false;
    };

    c.appendChild(option);
  });

  animateOption(c);

  c.style.position = 'absolute';
  c.style.top = '40%';
  c.style.zIndex = 9999;
  container.appendChild(c);
}

function animateOption(c) {
  animateBTN.innerHTML = '&#9658';
  animateBTN.style.padding = '0.3em';
  animateBTN.style.listStyle = 'none';
  animateBTN.style.margin = '0.5em 0';
  animateBTN.style.cursor = 'pointer';
  c.appendChild(animateBTN);

  animateBTN.onclick = () => {
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
