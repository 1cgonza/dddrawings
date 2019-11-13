import { canvas, DataRequest, yearsMenu, resetCurrent } from 'dddrawings';
import sortObj from './sort';

const container = document.getElementById('ddd-container');
const req = new DataRequest();
let year = 2008;
let summary = {};
let current;

/*----------  SET STAGE  ----------*/
const stage = canvas(container);
stage.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';

const summaryContainer = document.createElement('ol');
summaryContainer.style.zIndex = '9999';
summaryContainer.style.position = 'absolute';
summaryContainer.style.top = '30px';
summaryContainer.style.left = '30px';
summaryContainer.style.lineHeight = '1.8';
summaryContainer.style.fontSize = '12px';
summaryContainer.style.margin = 0;
container.appendChild(summaryContainer);

yearsMenu(2008, 2016, 2008, clickEvent, menuReady);

function clickEvent(event) {
  if (event.target !== current) {
    summaryContainer.innerHTML = '';
    req.abort();
    resetCurrent(current, event.target);
    current = event.target;
    year = Number(event.target.textContent);
    loadData();
  }
}

function menuReady(menu, first) {
  container.appendChild(menu);
  current = first;
  loadData();
}

function loadData() {
  if (summary.hasOwnProperty(year)) {
    renderSummary();
  } else {
    req
      .json({
        url: `../../data/monitor/violencia-${year}.json`,
        container: container,
        loadingMsg: 'Loading Data'
      })
      .then(res => {
        categorizeEvents(res.data);
        renderSummary();
      })
      .catch(err => console.error(err));
  }
}

function categorizeEvents(d) {
  // leave empty space at the beggining of the string, pushes this to the top when sorting
  const totalVictimsKey = ` Total de Victimas en el año ${year}`;
  let cats = {};
  cats[totalVictimsKey] = 0;

  d.forEach(event => {
    event.cat.forEach(name => {
      if (!cats.hasOwnProperty(name)) {
        cats[name] = [];
        cats[name].totalVictimas = 0;
      }

      if (event.hasOwnProperty('vTotal')) {
        const count = event.vTotal;
        // global count
        cats[totalVictimsKey] += count;
        // category count
        cats[name].totalVictimas += count;
      }

      cats[name].push(event);
    });
  });

  summary[year] = cats;
}

function renderSummary() {
  const d = sortObj(summary[year]);

  for (let category in d) {
    let ele;

    if (Array.isArray(d[category])) {
      ele = document.createElement('li');
      ele.textContent = `${category} | #Eventos: ${d[category].length}, #Victimas: ${d[category].totalVictimas}`;
      ele._dddCategory = category;
      ele.style.cursor = 'pointer';
      ele.style.color = '#777';
      ele.onclick = drawChart;
    } else {
      ele = document.createElement('h3');
      ele.textContent = category + ': ' + d[category];
    }

    summaryContainer.appendChild(ele);
  }
}

function drawChart(eve) {
  const category = eve.target._dddCategory;
  const d = summary[year][category];
  const timeStart = Date.parse(`${year}/01/01 00:00:00`) / 1000;
  const timeEnd = Date.parse(`${year + 1}/01/01 00:00:00`) / 1000;
  const step = stage.w / (timeEnd - timeStart);
  const y = eve.target.offsetTop + 40;

  d.forEach(event => {
    const timeEvent = event.hasOwnProperty('fecha') ? event.fecha.unix : null;
    const victims = event.hasOwnProperty('vTotal') ? event.vTotal : 0;
    const timeX = timeEvent - timeStart;

    stage.ctx.beginPath();
    stage.ctx.moveTo(timeX * step, y);
    stage.ctx.lineTo(timeX * step, y - victims);
    stage.ctx.stroke();
  });
}
