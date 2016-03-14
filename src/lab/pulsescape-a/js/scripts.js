(function() {
  'use strict';
  var container = document.getElementById('ddd-container');
  var stage     = DDD.canvas(container);

  /*----------  GLOBALS  ----------*/
  var pulse      = [];
  var ringsGap   = 0;
  var ringsTotal = 0;
  var ringsCount = 0;
  var counter    = 0;
  var loop       = 0;
  var night      = false;
  var animationReq;

  DDD.json('../../data/pulse/heart.2.json', init, null, container, 'Loading Pulse Data');

  function init(data) {
    for (var i = 0; i < data.beats.length; i++) {
      if (data.beats[i].charAt(0) === 'S') {
        pulse.push(Number(data.beats[i].substr(1)));
      }
    }
    ringsTotal = pulse.length / 720;
    ringsGap   = ringsTotal / stage.canvas.height;

    stage.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';

    restart();
    animationReq = requestAnimationFrame(render);
  }

  function restart() {
    stage.ctx.translate(stage.center.x, stage.center.y);
    ringsCount = 0;
    counter = 0;
    loop = 0;
    animationReq = requestAnimationFrame(render);
  }

  function render() {
    if (ringsCount <= ringsTotal) {
      var reduce = ringsCount * ringsGap - (loop * stage.canvas.width);
      if (reduce > stage.canvas.width) {
        loop++;
      }

      for (var i = 0; i < 720; i++) {
        stage.ctx.save();
        stage.ctx.rotate(i * Math.PI / 360);
        if (counter < pulse.length) {
          stage.ctx.fillRect(0,  pulse[counter] - reduce, 1, 1);
          counter++;
        }
        stage.ctx.restore();
      }
      ringsCount++;

      animationReq = requestAnimationFrame(render);
    } else {
      console.log('Done rendering');
    }
  }

  container.onclick = function() {
    window.cancelAnimationFrame(animationReq);
    night = !night;

    stage.ctx.translate(-stage.center.x, -stage.center.y);

    if (night) {
      stage.ctx.fillStyle = '#1D1D1D';
      stage.ctx.fillRect(0, 0, stage.canvas.width, stage.canvas.height);
      stage.ctx.fillStyle = 'rgba(255, 255, 255, 0.2';
    } else {
      stage.ctx.fillStyle = '#FFFFFF';
      stage.ctx.fillRect(0, 0, stage.canvas.width, stage.canvas.height);
      stage.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    }

    restart();

    return false;
  };

})();
