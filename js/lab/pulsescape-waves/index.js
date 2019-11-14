import { canvas, json } from 'dddrawings';

const container = document.getElementById('ddd-container');

/*----------  GLOBALS  ----------*/
let rawData = [[]];
let sliceH = 100;
let rowI = 0;
let counter = 0;
let tick = 0;
container.style.backgroundColor = '#000000';

json({
  url: '../../data/pulse/heart.2.json',
  container: container,
  loadingMsg: 'Loading Pulse Data'
})
  .then(data => {
    data.beats.forEach(beat => {
      if (beat.charAt(0) === 'S') {
        rawData[rowI].push(Number(beat.substr(1)));
        counter++;
      }

      if (counter === (rowI + 1) * window.innerWidth) {
        rowI++;
        rawData[rowI] = [];
      }
    });

    createRows();
  })
  .catch(err => console.error(err));

function createRows() {
  if (tick < rawData.length) {
    const data = rawData[tick];
    const row = canvas(container, {
      h: 100,
      position: 'initial',
      css: { marginTop: `${-(sliceH / 1.2)}px` }
    });

    draw(data, row);
    tick++;
    requestAnimationFrame(createRows);
  }
}

function draw(data, row) {
  const ctx = row.ctx;

  ctx.fillStyle = '#FFFFFF';

  data.forEach((d, i) => {
    const yPos = sliceH - (d - 440);
    const halfPoint = sliceH - (sliceH - yPos) / 2;

    ctx.beginPath();
    ctx.moveTo(i, sliceH);
    ctx.quadraticCurveTo(i - yPos, halfPoint, i, yPos);
    ctx.strokeStyle = `rgba(49,${130 - (d - 500)},${200 - (d - 500)},0.7)`;
    ctx.stroke();
    ctx.fillRect(i, yPos, 1.5, 1.5);
  });
}
