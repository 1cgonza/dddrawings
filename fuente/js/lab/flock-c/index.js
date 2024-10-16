import {
  random,
  DataRequest,
  json,
  Vector,
  Webgl,
  Stage,
  Map,
  yearsMenu,
  resetCurrent,
  PI,
  HALF_PI,
  TWO_PI,
} from 'dddrawings';
/*----------  GLOBALS  ----------*/
let animReq;
let currentYear;
let year = 2003;
let seismicData = [];
let seismicDataI = 0;
let taData = [];
let taDataI = 0;
let taTime;
let taDataLoaded = false;
const _neighborhoodRadius = 900;
const _maxSpeed = random(6, 10, true);

const oReq = new DataRequest();
let stageW = window.innerWidth;
let stageH = window.innerHeight;
let centerX = (stageW / 2) | 0;
let centerY = (stageH / 2) | 0;
const target = new Vector();
let end;

let assetsLoaded = 0;

const imgData = {
  cb: imgReady,
  url: '/img/sprites/pajaros_19x1-3163x50-1.png',
  width: 3163,
  height: 50,
  frames: [
    { x: 0, y: 0, w: 166, h: 50 },
    { x: 166, y: 0, w: 166, h: 50 },
    { x: 332, y: 0, w: 166, h: 50 },
    { x: 498, y: 0, w: 166, h: 50 },
    { x: 664, y: 0, w: 166, h: 50 },
    { x: 830, y: 0, w: 166, h: 50 },
    { x: 996, y: 0, w: 166, h: 50 },
    { x: 1162, y: 0, w: 166, h: 50 },
    { x: 1328, y: 0, w: 166, h: 50 },
    { x: 1494, y: 0, w: 166, h: 50 },
    { x: 1660, y: 0, w: 166, h: 50 },
    { x: 1826, y: 0, w: 166, h: 50 },
    { x: 1992, y: 0, w: 166, h: 50 },
    { x: 2158, y: 0, w: 166, h: 50 },
    { x: 2324, y: 0, w: 166, h: 50 },
    { x: 2490, y: 0, w: 166, h: 50 },
    { x: 2656, y: 0, w: 166, h: 50 },
    { x: 2822, y: 0, w: 166, h: 50 },
    { x: 2988, y: 0, w: 166, h: 50 },
  ],
};
const framesXLength = imgData.frames.length;
const numParticles = 1000;

/*----------  SET STAGE  ----------*/
const container = document.getElementById('ddd-container');
const webgl = new Webgl(container);
const stage = new Stage(imgData, webgl, numParticles);

const map = new Map({
  center: { lon: -71.999996, lat: 4.000002 }, // Center of Colombia
});

