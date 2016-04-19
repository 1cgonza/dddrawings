(function() {
  'use strict';
  var animReq;
  var stageReady = false;
  var notes = document.getElementById('box');
  var decription = document.getElementById('description');

  var assets = {
    data: '../../data/notations/chairy-tale.json',
    smallImg: '../../img/notations/chairy-tale-small.jpg',
    largeImg: '../../img/notations/chairy-tale-notations.jpg',
  };
  var assetsLoaded = 0;
  assets.length = Object.keys(assets).length;

  var options = {
    pageWidth: 1360,
    pageHeight: 2070,
    pageMarginTop: 112,
    pageMarginBottom: 40,
    secondsPerPage: 160,
    fps: 24,
    percent: {}
  };
  var innerPageHeight    = options.pageHeight - options.pageMarginTop - options.pageMarginBottom;
  options.percent.h      = DDD.getPercent(innerPageHeight, options.pageHeight);
  options.percent.top    = DDD.getPercent(options.pageMarginTop, options.pageHeight);
  options.percent.bottom = DDD.getPercent(options.pageMarginBottom, options.pageHeight);

  // Set globally the video player and two canvases that will communicate with each other.
  var video = notationsVideo(document.getElementById('video'), videoReady);

  var notationsData  = [];

  var timeline                    = DDD.canvas(document.getElementById('middle-col'), {position: 'relative'});
  timeline.canvas.style.opacity   = 0;
  timeline.container.style.width  = '10%';
  timeline.container.style.height = window.innerHeight + 'px';
  timeline.imgW                   = 200;
  timeline.imgH                   = 1218;

  var notations                    = DDD.canvas(document.getElementById('right-col'), {position: 'relative'});
  notations.canvas.style.opacity   = 0;
  notations.container.style.width  = '50%';
  notations.container.style.height = window.innerHeight + 'px';
  notations.imgW                   = 1000;
  notations.imgH                   = 6088;

  function videoReady() {
    // Load JSON data about notations
    DDD.json({
      url: assets.data,
      container: decription
    })
    .then(init)
    .catch(function(err) {
      console.error(err);
    });
    checkAssetsLoaded();

    video.onplay = function() {
      animReq = requestAnimationFrame(playerLoop);
      return false;
    };

    video.onpause = function() {
      window.cancelAnimationFrame(animReq);
      return false;
    };

    video.onseeking = function() {
      updateNotations();
      return false;
    };
  }

  function init(data) {
    assetsLoaded++;
    notationsData = data.sections;

    /*----------  NOTATIONS IMG  ----------*/
    notations.img        = new Image();
    notations.img.onload = assetLoadedEvent;
    notations.img.src    = assets.largeImg;

    /*----------  TIMELINE IMG  ----------*/
    timeline.img        = new Image();
    timeline.img.onload = assetLoadedEvent;
    timeline.img.src    = assets.smallImg;
  }

  function assetLoadedEvent() {
    assetsLoaded++;
  }

  function checkAssetsLoaded() {
    if (assetsLoaded < assets.length) {
      requestAnimationFrame(checkAssetsLoaded);
    } else {
      resizeElements();
      video.controls = true;
      stageReady = true;

      document.querySelector('#right-col .loading').style.opacity = 0;
      document.querySelector('#middle-col .loading').style.opacity = 0;
      timeline.canvas.style.opacity = 1;
      notations.canvas.style.opacity = 1;
    }
  }

  function playerLoop() {
    updateNotations();
    requestAnimationFrame(playerLoop);
  }

  function updateNotations() {
    for (var i = 0; i < notationsData.length; i++) {
      if (i === 0) {
        if (video.currentTime <= 38) {
          var adjustCurrentTime = video.currentTime * (30 / 38);

          timeline.headerY = (adjustCurrentTime * timeline.step) + timeline.offTop;
          notations.imgY   = (adjustCurrentTime * notations.step) + notations.offTop - notations.headerY;
        }
      } else {
        if (video.currentTime > 38) {
          var currentTime = (video.currentTime - 38) * (550 / 548.96);
          var sectionHead = notationsData[i - 1].notedEndFrame / options.fps;
          var sectionTail = notationsData[i].notedEndFrame / options.fps;

          if (currentTime >= sectionHead && currentTime <= sectionTail) {
            // Move timeline header
            timeline.headerY = (currentTime * timeline.step) + (timeline.offTop * notationsData[i].page) + (30 * timeline.step);

            // Move notations image
            notations.imgY = (currentTime * notations.step) + (notations.offTop * notationsData[i].page) +
                             (30 * notations.step) - //add the first section that has 30 seconds label but lasts 38 in the video.
                             notations.headerY;

            if (notationsData[i].page > 1) {
              timeline.headerY = timeline.headerY + (timeline.offBottom * (notationsData[i].page - 1));
              notations.imgY = notations.imgY + (notations.offBottom * (notationsData[i].page - 1));
            }

          }
        }
      }
    }

    drawTimeline();
    drawNotations();
  }

  function drawTimeline() {
    timeline.ctx.clearRect(0, 0, timeline.canvas.width, timeline.canvas.height);
    timeline.ctx.drawImage(
      timeline.img,
      timeline.imgX, 0,
      timeline.imgResizeW, timeline.canvas.height
    );

    timeline.ctx.beginPath();
    timeline.ctx.moveTo(0, timeline.headerY);
    timeline.ctx.lineTo(timeline.canvas.width, timeline.headerY);
    timeline.ctx.strokeStyle = '#fe0404';
    timeline.ctx.stroke();
  }

  /*=================================
  =            NOTATIONS            =
  =================================*/
  function drawNotations() {
    notations.ctx.clearRect(0, 0, notations.canvas.width, notations.canvas.height);
    notations.ctx.drawImage(
      notations.img,
      0, -notations.imgY,
      notations.canvas.width, notations.imgH * (notations.canvas.width / notations.imgW)
    );

    notations.ctx.beginPath();
    notations.ctx.moveTo(0, notations.headerY);
    notations.ctx.lineTo(notations.canvas.width, notations.headerY);
    notations.ctx.strokeStyle = '#fe0404';
    notations.ctx.stroke();
  }
  /*-----  End of NOTATIONS  ------*/

  function resizeElements() {
    /*----------  RESIZE TIMELINE  ----------*/
    timeline.canvas.width  = timeline.container.offsetWidth;
    timeline.canvas.height = window.innerHeight;
    timeline.imgResizeW    = timeline.canvas.width * (timeline.canvas.height / timeline.imgH);
    timeline.pageH         = timeline.canvas.height / 4;
    timeline.offTop        = DDD.sizeFromPercentage(options.percent.top, timeline.pageH);
    timeline.offBottom     = DDD.sizeFromPercentage(options.percent.bottom, timeline.pageH);
    timeline.step          = DDD.sizeFromPercentage(options.percent.h, timeline.pageH) / options.secondsPerPage;

    if (timeline.canvas.width > timeline.imgResizeW) {
      timeline.imgX = (timeline.canvas.width - timeline.imgResizeW) / 2;
    } else {
      timeline.imgX = 0;
    }

    /*----------  RESIZE NOTATIONS  ----------*/
    notations.canvas.width  = notations.container.offsetWidth;
    notations.canvas.height = window.innerHeight;
    notations.headerY       = notations.canvas.height / 2;
    notations.resizeH       = DDD.sizeFromPercentage(DDD.getPercent(notations.canvas.width, notations.imgW), notations.imgH) / 4;
    notations.offTop        = DDD.sizeFromPercentage(options.percent.top, notations.resizeH);
    notations.offBottom     = DDD.sizeFromPercentage(options.percent.bottom, notations.resizeH);
    notations.step          = DDD.sizeFromPercentage(options.percent.h, notations.resizeH) / options.secondsPerPage;

    /*----------  RESIZE VIDEO  ----------*/
    var leftW = document.getElementById('left-col').offsetWidth;
    var resizePercent = leftW / video.width * 100;
    video.width = leftW;
    video.height = DDD.sizeFromPercentage(resizePercent, video.height);

    // Render again
    updateNotations();
  }

  window.onresize = function() {
    if (stageReady) {
      resizeElements();
    }
    return false;
  };

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

})();
