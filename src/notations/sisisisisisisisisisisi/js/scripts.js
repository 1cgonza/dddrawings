var v;
(function () {
  'use strict';

  /*===============================
  =            GLOBALS            =
  ===============================*/
  var notationsWrapper = document.getElementById('right-col');
  var loadingN         = document.querySelector('#right-col .loading');
  var timelineImg, r, h, r2, h2;
  var timelineH = window.innerHeight;
  /*=====  End of GLOBALS  ======*/

  var notationsData = {
    img: {
      width: 1418,
      height: 1144,
      offTop: 214,
      offRight: 24,
      offBottom: 17,
      offLeft: 165,
      src: '/img/notations/sisisi-notations.jpg'
    },
    secPerPage: 160,
    fps: 24,
    url: '/data/notations/sisisisisisisisisisisi.json',
    cb: notationsReady,
    container: notationsWrapper,
    loadingEle: loadingN
  };

  var notations = new Notations(notationsData);

  var ref = createCanvas(notationsWrapper, {
    w: notations.width,
    h: notations.height
  });

  function notationsReady (d) {
    notations.d = d.sections;
    v = new NotationsVideo( document.getElementById('video'), videoReady );
    resetHeightInData();

    /*----------  DEBUG  ----------*/
    // for (var i = 0; i < d.sections.length; i++) {
    //   if ( d.sections[i].hasOwnProperty('r') &&  d.sections[i].hasOwnProperty('r2') ) {
    //     var r1 = d.sections[i].r;
    //     var r2 = d.sections[i].r2;
    //     var h1 = d.sections[i].h;
    //     var h2 = d.sections[i].h2;

    //     ref.ctx.save();
    //       ref.ctx.translate(ref.canvas.width / 2, ref.canvas.height / 2);

    //       ref.ctx.beginPath();
    //       ref.ctx.moveTo(0, 0);
    //       ref.ctx.rotate(r1 * Math.PI / 180);
    //       ref.ctx.lineTo(0, -h1);
    //       ref.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    //       ref.ctx.stroke();

    //       ref.ctx.beginPath();
    //       ref.ctx.translate(0, -h1);
    //       ref.ctx.moveTo(0, 0);
    //       ref.ctx.rotate(r2 * Math.PI / 180);
    //       ref.ctx.lineTo(0, -h2);
    //       ref.ctx.strokeStyle = 'rgba(255,0,0,0.3)';
    //       ref.ctx.stroke();

    //     ref.ctx.restore();
    //   }
    // }

  }

  function videoReady () {
    notationsUpdate();
    v.controls = true;
    v.addEventListener('play', playerLoop, false);
    v.addEventListener('seeking', playerLoop, false);
    notations.loading.style.opacity = 0;
  }

  function playerLoop (event) {
    if (!v.paused || v.seeking) {
      notationsUpdate();
      requestAnimationFrame(playerLoop);
    }
  }

  function notationsUpdate() {
    var current, next;

    for (var i = 0; i < notations.d.length - 1; i++) {
      if ( v.currentTime >= notations.d[i].start && v.currentTime < notations.d[i + 1].start ) {
        current = notations.d[i];
        next = notations.d[i + 1];
        break;
      }
    }

    var sectionLength = next.start - current.start;
    var lengthOffset = v.currentTime - current.start;

    var rStep = (next.r - current.r) / sectionLength;
    var r2Step = (next.r2 - current.r2) / sectionLength;
    var hStep = (next.h - current.h) / sectionLength;
    var h2Step = (next.h2 - current.h2) / sectionLength;

    notations.ctx.clearRect(0, 0, notations.width, notations.canvas.height);

    r  = ( lengthOffset * rStep ) + current.r;
    r2 = ( lengthOffset * r2Step ) + current.r2;
    h  = ( lengthOffset * hStep ) + current.h;
    h2 = ( lengthOffset * h2Step ) + current.h2;
    timelineDraw();
  }

  function timelineDraw() {
    notations.ctx.drawImage(
      notations.img,
      0, 0,
      notations.imgW, notations.imgH,
      0, 0,
      notations.width, notations.height
    );

    notations.ctx.save();
      notations.ctx.translate(notations.width / 2, notations.height / 2);
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
      notations.d[i].h  = newSizefromPercentage( notations.d[i].hPercent, notations.width );
      notations.d[i].h2 = newSizefromPercentage( notations.d[i].h2Percent, notations.width );
    }
  }

  function resizeElements () {
    notations.update();

    resetHeightInData();
    notationsUpdate();
  }

  window.onresize = resizeElements;

})();