(function() {
  'use strict';
  var container = document.getElementById('ddd-container');

  /*----------  SET STAGE  ----------*/
  var bg     = DDD.canvas(container, {position: 'fixed'});
  var stage  = DDD.canvas(container);
  var bgAnim = DDD.canvas(container, {position: 'fixed'});
  bgAnim.ctx.globalAlpha = 0.1;

  /*----------  GLOBALS  ----------*/
  var TWO_PI       = Math.PI * 2;
  var btData       = [];
  var dataI        = 0;
  var progress     = 0;
  var nextBeat     = 0;
  var startCounter = 0;
  var radius       = 0;

  /*----------  BACKGROUND  ----------*/
  var bgImg;

  DDD.json('../../data/pulse/heart.2.json', function(data) {
    for (var i = 0; i < data.beats.length; i++) {
      if (data.beats[i].charAt(0) === 'B' && data.beats[i + 1].charAt(0) === 'Q') {
        var bpm  = Number(data.beats[i].substr(1));
        var time = Number(data.beats[i + 1].substr(1));
        btData.push({bpm: bpm, t: time});
      }
    }

    stage.canvas.width  = btData.length;

    bg.img        = new Image();
    bg.img.onload = loadBackground;
    bg.img.src    = '../../img/backgrounds/white-paper.jpg';
  }, null, container, 'Loading Pulse Data');

  function loadBackground() {
    bg.ctx.drawImage(
      bg.img,
      0, 0,
      1764, 1250,
      0, 0,
      bg.w, bg.h
    );

    for (var i = 0; i < btData.length; i++) {
      drawLine(i);
    }

    animate();
  }

  function animate(timestamp) {
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

        bgAnim.ctx.clearRect(0, 0, bgAnim.w, bgAnim.h);
        radius = beat;

        stage.ctx.save();
        stage.ctx.strokeStyle = '#E80200';
        drawLine(dataI);
        stage.ctx.restore();
        startCounter = 0;
        dataI++;
      }

      radius++;
      bgAnim.ctx.beginPath();
      bgAnim.ctx.arc(bgAnim.w / 2, 150, radius, 0, TWO_PI);
      bgAnim.ctx.stroke();

      requestAnimationFrame(animate);
    } else {
      console.log('End');
    }
  }

  function drawLine(i) {
    radius++;
    stage.ctx.beginPath();
    stage.ctx.moveTo(i, stage.h);
    stage.ctx.lineTo(i, stage.h - btData[i].bpm * 4);
    stage.ctx.stroke();
  }

  container.onclick = function(eve) {
    dataI = eve.pageX;
    return false;
  };

})();
