(function() {
  'use strict';

  var video;
  var timeline = new Notations({
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
    container: document.getElementById('middle-col'),
    loadingEle: document.querySelector('#middle-col .loading')
  });

  function timelineReady() {
    video = new NotationsVideo(document.getElementById('video'), videoReady).video;
  }

  function videoReady() {
    timelineUpdate();

    video.controls = true;
    video.addEventListener('play', playerLoop, false);
    video.addEventListener('seeking', playerLoop, false);
    timeline.loading.style.opacity = 0;
  }

  function playerLoop(event) {
    if (!video.paused || video.seeking) {
      timelineUpdate();
      requestAnimationFrame(playerLoop);
    }
  }

  function timelineUpdate() {
    var offLeft  = DDD.sizeFromPercentage(timeline.offsetLeftPercent, timeline.width);
    var area     = DDD.sizeFromPercentage(timeline.innerPageWidthPercent, timeline.container.offsetWidth);
    var timeStep = area / video.duration;
    timeline.ctx.clearRect(0, 0, timeline.width, timeline.canvas.height);

    var timelineHeaderX = (video.currentTime * timeStep) + offLeft;

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

  window.onresize = function() {
    timeline.update();
    timeline.canvas.width = timeline.width;
    timeline.canvas.height = window.innerHeight;
    timelineUpdate();
    return false;
  };

})();
