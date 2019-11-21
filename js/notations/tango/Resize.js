import { getPercent, sizeFromPercentage } from 'dddrawings';

export default class Resize {
  constructor(images, timeline, notations, labelBox, video, repaintTimeline, updateNotations) {
    this.images = images;
    this.t = timeline;
    this.n = notations;
    this.labelBox = labelBox;
    this.video = video;
    this.repaintTimeline = repaintTimeline;
    this.updateNotations = updateNotations;
  }

  bindData(data, timelineBg) {
    this.d = data;
    this.timelineBg = timelineBg;
  }

  reset() {
    const bleedBottom = 30;
    this.bottomW = window.innerWidth;
    this.topH = document.getElementById('header').offsetHeight;
    this.timelinePercent = getPercent(this.bottomW, this.images.totalW);
    this.bottomH = (sizeFromPercentage(this.timelinePercent, this.images.height) + bleedBottom) | 0;
    this.leftH = window.innerHeight - this.topH - this.bottomH;
    this.notationsPercent = getPercent(this.leftH, this.images.height);
  }

  timeline(noReset) {
    if (!this.d) return;
    if (!noReset) this.reset();

    this.timelineH = sizeFromPercentage(this.timelinePercent, this.images.height) | 0;
    this.t.canvas.width = this.timelineBg.canvas.width = this.bottomW;
    this.t.canvas.height = this.timelineBg.canvas.height = this.bottomH;
    this.t.stage.container.style.height = `${this.bottomH}px`;

    if (this.bottomH > this.timelineH) {
      this.t.offY = this.bottomH / 2 - this.timelineH / 2;
    } else {
      this.t.offY = 0;
    }

    this.t.offX = sizeFromPercentage(this.timelinePercent, this.d.initX) | 0;
    this.t.ctx.strokeStyle = 'red';

    this.images.timelineW = sizeFromPercentage(this.timelinePercent, 1000);
  }

  notations(noReset) {
    if (!this.d) return;
    if (!noReset) this.reset();
    const left = this.n.stage.container;

    this.leftW = left.offsetWidth;
    left.style.top = `${this.topH}px`;
    left.style.height = `${this.leftH}px`;

    this.n.resizeW = sizeFromPercentage(this.notationsPercent, this.images.totalW);
    this.n.canvas.height = this.leftH;
    this.n.canvas.width = this.leftW;

    this.n.offX = sizeFromPercentage(this.notationsPercent, this.d.initX) | 0;
    this.n.ctx.strokeStyle = 'red';

    this.labelBox.style.left = `${this.n.offX}px`;

    this.images.notationsW = sizeFromPercentage(this.notationsPercent, 1000);
  }

  videoData(noReset) {
    if (!this.d) return;
    if (!noReset) this.reset();
    const videoH = window.innerHeight - this.bottomH;
    const x = this.d.endX - this.d.initX;
    this.video.style.maxHeight = `${videoH}px`;
    this.video.style.marginTop = `${videoH / 2 - this.video.offsetHeight / 2}px`;

    this.videoTimelineW = this.video.duration / sizeFromPercentage(this.timelinePercent, x);
    this.videoNotationsW = this.video.duration / sizeFromPercentage(this.notationsPercent, x);
  }

  resizeData() {
    if (!this.d) return;
    this.d.sections.forEach((d, i) => {
      const x = d.x;
      const w = i === this.d.sections.length - 1 ? this.d.endX - x : this.d.sections[i + 1].x - x;
      d.nX = sizeFromPercentage(this.notationsPercent, x) | 0;
      d.nW = sizeFromPercentage(this.notationsPercent, w) | 0;
      d.tX = sizeFromPercentage(this.timelinePercent, x) | 0;
      d.tW = sizeFromPercentage(this.timelinePercent, w) | 0;
    });

    this.d.labels.forEach(d => {
      d.nX = sizeFromPercentage(this.notationsPercent, d.x) | 0;
      d.nY = (this.topH + sizeFromPercentage(this.notationsPercent, d.y)) | 0;
      d.nW = sizeFromPercentage(this.notationsPercent, d.w) | 0;
      d.nH = sizeFromPercentage(this.notationsPercent, d.h) | 0;
    });
  }

  updateRepaint = () => {
    this.reset();
    this.timeline(true);
    this.notations(true);
    this.videoData(true);
    this.resizeData();
    this.repaintTimeline();
    this.updateNotations();
  };

  all() {
    this.reset();
    this.timeline(true);
    this.notations(true);
    this.videoData(true);
    this.resizeData();
  }
}
