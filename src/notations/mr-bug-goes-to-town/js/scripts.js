(function () {
  'use strict';

  /*===============================
  =            GLOBALS            =
  ===============================*/
  var timelineWrapper  = document.getElementById('middle-col');
  var notationsWrapper = document.getElementById('right-col');
  var loadingTL        = document.querySelector('#middle-col .loading');
  var loadingN         = document.querySelector('#right-col .loading');
  var timelineImg, v;
  var timelineHeaderX;
  var timelineH = window.innerHeight;
  /*=====  End of GLOBALS  ======*/

  var timelineData = {
    img: {
      width: 1874,
      height: 1023,
      offTop: 214,
      offRight: 24,
      offBottom: 17,
      offLeft: 165,
      src: '/img/notations/bug-goes-to-town.jpg'
    },
    secPerPage: 160,
    fps: 24,
    url: '/data/notations/bug-goes-to-town.json',
    cb: timelineReady,
    container: timelineWrapper,
    loadingEle: loadingTL
  };

  var timeline = new Notations(timelineData);

  function timelineReady () {
    v = new NotationsVideo( document.getElementById('video'), videoReady );
  }

  function videoReady () {
    timelineUpdate();

    v.controls = true;
    v.addEventListener('play', playerLoop, false);
    v.addEventListener('seeking', playerLoop, false);
    timeline.loading.style.opacity = 0;
  }

  function playerLoop (event) {
    if (!v.paused || v.seeking) {
      timelineUpdate();
      requestAnimationFrame(playerLoop);
    }
  }

  function timelineUpdate() {
    var offLeft = newSizefromPercentage(timeline.offsetLeftPercent, timeline.width);
    var area = newSizefromPercentage(timeline.innerPageWidthPercent, timeline.container.offsetWidth);
    var timeStep = area / v.duration;
    timeline.ctx.clearRect(0, 0, timeline.width, timeline.canvas.height);

    timelineHeaderX = (v.currentTime * timeStep) + offLeft;
    timelineDraw();
  }

  function timelineDraw() {
    timeline.ctx.drawImage(
      timeline.img,
      0, 0,
      timeline.imgW, timeline.imgH,
      0, (timeline.canvas.height / 2) - (timeline.height / 2),
      timeline.width, timeline.height
    );
    timeline.ctx.beginPath();
    timeline.ctx.moveTo(timelineHeaderX, 0);
    timeline.ctx.lineTo(timelineHeaderX, timeline.imgH);
    timeline.ctx.strokeStyle = '#fe0404';
    timeline.ctx.stroke();
  }

  function resizeElements () {
    timeline.update();
    timeline.canvas.width = timeline.width;
    timeline.canvas.height = window.innerHeight;
    timelineUpdate();
  }

  window.onresize = resizeElements;

})();