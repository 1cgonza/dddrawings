export default class Brain {
  constructor() {
    this.year = 1993;
    this.radius = 150;
    this.nodeWidth = 15;
    this.opacity = 0.5;
    this.powOf = 2;
    this.dividedBy = 1;
    this.highMagnitude = '#1f8846';
    this.lowMagnitude = '#A16E15';
    this.taColor = '#c03717';
    this.taSize = 120;
    this.rangeStart = 0;
    this.rangeEnd = 7;
    this.stageW = window.innerWidth;
    this.stageH = window.innerHeight;
    this.secondsW = 0;
    this.eqData = [];
    this.taData = [];
    this.center = {
      x: this.stageW / 2,
      y: this.stageH / 2,
      node: this.nodeWidth / 2,
    };
  }
}
