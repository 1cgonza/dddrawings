import { json } from 'dddrawings';
import Notations from './pulseNotations.js';
import Mask from './Mask.js';
import Map from './Map.js';
// import Audio from './Audio.js';
// import Menu from './Menu.js';
import MemoryPalace from './MemoryPalace.js';

/*----------  SET STAGE  ----------*/
const container = document.getElementById('ddd-container');
const notations = new Notations(container);
const mask = new Mask(container);
const map = new Map(container);
// const audio = new Audio();
const memory = new MemoryPalace(container);

async function init() {
  const { Map: GoogleMap } = await google.maps.importLibrary('maps');
  map.init(GoogleMap);
}

init();

/*----------  GLOBALS  ----------*/
let animReq;
let pulseData = [];
let pulseDataLoaded = false;
let dataLenght = 0;
let dataI = 0;
let maxBeat = 563;
let minBeat = 462;
let beatRange = maxBeat - minBeat;
let beatStep = 1 / beatRange;

json('/data/pulse/heart.2.json')
  .then((ret) => {
    for (let i = 0; i < ret.beats.length; i++) {
      let d = ret.beats[i];
      if (d.charAt(0) === 'S') {
        pulseData.push(+d.substr(1));
      }
    }
    pulseDataLoaded = true;
    dataLenght = pulseData.length;
    notations.bindData(pulseData);
    notations.init();
    heart();
    memory.invokeStatic();
  })
  .catch((err) => {
    console.error(err);
  });

function heart() {
  if (dataI < dataLenght) {
    let beat = pulseData[dataI];
    let o = (maxBeat - beat) * beatStep;
    map.layer.style.opacity = o;
    memory.updateOpacity(o);
    notations.update(dataI);
    dataI++;
  } else {
    window.cancelAnimationFrame(animReq);
  }
  animReq = requestAnimationFrame(heart);
}

notations.stage.canvas.onclick = (event) => {
  dataI = notations.getNewI(event.clientX);
  return false;
};

window.onresize = () => {
  mask.resize();
};
