(function() {
  'use strict';

  var animReq;
  var assetsLoaded = 0;
  var container = document.getElementById('ddd-container');
  var stage = document.createElement('div');
  stage.id = 'right-col';
  stage.style.width = '60%';
  stage.style.height = window.innerHeight + 'px';

  container.appendChild(stage);

  var notes = document.getElementById('box');
  var video;
  var r  = 0;
  var r2 = 0;
  var h  = 0;
  var h2 = 0;

  var notations = new Notations({
    img: {
      width: 1418,
      height: 1144,
      offTop: 214,
      offRight: 24,
      offBottom: 17,
      offLeft: 165,
      src: '/img/notations/sisisi-notations.jpg',
      cb: assetReady,
      msg: 'Loading Notations'
    },
    secPerPage: 160,
    fps: 24,
    url: '/data/notations/sisisisisisisisisisisi.json',
    cb: notationsReady,
    container: stage
  });
  notations.canvas.style.opacity = 0;

  var debug = false;

  function assetReady() {
    assetsLoaded++;
  }

  function notationsReady(d) {
    notations.d = d.sections;
    video = new NotationsVideo(document.getElementById('video'), videoReady).video;
    resetHeightInData();

    /*----------  DEBUG  ----------*/
    if (debug) {
      debugReferencePoint();
    }
  }

  function videoReady() {
    updateSize();
    notationsUpdate();

    notations.canvas.style.opacity = 1;
    video.controls = true;

    video.onplay = function() {
      animReq = requestAnimationFrame(playerLoop);
      return false;
    };

    video.onpause = function() {
      window.cancelAnimationFrame(playerLoop);
      return false;
    };

    video.onseeking = notationsUpdate;
  }

  function playerLoop() {
    notationsUpdate();
    animReq = requestAnimationFrame(playerLoop);
  }

  function notationsUpdate() {
    var current;
    var next;

    for (var i = 0; i < notations.d.length - 1; i++) {
      if (video.currentTime >= notations.d[i].start && video.currentTime < notations.d[i + 1].start) {
        current = notations.d[i];
        next = notations.d[i + 1];
        break;
      }
    }

    var sectionLength = next.start - current.start;
    var lengthOffset  = video.currentTime - current.start;

    var rStep  = (next.r - current.r) / sectionLength;
    var r2Step = (next.r2 - current.r2) / sectionLength;
    var hStep  = (next.h - current.h) / sectionLength;
    var h2Step = (next.h2 - current.h2) / sectionLength;

    notations.ctx.clearRect(0, 0, notations.canvas.width, notations.canvas.height);

    r  = (lengthOffset * rStep) + current.r;
    r2 = (lengthOffset * r2Step) + current.r2;
    h  = (lengthOffset * hStep) + current.h;
    h2 = (lengthOffset * h2Step) + current.h2;
    timelineDraw();
  }

  function timelineDraw() {
    notations.ctx.drawImage(
      notations.img,
      0, 0,
      notations.imgW, notations.imgH,
      0, (notations.canvas.height / 2) - (notations.resizeH / 2),
      notations.canvas.width, notations.resizeH
    );

    notations.ctx.save();
    notations.ctx.translate(notations.canvas.width / 2, notations.canvas.height / 2);
    notations.ctx.rotate(r * Math.PI / 180);

    notations.ctx.beginPath();
    notations.ctx.strokeStyle = 'black';

    notations.ctx.moveTo(0, 0);
    notations.ctx.lineTo(0, -h);
    notations.ctx.stroke();

    notations.ctx.beginPath();
    notations.ctx.strokeStyle = 'red';
    notations.ctx.translate(0, -h);
    notations.ctx.moveTo(0, 0);
    notations.ctx.rotate(r2 * Math.PI / 180);
    notations.ctx.lineTo(0, -h2);
    notations.ctx.stroke();
    notations.ctx.restore();
  }

  function resetHeightInData() {
    for (var i = 0; i < notations.d.length; i++) {
      notations.d[i].h  = DDD.sizeFromPercentage(notations.d[i].hPercent, notations.canvas.width);
      notations.d[i].h2 = DDD.sizeFromPercentage(notations.d[i].h2Percent, notations.canvas.width);
    }
  }

  function updateSize() {
    notations.canvas.width  = stage.offsetWidth;
    notations.canvas.height = window.innerHeight;
    notations.resizeH = DDD.sizeFromPercentage(DDD.getPercent(notations.canvas.width, notations.imgW), notations.imgH);
    resetHeightInData();
    notationsUpdate();
  }

  window.onresize = updateSize;

  document.getElementById('notes').onclick = function(event) {
    event.preventDefault();
    notes.style.display = 'block';

    return false;
  };

  document.getElementById('close-box').onclick = function(event) {
    event.preventDefault();
    notes.style.display = 'none';

    return false;
  };

  function debugReferencePoint() {
    var ref = DDD.canvas(stage, {w: notations.canvas.width, h: notations.canvas.height});

    for (var i = 0; i < d.sections.length; i++) {
      if (d.sections[i].hasOwnProperty('r') &&  d.sections[i].hasOwnProperty('r2')) {
        var r1 = d.sections[i].r;
        var r2 = d.sections[i].r2;
        var h1 = d.sections[i].h;
        var h2 = d.sections[i].h2;

        ref.ctx.save();
        ref.ctx.translate(ref.canvas.width / 2, ref.canvas.height / 2);

        ref.ctx.beginPath();
        ref.ctx.moveTo(0, 0);
        ref.ctx.rotate(r1 * Math.PI / 180);
        ref.ctx.lineTo(0, -h1);
        ref.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ref.ctx.stroke();

        ref.ctx.beginPath();
        ref.ctx.translate(0, -h1);
        ref.ctx.moveTo(0, 0);
        ref.ctx.rotate(r2 * Math.PI / 180);
        ref.ctx.lineTo(0, -h2);
        ref.ctx.strokeStyle = 'rgba(255,0,0,0.3)';
        ref.ctx.stroke();

        ref.ctx.restore();
      }
    }
  }

})();
