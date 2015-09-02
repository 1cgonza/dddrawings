(function () {
  'use strict';
  var loaded    = false;
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementsByClassName('loading')[0];
  var info      = document.createElement('span');
  container.style.textAlign = 'center';
  info.className = 'info';
  container.appendChild(info);

  /*==========  CREATE CANVAS  ==========*/
  var canvas = document.createElement('canvas');
  var ctx    = canvas.getContext('2d');
  var centerX, centerY;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  centerX = canvas.width / 2 | 0;
  centerY = canvas.height / 2 | 0;

  /*----------  GLOBAL VARIABLES  ----------*/
  var rawData          = [];
  var uniqueBeatValues = [];
  var chunkIndex       = 0;
  var chunkW           = window.innerWidth - 100;
  var peaksCount       = 0;
  var minMaxValues = {
    raw: {min: 100000, max: 0},
    beat: {min: 100000, max: 0}
  };

  requestData('../../data/pulse/heart.2.json', processData);

  function processData (data) {
    data.beats.forEach(newArrayCleanRawData);
    arrayChunks();
  }

  function printInfo() {
    info.innerHTML =  'RAW - Min: ' + minMaxValues.raw.min + ' - Max: ' + minMaxValues.raw.max + ' || ' +
                      'BEATS - Min: ' + minMaxValues.beat.min + ' - Max: ' + minMaxValues.beat.max + '<br/>' +
                      'Beats Count (peaks): ' + peaksCount + ' || ' +
                      'Total Count: ' + rawData.length + '<br/>' +
                      'Unique Beats #: ' + uniqueBeatValues.length;
  }

  function newArrayCleanRawData (value, index, array) {
    if( value.charAt(0) === 'S' ) {
      var beatValue = Number( value.substr(1) );
      rawData.push(beatValue);

      checkMinMax(beatValue, 'raw');
    }
  }

  function newArrayBeats (value) {
    peaksCount++;
    /**
    * some() Tests an element in an array with the passed function.
    * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some
    **/
    var alreadyExists = uniqueBeatValues.some(function (element) {
      return element === value;
    });

    if (!alreadyExists) {
      uniqueBeatValues.push(value);
    }

    uniqueBeatValues.sort();

    checkMinMax(value, 'beat');
  }

  function checkMinMax (value, type) {
    if (value < minMaxValues[type].min) {
      minMaxValues[type].min = value;
    }

    if (value > minMaxValues[type].max) {
      minMaxValues[type].max = value;
    }
  }

  /**
  * Instead of using a loop here I will use the requestAnimationFrame
  * That way the page renders progresively each canvas, as if it was loading faster.
  * With a loop, the page only renders when the loop is done, leaving the page blank for a long time.
  **/
  function arrayChunks () {
    var chunk = chunkW;

    if (chunkIndex < rawData.length) {
      var data = rawData.slice(chunkIndex, chunkIndex + chunk);
      var canvas = document.createElement('canvas');
      container.appendChild(canvas);
      new Drawing(canvas, data);
      requestAnimationFrame(arrayChunks);
    } else {
      loading.style.opacity = 0;
    }
    chunkIndex += chunk;
    printInfo();
  }

  /**
  *
  * Just here for debuging. Helps to load just one of the canvases at a time.
  *
  **/

  function renderSingleChunk(start) {
    var slicedData = rawData.slice( chunkW * start, chunkW * (start + 1) );
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    new Drawing(canvas, slicedData);
  }

  function Drawing(canvas, data) {
    this.data = data;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');

    this.canvas.height = minMaxValues.raw.max - minMaxValues.raw.min + 20;
    this.canvas.width = chunkW;

    this.dataUpCounter = 0;
    this.timeBtwnBeats = 0;
    this.lastBeat = 0;
    this.gap = 1;
    this.ctx.font = '10px serif';

    for (var i = 0; i < this.data.length; i++) {
      // add .5 pixels to correct the canvas line rendering.
      var x = i * this.gap + 0.5;

      if ( this.data[i] > this.data[i - 1] ) {
        this.dataUpCounter++;
      }

      if ( this.dataUpCounter > 3 && this.data[i] > this.data[i + 1] && this.data[i] >= this.data[i -1] && this.sampleSum(i) > 10 && this.data[i] >= 518) {
        this.dataUpCounter = 0;

        this.ctx.beginPath();
        this.ctx.moveTo( x, this.canvas.height );
        this.ctx.lineTo( x, this.canvas.height + minMaxValues.raw.min - this.data[i] );
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
        this.printText(x, i);
        // this.ctx.strokeText( this.data[i], x - 5, this.canvas.height + minMaxValues.raw.min - this.data[i] - 3 );

        if (this.timeBtwnBeats > 55) this.errorSampleRange(x);

        this.timeBtwnBeats = 0;
        this.lastBeat = x;

        newArrayBeats(this.data[i]);

      } else {
        this.timeBtwnBeats++;
        this.ctx.beginPath();
        this.ctx.moveTo( x, this.canvas.height );
        this.ctx.lineTo( x, this.canvas.height + minMaxValues.raw.min - this.data[i] );

        if (this.data[i] < 490) {
          this.ctx.strokeStyle = 'blue';
          this.printText(x, i);

        } else if (this.data[i] === 518) {
          this.ctx.strokeStyle = '#a16ccb';
          this.printText(x, i);
        }
        else {
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

  Drawing.prototype.printText = function (x, i) {
    this.ctx.strokeText( this.data[i], x - 5, this.canvas.height + minMaxValues.raw.min - this.data[i] - 3 );
  };

  Drawing.prototype.sampleSum = function(i) {
    var sum = 0;
    var sample = 15;

    if ( this.data[i] > this.data[i + 1] ) {
      if (this.data.length > sample) {
        for (var j = 0; j < sample; j++) {
          sum += this.data[i - j] - this.data[i - j - 1];
        }
      } else {
        for (var n = 0; n < this.data.length; n++) {
          sum += this.data[i - n] - this.data[i - n - 1];
        }
      }
    }
    return sum;
  };

  Drawing.prototype.errorSampleRange = function(x) {
    this.ctx.save();
      this.ctx.globalAlpha = 0.3;
      this.ctx.beginPath();
      this.ctx.rect(this.lastBeat, 0, x - this.lastBeat, this.canvas.height);
      this.ctx.fillStyle = 'green';
      this.ctx.fill();
    this.ctx.restore();
  };
})();
