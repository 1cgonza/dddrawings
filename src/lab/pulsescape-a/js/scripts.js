(function () {
  'use strict';
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');

  /*----------  CREATE CANVAS  ----------*/
  var canvas = document.createElement('canvas');
  var ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  var centerX = canvas.width / 2  | 0;
  var centerY = canvas.height / 2 | 0;
  container.appendChild(canvas);

  /*----------  GLOBALS  ----------*/
  var req = new DREQ();
  var pulse = [];
  var ringsGap = 0;
  var ringsTotal = 0;
  var ringsCount = 0;
  var counter = 0;
  var loop = 0;
  var night = false;
  var animationReq;

  req.getD( '../../data/pulse/heart.2.json', init );

  function init (data) {
    for (var i = 0; i < data.beats.length; i++) {
      if (data.beats[i].charAt(0) === 'S') {
        pulse.push( Number( data.beats[i].substr(1) ) );
      }
    }
    ringsTotal = pulse.length / 720;
    ringsGap = ringsTotal / canvas.height;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';

    restart();
    animationReq = requestAnimationFrame(render);
    loading.style.opacity = 0;
  }

  function restart () {
    ctx.translate(centerX, centerY);
    ringsCount = 0;
    counter = 0;
    loop = 0;
    animationReq = requestAnimationFrame(render);
  }

  function render() {
    if (ringsCount <= ringsTotal) {
      var reduce = ringsCount * ringsGap - (loop * canvas.width);
      if (reduce > canvas.width) {
        loop++;
      }

      for (var i = 0; i < 720; i++) {
        ctx.save();
          ctx.rotate(i * Math.PI / 360);
          if (counter < pulse.length) {
            ctx.fillRect(0,  pulse[counter] - reduce, 1, 1);
            counter++;
          }
        ctx.restore();
      }
      ringsCount++;

      animationReq = requestAnimationFrame(render);
    } else {
      console.log('Done rendering');
    }
  }

  document.addEventListener('click', function (event) {
    window.cancelAnimationFrame(animationReq);
    night = !night;

    ctx.translate(-centerX, -centerY);

    if (night) {
      ctx.fillStyle = '#1D1D1D';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2';
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    }

    restart();
  });

})();