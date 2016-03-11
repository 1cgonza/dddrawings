(function() {
  'use strict';

  var assetsLoaded = 0;
  var video;
  var animReq;

  var container = document.getElementById('ddd-container');
  var stage = document.createElement('div');
  stage.id = 'right-col';
  stage.style.width = '60%';
  stage.style.height = window.innerHeight + 'px';

  container.appendChild(stage);

  var notations = new Notations({
    img: {
      width: 1874,
      height: 1023,
      offTop: 214,
      offRight: 24,
      offBottom: 17,
      offLeft: 165,
      src: '/img/notations/bug-goes-to-town.jpg',
      cb: assetReady
    },
    secPerPage: 160,
    fps: 24,
    url: '/data/notations/bug-goes-to-town.json',
    cb: notationsReady,
    container: stage,
  });
  notations.canvas.style.opacity = 0;
  var loader = document.createElement('p');
  loader.className = 'loading';
  loader.innerText = 'Loading Notations...';
  stage.appendChild(loader);

  function assetReady() {
    assetsLoaded++;
  }

  function notationsReady() {
    video = new NotationsVideo(document.getElementById('video'), videoReady).video;
  }

  function videoReady() {
    updateSize();
    notationsUpdate();

    loader.style.opacity = 0;
    notations.canvas.style.opacity = 1;

    video.controls = true;

    video.onplay = function() {
      animReq = requestAnimationFrame(playerLoop);
      return false;
    };

    video.onseeking = notationsUpdate;

    video.onpause = function() {
      window.cancelAnimationFrame(animReq);
      return false;
    };
  }

  function playerLoop() {
    notationsUpdate();
    animReq = requestAnimationFrame(playerLoop);
  }

  function notationsUpdate() {
    notations.ctx.clearRect(0, 0, notations.canvas.width, notations.canvas.height);

    var x = (video.currentTime * notations.step) + notations.offX;

    notations.ctx.drawImage(
      notations.img,
      0, 0,
      notations.imgW, notations.imgH,
      0, (notations.canvas.height / 2) - (notations.resizeH / 2),
      notations.canvas.width, notations.resizeH
    );
    notations.ctx.beginPath();
    notations.ctx.moveTo(x, 0);
    notations.ctx.lineTo(x, notations.imgH);
    notations.ctx.strokeStyle = '#fe0404';
    notations.ctx.stroke();
  }

  function updateSize() {
    notations.canvas.width = notations.container.offsetWidth;
    notations.canvas.height = window.innerHeight;
    notations.resizeH = DDD.sizeFromPercentage(DDD.getPercent(notations.canvas.width, notations.imgW), notations.imgH);
    var area = DDD.sizeFromPercentage(notations.percent.w, notations.canvas.width);
    notations.step = area / video.duration;
    notations.offX = DDD.sizeFromPercentage(notations.percent.left, notations.canvas.width);
    notationsUpdate();

    return false;
  }

  window.onresize = updateSize;

})();
