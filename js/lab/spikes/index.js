import { json } from 'dddrawings';
import Menu from './Menu';
import Brain from './Brain';
import Sliders from './Sliders';
import Viz from './Viz';

const container = document.getElementById('ddd-container');
const options = new Brain();
const viz = new Viz(container, options);
const menu = new Menu(container, options, reload);
const sliders = new Sliders(container, options, viz);
let firstLoadCheck = false;

loadData();

/*=================================
  =            LOAD DATA            =
  =================================*/
function loadData() {
  json(`../../data/ingeominas/eq${options.year}.json`).then(eqRes => {
    const yearEnd = options.year + 1;
    const yearLength = (Date.parse(yearEnd) - Date.parse(options.year)) * 0.001;
    options.secondsW = 360 / yearLength;
    options.eqData = eqRes;

    json(`../../data/cmh/ta.json`).then(taRes => {
      if (taRes.hasOwnProperty(options.year)) {
        options.taData = taRes[options.year];
      }

      if (!firstLoadCheck) {
        menu.bindData(taRes);
        menu.buildMenu(options.year);
        viz.render();
        sliders.initSliders();
        firstLoadCheck = true;
      } else {
        viz.svg.innerHTML = '';
        viz.render();
      }
    });
  });
}

/*-----  End of LOAD DATA  ------*/

function reload() {
  viz.svg.querySelectorAll('.eq').forEach(eqNode => eqNode.setAttribute('fill', '#a7977a'));
  viz.svg.querySelectorAll('.ta').forEach(eqNode => eqNode.setAttribute('fill', '#c1978d'));
  options.eqData = [];
  options.taData = [];
  loadData();
}

/*==============================
  =            RESIZE            =
  ==============================*/
window.onresize = () => {
  options.stageW = window.innerWidth;
  options.stageH = window.innerHeight;
  options.center.x = options.stageW / 2;
  options.center.y = options.stageH / 2;
  viz.svg.setAttribute('width', options.stageW);
  viz.svg.setAttribute('height', options.stageH);
  reload();
};
/*-----  End of RESIZE  ------*/
