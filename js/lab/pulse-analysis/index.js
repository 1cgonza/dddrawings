import { canvas, json } from 'dddrawings';
import Drawing from './Drawing';

/*----------  SET STAGE  ----------*/
const container = document.getElementById('ddd-container');
const info = document.createElement('span');
container.style.textAlign = 'center';
info.className = 'info';
container.appendChild(info);

/*----------  GLOBALS  ----------*/
const chunkW = window.innerWidth - 100;
const minMaxValues = {
  raw: { min: 100000, max: 0 },
  beat: { min: 100000, max: 0 }
};
let rawData = [];
let uniqueBeatValues = [];
let chunkIndex = 0;
let count = 0;
let peaksCount = 0;

json({
  url: '../../data/pulse/heart.2.json',
  container: container,
  loadingMsg: 'Loading Pulse Data'
})
  .then(data => {
    data.beats.forEach(point => {
      const value = Number(point.substr(1));

      if (point.charAt(0) === 'S') {
        rawData[count] = { raw: value };

        checkMinMax(value, 'raw');
        count++;
      } else if (point.charAt(0) === 'B') {
        rawData[count - 1].bpm = value;
      }
    });

    arrayChunks();
  })
  .catch(err => console.error(err));

function printInfo() {
  info.innerHTML =
    `RAW - Min: ${minMaxValues.raw.min} - ` +
    `Max: ${minMaxValues.raw.max} || ` +
    `BEATS - Min: ${minMaxValues.beat.min} - ` +
    `Max: ${minMaxValues.beat.max}<br/>` +
    `Beats Count (peaks): ${peaksCount} || ` +
    `Total Count: ${rawData.length}<br/>` +
    `Unique Beats #: ${uniqueBeatValues.length}<br/><br/>`;
}

function newArrayBeats(value) {
  peaksCount++;
  /**
   * some() Tests an element in an array with the passed function.
   * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some
   **/
  const alreadyExists = uniqueBeatValues.some(element => element === value);

  if (!alreadyExists) {
    uniqueBeatValues.push(value);
  }

  uniqueBeatValues.sort();

  checkMinMax(value, 'beat');
}

function checkMinMax(value, type) {
  if (value < minMaxValues[type].min) {
    minMaxValues[type].min = value;
  }

  if (value > minMaxValues[type].max) {
    minMaxValues[type].max = value;
  }
}

function getCanvasRow() {
  const c = canvas(container, {
    position: 'relative',
    w: chunkW,
    h: minMaxValues.raw.max - minMaxValues.raw.min + 20,
    font: '10px Inconsolata'
  });
  c.canvas.style.margin = '0 auto';

  return c;
}

/**
 * Instead of using a loop here I will use the requestAnimationFrame
 * That way the page renders progresively each canvas, as if it was loading faster.
 * With a loop, the page only renders when the loop is done, leaving the page blank for a long time.
 **/
function arrayChunks() {
  if (chunkIndex < rawData.length) {
    const data = rawData.slice(chunkIndex, chunkIndex + chunkW);
    const c = getCanvasRow();

    new Drawing(c, data, minMaxValues, newArrayBeats);
    requestAnimationFrame(arrayChunks);
  }
  chunkIndex += chunkW;
  printInfo();
}

/**
 *
 * Just here for debuging. Helps to load just one of the canvases at a time.
 *
 **/

function renderSingleChunk(start) {
  var slicedData = rawData.slice(chunkW * start, chunkW * (start + 1));
  var c = getCanvasRow();

  new Drawing(c, slicedData, minMaxValues, newArrayBeats);
}
