export default class Drawing {
  constructor(c, data, minMaxValues, newArrayBeats) {
    this.data = data;
    this.canvas = c.canvas;
    this.ctx = c.ctx;
    this.minMaxValues = minMaxValues;
    this.h = c.h;
    this.dataUpCounter = 0;
    this.timeBtwnBeats = 0;
    this.lastBeat = 0;
    this.gap = 1;

    for (let i = 0; i < this.data.length; i++) {
      // add .5 pixels to correct the canvas line rendering.
      const x = i * this.gap + 0.5;

      if (this.data[i].hasOwnProperty('bpm')) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.h);
        this.ctx.strokeStyle = 'deeppink';
        this.ctx.lineTo(x, this.h + minMaxValues.raw.min - this.data[i].raw - this.data[i].bpm * 0.5);
        this.ctx.strokeText(
          this.data[i].bpm + ', ' + this.data[i].raw,
          x - 5,
          this.h + minMaxValues.raw.min - this.data[i].raw - this.data[i].bpm * 0.5
        );
        this.ctx.stroke();
      }
      if (i > 0 && this.data[i].raw > this.data[i - 1].raw) {
        this.dataUpCounter++;
      }
      if (
        this.dataUpCounter > 3 &&
        this.data[i].raw >= this.data[i - 1].raw &&
        this.sampleSum(i) > 10 &&
        this.data[i].raw >= 518
      ) {
        this.dataUpCounter = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.h);
        this.ctx.lineTo(x, this.h + minMaxValues.raw.min - this.data[i].raw);
        this.ctx.strokeStyle = 'crimson';
        this.ctx.stroke();
        this.printText(x, i);
        // this.ctx.strokeText( this.data[i], x - 5, this.h + minMaxValues.raw.min - this.data[i] - 3 );
        if (this.timeBtwnBeats > 55) {
          this.errorSampleRange(x);
        }
        this.timeBtwnBeats = 0;
        this.lastBeat = x;
        newArrayBeats(this.data[i].raw);
      } else {
        this.timeBtwnBeats++;
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.h);
        this.ctx.lineTo(x, this.h + minMaxValues.raw.min - this.data[i].raw);
        if (this.data[i].raw < 490) {
          this.ctx.strokeStyle = 'blue';
          this.printText(x, i);
        } else if (this.data[i].raw === 518) {
          this.ctx.strokeStyle = '#a16ccb';
          this.printText(x, i);
        } else {
          this.ctx.strokeStyle = 'black';
        }
        this.ctx.stroke();
      }
    }
    /**
     * When the loop ends we check again if the last beat did not happen within the normal rate.
     * If so, we label the area as an error sample.
     **/
    if (this.timeBtwnBeats > 55) {
      this.errorSampleRange(this.data.length * this.gap + 0.5);
    }
  }

  printText(x, i) {
    this.ctx.strokeText(this.data[i].raw, x - 5, this.h + this.minMaxValues.raw.min - this.data[i].raw - 3);
  }

  sampleSum(i) {
    const sample = 15;
    let sum = 0;

    if (i < this.data.length - 1 && this.data[i].raw > this.data[i + 1].raw) {
      if (this.data.length > sample && i > sample) {
        for (let j = 0; j < sample; j++) {
          sum += this.data[i - j].raw - this.data[i - j - 1].raw;
        }
      } else if (i > sample) {
        for (let n = 0; n < this.data.length; n++) {
          sum += this.data[i - n].raw - this.data[i - n - 1].raw;
        }
      }
    }
    return sum;
  }

  errorSampleRange(x) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.rect(this.lastBeat, 0, x - this.lastBeat, this.h);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.restore();
  }
}
