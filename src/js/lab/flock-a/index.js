import { canvas, random, DataRequest, Map, yearsMenu, resetCurrent, PI } from 'dddrawings';
import Bird from './Bird.js';

const container = document.getElementById('ddd-container');
const loading = document.createElement('div');
loading.className = 'loading';
container.appendChild(loading);

/*----------  SET STAGE  ----------*/
const stage = canvas(container);

/*----------  GLOBALS  ----------*/
const eqReq = new DataRequest();
const taReq = new DataRequest();
const num = 1555; // 1555 victims from 1988-2012
let nextAttack;
let animReq;
let eqData = [];
let taData = { raw: [], current: [] };
let flock = [];
let eqDataI = 0;
let taDataI = 0;
let mode = -1;
let currentX = 0;
let currentY = 0;
let tick = 0;

// SPRITE
const img = new Image();

// MAP
const map = new Map({
  zoom: 13,
  width: stage.w,
  height: stage.h,
  center: { lon: -71.999996, lat: 4.000002 },
});

// MENU
let current;
let currentYear = 2003;

// ASSETS
const assets = {
  eqData: {
    url: '/data/ingeominas/eq' + currentYear + '.json',
    update: () => {
      assets.eqData.url = '/data/ingeominas/eq' + currentYear + '.json';
    },
    loaded: false,
  },
  taData: {
    url: '/data/cmh/ta.json',
    loaded: false,
  },
  birdSprite: {
    url: '/img/assets/sprites/bird2.png',
    loaded: false,
  },
};
let assestsLoaded = 0;
const totalAssets = Object.keys(assets).length;

yearsMenu(1993, 2015, currentYear, yearClickEvent, menuReady);

function menuReady(menu, currentBtn) {
  container.appendChild(menu);
  current = currentBtn;
  currentYear = currentBtn.textContent;
  init();
}

function yearClickEvent(event) {
  eqReq.abort(); // Stop any current download, if any.
  loading.innerHTML = '';
  loading.style.opacity = 1;
  window.cancelAnimationFrame(animReq);

  stage.ctx.clearRect(0, 0, stage.w, stage.h);
  currentYear = event.target.textContent;
  resetCurrent(current, event.target);
  current = event.target;
  eqDataI = 0;
  taDataI = 0;
  mode = -1;
  if (assets.taData.loaded) {
    taData.current = taData.raw.hasOwnProperty(currentYear) ? taData.raw[currentYear] : [];
  }
  assestsLoaded--;
  assets.eqData.update();
  init();
}

function init() {
  eqReq
    .json({
      url: assets.eqData.url,
      container: container,
      loadingMsg: 'Loading Seismic Data',
      loadingEle: loading,
    })
    .then((data) => {
      eqData = data;
      assets.eqData.loaded = true;
      assestsLoaded++;
    })
    .catch((err) => {
      console.error(err);
    });

  if (!assets.taData.loaded) {
    taReq
      .json({
        url: assets.taData.url,
        container: container,
        loadingMsg: 'Loading Violence Data',
        loadingEle: loading,
      })
      .then((data) => {
        taData.raw = data;
        taData.current = data.hasOwnProperty(currentYear) ? data[currentYear] : null;
        nextAttack = taData.current[0].date.unix;
        assets.taData.loaded = true;
        assestsLoaded++;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  if (!assets.birdSprite.loaded) {
    img.onload = () => {
      assestsLoaded++;
      assets.birdSprite.loaded = true;
    };
    img.src = assets.birdSprite.url;
  }

  checkAssetsLoaded();
}

function checkAssetsLoaded() {
  if (assestsLoaded === totalAssets) {
    for (let i = 0; i < num; i++) {
      const x = random(-stage.h, 0);
      const y = random(0, stage.h);
      flock[i] = new Bird(x, y, stage.ctx, img);
    }
    loading.style.opacity = 0;
    animReq = requestAnimationFrame(animate);
  } else {
    animReq = requestAnimationFrame(checkAssetsLoaded);
  }
}

function animate() {
  if (eqDataI < eqData.length) {
    const d = eqData[eqDataI];
    const ctx = stage.ctx;

    if (d.ml > 4 || eqDataI === 0) {
      const coords = map.convertCoordinates(d.lon, d.lat);
      currentX = coords.x + stage.center.x;
      currentY = coords.y + stage.center.y;
    }

    if (tick > 3) {
      const orientationFix = mode === 1 ? PI : 0;
      ctx.clearRect(0, 0, stage.w, stage.h);

      for (let i = 0; i < flock.length; i++) {
        flock[i].update(currentX, currentY, mode);
        flock[i].draw(orientationFix);
      }

      tick = 0;
      ctx.fillRect(currentX, currentY, 5, 5);
    }

    if (taDataI < taData.current.length - 1 && nextAttack < +d.utc) {
      taDataI++;
      nextAttack = taData.current[taDataI].date.unix;
      mode = 3;
    }

    if (mode > -1) {
      mode -= 0.04;
    } else {
      mode = -1;
    }

    tick++;
    eqDataI++;
    animReq = requestAnimationFrame(animate);
  } else {
    window.cancelAnimationFrame(animReq);
  }
}
