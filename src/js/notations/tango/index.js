import { canvas, json } from 'dddrawings';
import Resize from './Resize.js';
import { Notations, notationsVideo } from '../../utils/Notations.js';
import Images from './Images.js';
import debug from './debugger.js';

/*----------  Elements  ----------*/
const bottom = document.getElementById('bottom');
const left = document.getElementById('left');
const labelBox = document.getElementById('label-box');
const polish = document.getElementById('pol');
const eng = document.getElementById('eng');
const timeline = new Notations({ container: bottom });
const notations = new Notations({ container: left });
const images = new Images(paintTimelineFrame);
const video = document.getElementById('video');

let data = {};
let sectionsLen = 0;
let dragging = false;
let prevX = 0;
let tX = 0;
let nX = 0;
let timelineBg;
let animReq;

left.appendChild(images.loading);

notationsVideo(video).then(() => {
  init();
  video.onplay = () => (animReq = requestAnimationFrame(playerLoop));
  video.onpause = () => window.cancelAnimationFrame(animReq);
  video.onseeking = () => updateNotations();
});

const resize = new Resize(images, timeline, notations, labelBox, video, repaintTimeline, updateNotations);

function init() {
  json('/data/notations/tango.json')
    .then((d) => {
      resize.bindData(d);
      data = d;
      sectionsLen = d.sections.length;

      timelineBg = canvas(bottom, { h: timeline.canvas.height, zi: 1 });
      resize.timelineBg = timelineBg;
      resize.all();
      timelineBg.ctx.fillRect(0, 0, resize.bottomW, resize.bottomH);
      images.loading.style.opacity = 1;

      images.load(timeline.offY).then(() => {
        left.removeChild(images.loading);
        updateNotations();
        video.controls = true;
        start();
      });
    })
    .catch((err) => console.error(err));
}

function stopDrag() {
  dragging = false;
}

function start() {
  // debug();

  left.onmousedown = (event) => {
    prevX = event.clientX;
    dragging = true;
  };

  left.onmouseup = stopDrag;
  bottom.onmouseup = stopDrag;

  left.onmousemove = (event) => {
    if (dragging) {
      const distance = prevX - event.clientX;
      video.currentTime += resize.videoNotationsW * distance;
      prevX = event.clientX;
    } else {
      const x = event.clientX;
      const y = event.clientY;
      let onLabel = false;

      for (let i = 0; i < data.labels.length; i++) {
        const x1 = data.labels[i].nX - nX;
        const x2 = x1 + data.labels[i].nW;
        const y1 = data.labels[i].nY;
        const y2 = y1 + data.labels[i].nH;

        if (x >= x1 && x < x2 && y >= y1 && y < y2) {
          labelBox.className = data.labels[i].class;
          labelBox.style.top = y1 - resize.topH - 16 + 'px';
          polish.innerText = data.labels[i].label;
          eng.innerText = data.labels[i].eng;
          onLabel = true;
          labelBox.style.opacity = 1;
          break;
        }
      }

      if (!onLabel) {
        labelBox.style.opacity = 0;
      }
    }
  };

  left.onmouseleave = () => (dragging = false);

  bottom.onmousedown = (event) => {
    const distance = event.clientX - tX;
    video.currentTime += resize.videoTimelineW * distance;
    dragging = true;
  };

  bottom.onmousemove = (event) => {
    if (dragging) {
      const distance = event.clientX - tX;
      video.currentTime += resize.videoTimelineW * distance;
    }
  };
}

function playerLoop() {
  updateNotations();
  animReq = requestAnimationFrame(playerLoop);
}

function updateNotations() {
  const currentTime = video.currentTime;
  let current;
  let next;

  for (let i = 0; i < sectionsLen; i++) {
    if (i < sectionsLen - 1) {
      if (currentTime >= data.sections[i].start && currentTime < data.sections[i + 1].start) {
        current = data.sections[i];
        next = data.sections[i + 1];
        break;
      } else {
        continue;
      }
    } else {
      current = data.sections[i];
      next = {
        start: video.duration,
        x: data.endX,
      };
    }
  }

  const sectionLength = next.start - current.start;
  const timeOffset = currentTime - current.start;
  const stepN = timeOffset * (current.nW / sectionLength);
  const stepT = timeOffset * (current.tW / sectionLength);
  tX = stepT + current.tX;
  nX = stepN + (current.nX - notations.offX);

  timeline.ctx.clearRect(0, 0, resize.bottomW, resize.bottomH);
  timeline.ctx.beginPath();
  timeline.ctx.moveTo(tX, 0);
  timeline.ctx.lineTo(tX, resize.bottomH);
  timeline.ctx.stroke();

  repaintNotations(nX);

  notations.ctx.beginPath();
  notations.ctx.moveTo(notations.offX, 0);
  notations.ctx.lineTo(notations.offX, resize.leftH);
  notations.ctx.stroke();
}

function repaintNotations(x) {
  const w = images.notationsW;

  notations.ctx.clearRect(0, 0, resize.leftW, resize.leftH);
  for (let i = 0; i < images.total; i++) {
    const fx = i * w;
    const x1 = fx - x;
    const x2 = x1 + w;

    if (x2 <= 0) {
      continue;
    } else if (x1 > resize.leftW) {
      break;
    }

    paintNotationsFrame(images.frames[i], x1, w);
  }
}

function paintNotationsFrame(img, x, w) {
  notations.ctx.drawImage(img, 0, 0, images.width, images.height, x, 0, w, resize.leftH);
}

function repaintTimeline() {
  const w = images.timelineW;

  timelineBg.ctx.fillRect(0, 0, resize.bottomW, resize.bottomH);
  for (let i = 0; i < images.total; i++) {
    paintTimelineFrame(images.frames[i], i * w, timeline.offY, w);
  }
}

function paintTimelineFrame(img, x, y, w) {
  timelineBg.ctx.drawImage(img, 0, 0, images.width, images.height, x | 0, y | 0, w, resize.timelineH);
}

window.onresize = resize.updateRepaint;
