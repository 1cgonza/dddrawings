import Notations from './pulseNotations';
import Mask from './Mask';
import Map from './Map';
import Audio from './Audio';
import Menu from './Menu';

/*----------  SET STAGE  ----------*/
var container = document.getElementById('ddd-container');
var animReq;
var notations = new Notations(container);
var mask = new Mask(container);
var map = new Map(container);
var audio = new Audio();

window.init = function() {
  map.init();
};

/*----------  GLOBALS  ----------*/
var pulseData = [];
var pulseDataLoaded = false;
var dataLenght = 0;
var dataI = 0;
var maxBeat = 563;
var minBeat = 462;
var beatRange = maxBeat - minBeat;
var beatStep = 1 / beatRange;

var pulse = DDD.json('/data/pulse/heart.2.json')
  .then(ret => {
    for (var i = 0; i < ret.beats.length; i++) {
      var d = ret.beats[i];
      if (d.charAt(0) === 'S') {
        pulseData.push(+d.substr(1));
      }
    }
    pulseDataLoaded = true;
    dataLenght = pulseData.length;
    notations.bindData(pulseData);
    notations.init();
    heart();
  })
  .catch(err => {
    console.error(err);
  });

function heart() {
  if (dataI < dataLenght) {
    var beat = pulseData[dataI];
    map.layer.style.opacity = (maxBeat - beat - (beatRange / 3)) * beatStep;
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