function imgReady() {
  yearsMenu(1993, 2015, year, yearClickEvent, (menu, currEle) => {
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
  oReq
    .json({
      url: '../../data/ingeominas/eq' + year + '.json',
      container: container,
      loadingMsg: 'Loading Seismic Data',
    })
    .then((d) => {
      seismicData = d;
      seismicDataI = 0;
      assetLoaded();
    })
    .catch((err) => {
      console.error(err);
    });

  if (!taDataLoaded) {
    json({
      url: '../../data/cmh/AtentadosTerroristas1988-2012.json',
      container: container,
      loadingMsg: 'Loading Violence Data',
    })
      .then((d) => {
        taData = d;
        taDataLoaded = true;
        getFirstAttackOfYear();
        assetLoaded();
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

function yearClickEvent(event) {
  if (event.target !== currentYear) {
    window.cancelAnimationFrame(animReq);
    assetsLoaded -= 1;
    oReq.abort();
    resetCurrent(currentYear, event.target);
    currentYear = event.target;
    year = Number(event.target.textContent);
    stage.children = [];
    getFirstAttackOfYear();

    loadData();
  }
}

function getFirstAttackOfYear() {
  const yearStart = Date.parse(year) / 1000;
  const taDataI = taData.findIndex((obj) => obj.date.unix >= yearStart);
  taTime = taData[taDataI].date.unix;
}

function init() {
  for (let i = numParticles - 1; i >= 0; i--) {
    stage.particle(new Bird());
  }
  animReq = requestAnimationFrame(animate);
}

function attackHold(coords, end) {
  const cl = stage.children.length;
  const vector = new Vector(coords.x + centerX, coords.y + centerY);

  function hold(timestamp) {
    if (timestamp < end) {
      for (let i = cl - 1; i >= 0; i--) {
        const bird = stage.children[i];
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
    const d = seismicData[seismicDataI];
    const currTime = d.date.unix;

    if (taTime && currTime >= taTime) {
      console.log('attack');
      let impact = taData[taDataI].fatal ? taData[taDataI].fatal * 100 : 0;
      impact += taData[taDataI].injured ? taData[taDataI].injured * 30 : 0;

      const attackCoords = map.convertCoordinates(taData[taDataI].place.lon, taData[taDataI].place.lat);
      attackHold(attackCoords, timestamp + impact);

      if (taDataI < taData.length - 1) {
        taDataI++;
        taTime = taData[taDataI].date.unix;
      } else {
        taTime = false;
      }
    }

    if (d.ml > 3 || seismicDataI === 0) {
      const coords = map.convertCoordinates(d.lon, d.lat);
      target.set(coords.x + centerX, coords.y + centerY, d.km || 200);
    }

    updateBirds();

    webgl.render(stage);
    seismicDataI++;
    animReq = requestAnimationFrame(animate);
  } else {
    target.set(-stageW, centerY, -200);
    end = timestamp + 5000;
    animReq = requestAnimationFrame(endAnimation);
  }
}

function updateBirds() {
  for (let i = stage.children.length - 1; i >= 0; i--) {
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

class Bird {
  constructor() {
    this.rotation = 0.5;
    this.scale = 1;
    this.alpha = 1;
    this.x = random(-stageW / 2, 0);
    this.y = random(0, stageH);
    this.frame = random(0, framesXLength);
    this.position = new Vector();
    this.velocity = new Vector();
    this.position.x = random(-stageW, stageW * 2);
    this.position.y = random(-stageH, stageH * 2);
    this.position.z = random(-300, -200, true);
    this.velocity.x = random(1, 2, true);
    this.velocity.y = random(1, 2, true);
    this.velocity.z = random(1, 2, true);
    this.acceleration = new Vector();
    this.steer = new Vector();
    this.posSum = new Vector();
    this.separate = new Vector();
  }
  run() {
    if (Math.random() > 0.5) {
      this.flock();
    }
    this.move();
  }
  flock() {
    this.acceleration.add(this.reach(0.005));
    this.acceleration.add(this.separation(stage.children));
  }
  move() {
    this.velocity.add(this.acceleration);
    const l = this.velocity.length();
    if (l > _maxSpeed) {
      this.velocity.divideScalar(l / _maxSpeed);
    }
    this.position.add(this.velocity);
    this.acceleration.set(0, 0, 0);
  }
  repulse(v) {
    const distance = this.position.distanceTo(v);
    if (distance < stageW) {
      this.steer.subVectors(this.position, v);
      this.steer.multiplyScalar(0.5 / distance);
      this.acceleration.add(this.steer);
    }
  }
  reach(amount) {
    this.steer.subVectors(target, this.position);
    this.steer.multiplyScalar(amount);
    return this.steer;
  }
  separation(flock) {
    this.posSum.set(0, 0, 0);

    for (let i = numParticles - 1; i >= 0; i -= 11) {
      if (Math.random() > 0.5) {
        continue;
      }
      const bird = flock[i];
      const distance = bird.position.distanceTo(this.position);

      if (distance > 0 && distance <= _neighborhoodRadius) {
        this.separate.subVectors(this.position, bird.position);
        this.separate.normalize();
        this.separate.divideScalar(distance);
        this.posSum.add(this.separate);
      }
    }
    return this.posSum;
  }
  update() {
    this.run();
    this.ry = Math.atan2(-this.velocity.y, this.velocity.x);
    this.rz = (Math.asin(this.velocity.z / this.velocity.length()) * 180) / PI;
    this.x = this.position.x;
    this.y = this.position.y;
    this.rotation = this.ry > 0 ? HALF_PI - this.ry : HALF_PI - this.ry + TWO_PI;
    this.frame = this.rz > 0 ? (this.rz / framesXLength) | 0 : ((this.rz + 360) / framesXLength) | 0;
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
  }
}
