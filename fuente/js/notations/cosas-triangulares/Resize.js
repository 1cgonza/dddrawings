import { sizeFromPercentage, getPercent } from 'dddrawings';
import options from './options.js';

export default class Resize {
  constructor(middle, right) {
    this.left = document.getElementById('left-col');
    this.middle = middle;
    this.right = right;
    this.ready = false;
    this.stage();
  }

  stage() {
    this.height = window.innerHeight;
  }

  timeline(stage) {
    const h = this.height;
    const ih = 1218;

    stage.canvas.width = this.middle.offsetWidth;
    stage.canvas.height = h;
    stage.imgResizeW = stage.canvas.width * (h / ih);
    stage.pageH = h;
    stage.offTop = sizeFromPercentage(options.percent.top, stage.pageH);
    stage.offBottom = sizeFromPercentage(options.percent.bottom, stage.pageH);
    stage.step = sizeFromPercentage(options.percent.h, stage.pageH) / options.secondsPerPage;
    this.middle.style.height = `${h}px`;

    if (stage.canvas.width > stage.imgResizeW) {
      stage.imgX = (stage.canvas.width - stage.imgResizeW) / 2;
    } else {
      stage.imgX = 0;
    }
  }

  notations(stage) {
    const w = this.right.offsetWidth;
    const h = this.height;
    const h2 = sizeFromPercentage(getPercent(w, stage.imgW), stage.imgH) / 4;
    stage.canvas.width = w;
    stage.canvas.height = h;
    stage.headerY = h / 2;
    stage.offTop = sizeFromPercentage(options.percent.top, h2);
    stage.offBottom = sizeFromPercentage(options.percent.bottom, h2);
    stage.step = sizeFromPercentage(options.percent.h, h2) / options.secondsPerPage;
  }

  video(video) {
    const w = this.left.clientWidth;
    const resizePercent = (w / video.width) * 100;
    video.width = w;
    video.height = sizeFromPercentage(resizePercent, video.height);
  }

  all(timeline, notations, video) {
    return new Promise((res) => {
      this.stage();
      this.timeline(timeline);
      this.notations(notations);
      this.video(video);
      res();
    });
  }
}
