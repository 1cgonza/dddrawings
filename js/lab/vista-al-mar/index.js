import Notations from './pulseNotations';
import Mask from './Mask';
import Map from './Map';
import Audio from './Audio';
import Menu from './Menu';
import MemoryPalace from './MemoryPalace';

/*----------  SET STAGE  ----------*/
const container = document.getElementById('ddd-container');
const notations = new Notations(container);
const mask = new Mask(container);
const map = new Map(container);
const audio = new Audio();
const memory = new MemoryPalace(container);

window.init = function() {
  map.init();
};

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

let pulse = DDD.json('/data/pulse/heart.2.json').then(ret => {
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
}).catch(err => {
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

window.onresize = (event) => {
  mask.resize();
};
