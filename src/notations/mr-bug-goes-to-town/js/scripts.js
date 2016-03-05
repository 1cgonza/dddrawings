(function() {
  'use strict';

  var video;
  var animReq;
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
    updateSize();
    timelineUpdate();

    timeline.loading.style.opacity = 0;

    video.controls = true;

    video.onplay = function() {
      animReq = requestAnimationFrame(playerLoop);
      return false;
    };

    video.onseeking = timelineUpdate;

    video.onpause = function() {
      window.cancelAnimationFrame(animReq);
      return false;
    };
  }

  function playerLoop() {
    timelineUpdate();
    animReq = requestAnimationFrame(playerLoop);
  }

  function timelineUpdate() {
    timeline.ctx.clearRect(0, 0, timeline.canvas.width, timeline.canvas.height);

    var x = (video.currentTime * timeline.step) + timeline.offX;

    timeline.ctx.drawImage(
      timeline.img,
      0, 0,
      timeline.imgW, timeline.imgH,
      0, (timeline.canvas.height / 2) - (timeline.resizeH / 2),
      timeline.canvas.width, timeline.resizeH
    );
    timeline.ctx.beginPath();
    timeline.ctx.moveTo(x, 0);
    timeline.ctx.lineTo(x, timeline.imgH);
    timeline.ctx.strokeStyle = '#fe0404';
    timeline.ctx.stroke();
  }

  function updateSize() {
    timeline.canvas.width = timeline.container.offsetWidth;
    timeline.canvas.height = window.innerHeight;
    timeline.resizeH = DDD.sizeFromPercentage(DDD.getPercent(timeline.canvas.width, timeline.imgW), timeline.imgH);
    var area = DDD.sizeFromPercentage(timeline.innerPageWidthPercent, timeline.canvas.width);
    timeline.step = area / video.duration;
    timeline.offX = DDD.sizeFromPercentage(timeline.offsetLeftPercent, timeline.canvas.width);
    timelineUpdate();

    return false;
  }

  window.onresize = updateSize;

})();
