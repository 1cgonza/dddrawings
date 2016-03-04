(function() {
  'use strict';

  /*----------  SET STAGE  ----------*/
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');
  var info      = document.createElement('span');
  container.style.textAlign = 'center';
  info.className = 'info';
  container.appendChild(info);

  /*----------  GLOBALS  ----------*/
  var rawData          = [];
  var uniqueBeatValues = [];
  var chunkIndex       = 0;
  var count            = 0;
  var chunkW           = window.innerWidth - 100;
  var peaksCount       = 0;
  var minMaxValues = {
    raw: {min: 100000, max: 0},
    beat: {min: 100000, max: 0}
  };

  DDD.json('../../data/pulse/heart.2.json', processData);

  function processData(data) {
    for (var i = 0; i < data.beats.length; i++) {
      var point = data.beats[i];
      var value = Number(point.substr(1));

      if (point.charAt(0) === 'S') {
        rawData[count] = {raw: value};

        checkMinMax(value, 'raw');
        count++;
      } else if (point.charAt(0) === 'B') {
        var preVal = rawData[count - 1];
        rawData[count - 1].bpm = value;
      }
    }

    arrayChunks();
  }

  function printInfo() {
    info.innerHTML =  'RAW - Min: ' + minMaxValues.raw.min + ' - Max: ' + minMaxValues.raw.max + ' || ' +
                      'BEATS - Min: ' + minMaxValues.beat.min + ' - Max: ' + minMaxValues.beat.max + '<br/>' +
                      'Beats Count (peaks): ' + peaksCount + ' || ' +
                      'Total Count: ' + rawData.length + '<br/>' +
                      'Unique Beats #: ' + uniqueBeatValues.length;
  }

  function newArrayBeats(value) {
    peaksCount++;
    /**
    * some() Tests an element in an array with the passed function.
    * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some
    **/
    var alreadyExists = uniqueBeatValues.some(function(element) {
      return element === value;
    });

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
    var c = DDD.canvas(container, {
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
      var data = rawData.slice(chunkIndex, chunkIndex + chunkW);
      var c = getCanvasRow();

      new Drawing(c, data);
      requestAnimationFrame(arrayChunks);
    } else {
      loading.style.opacity = 0;
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

    new Drawing(c, slicedData);
  }

  function Drawing(c, data) {
    this.data          = data;
    this.canvas        = c.canvas;
    this.ctx           = c.ctx;
    this.h             = c.h;
    this.dataUpCounter = 0;
    this.timeBtwnBeats = 0;
    this.lastBeat      = 0;
    this.gap           = 1;

    for (var i = 0; i < this.data.length; i++) {
      // add .5 pixels to correct the canvas line rendering.
      var x = i * this.gap + 0.5;

      if (this.data[i].hasOwnProperty('bpm')) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.h);
        this.ctx.strokeStyle = 'deeppink';
        this.ctx.lineTo(x, this.h + minMaxValues.raw.min - this.data[i].raw - (this.data[i].bpm * 0.5));
        this.ctx.strokeText(this.data[i].bpm + ', ' + this.data[i].raw, x - 5, this.h + minMaxValues.raw.min - this.data[i].raw - (this.data[i].bpm * 0.5));
        this.ctx.stroke();
      }

      if (i > 0 && this.data[i].raw > this.data[i - 1].raw) {
        this.dataUpCounter++;
      }

      if (this.dataUpCounter > 3 && this.data[i].raw >= this.data[i - 1].raw && this.sampleSum(i) > 10 && this.data[i].raw >= 518) {
        this.dataUpCounter = 0;

        this.ctx.beginPath();
        this.ctx.moveTo(x, this.h);
        this.ctx.lineTo(x, this.h + minMaxValues.raw.min - this.data[i].raw);
        this.ctx.strokeStyle = 'crimson';
        this.ctx.stroke();
        this.printText(x, i);
        // this.ctx.strokeText( this.data[i], x - 5, this.h + minMaxValues.raw.min - this.data[i] - 3 );

        if (this.timeBtwnBeats > 55) this.errorSampleRange(x);

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

  Drawing.prototype.printText = function(x, i) {
    this.ctx.strokeText(this.data[i].raw, x - 5, this.h + minMaxValues.raw.min - this.data[i].raw - 3);
  };

  Drawing.prototype.sampleSum = function(i) {
    var sum = 0;
    var sample = 15;

    if (i < this.data.length - 1 && this.data[i].raw > this.data[i + 1].raw) {
      if (this.data.length > sample && i > sample) {
        for (var j = 0; j < sample; j++) {

          sum += this.data[i - j].raw - this.data[i - j - 1].raw;
        }
      } else if (i > sample) {
        for (var n = 0; n < this.data.length; n++) {
          sum += this.data[i - n].raw - this.data[i - n - 1].raw;
        }
      }
    }
    return sum;
  };

  Drawing.prototype.errorSampleRange = function(x) {
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    this.ctx.beginPath();
    this.ctx.rect(this.lastBeat, 0, x - this.lastBeat, this.h);
    this.ctx.fillStyle = 'green';
    this.ctx.fill();
    this.ctx.restore();
  };
})();
