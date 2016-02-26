(function () {
  'use strict';
  var loaded    = false;
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');

  /*----------  CREATE CANVAS  ----------*/
  var canvas = document.createElement('canvas');
  var ctx    = canvas.getContext('2d');
  var centerX = canvas.width / 2  | 0;
  var centerY = canvas.height / 2 | 0;
  var canvas2 = document.createElement('canvas');
  var ctx2 = canvas2.getContext('2d');

  canvas.style.position = 'absolute';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.zIndex = 2;
  container.appendChild(canvas);

  canvas2.style.position = 'fixed';
  canvas2.style.top = 0;
  canvas2.style.left = 0;
  canvas2.style.zIndex = 3;
  canvas2.width = window.innerWidth;
  canvas2.height = window.innerHeight;
  ctx2.globalAlpha = 0.1;
  container.appendChild(canvas2);

  /*----------  GLOBALS  ----------*/
  var req = new DREQ();
  var btData = [];
  var dataI = 0;
  var progress, nextBeat;
  var startCounter = 0;
  var radius = 0;

  /*----------  BACKGROUND  ----------*/
  var bgImg;

  req.getD( '../../data/pulse/heart.2.json', processData );

  function processData (data) {
    var count = 0;
    for (var i = 0; i < data.beats.length; i++) {
      if ( data.beats[i].charAt(0) === 'B' && data.beats[i + 1].charAt(0) === 'Q') {
        var bpm  = Number( data.beats[i].substr(1) );
        var time = Number( data.beats[i + 1].substr(1) );
        btData[count] = { bpm: bpm, t: time };
        count++;
      }
    }

    init();
  }

  function init () {
    canvas.width  = btData.length;
    canvas.height = window.innerHeight;

    bgImg = new Image();
    bgImg.onload = loadBackground;
    bgImg.src = '../../img/backgrounds/white-paper.jpg';
  }

  function loadBackground () {
    var bg = document.createElement('canvas');
    var bgC = bg.getContext('2d');

    bg.width = window.innerWidth;
    bg.height = window.innerHeight;
    bg.style.position = 'fixed';
    bg.style.top = 0;
    bg.style.left = 0;
    bg.style.zIndex = 1;

    container.appendChild(bg);

    bgC.drawImage(
      bgImg,
      0, 0,
      1764, 1250,
      0, 0,
      bg.width, bg.height
    );

    for (var i = 0; i < btData.length; i++) {
      drawLine(i);
    }

    animate();
    loading.style.opacity = 0;
  }

  function animate (timestamp) {
    if (dataI < btData.length) {
      nextBeat = btData[dataI].t;

      if (timestamp !== undefined) {
        if (startCounter === 0) {
          startCounter = timestamp;
        }
      }

      progress = timestamp - startCounter;

      if (progress >= nextBeat) {
        var beat = btData[dataI].bpm;
        // var betweenBeats = btData[dataI].bpm;
        updateCircle(beat);
        ctx.save();
        ctx.strokeStyle = '#E80200';
        drawLine(dataI);
        ctx.restore();
        startCounter = 0;
        dataI++;
      }

      drawCircle();

      requestAnimationFrame(animate);
    } else {
      console.log('End');
    }
  }

  function updateCircle (beat) {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    radius = beat;
  }

  function drawCircle () {
    radius++;
    ctx2.beginPath();
    ctx2.arc(canvas2.width / 2, 150, radius, 0, 2 * Math.PI);
    ctx2.stroke();
  }

  function drawLine (i) {
    radius++;
    ctx.beginPath();
    ctx.moveTo(i, canvas.height);
    ctx.lineTo(i, canvas.height - btData[i].bpm * 4);
    ctx.stroke();
  }

  document.addEventListener('click', function (eve) {
    dataI = eve.pageX;
  }, false);

})();