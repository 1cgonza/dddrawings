import { notationsVideo } from '../../utils/Notations';

let animReq;
let stageReady = false;
let notes = document.getElementById('box');
var decription = document.getElementById('description');
var left = document.getElementById('left-col');
var middle = document.getElementById('middle-col');
var right = document.getElementById('right-col');
var loadingR = right.querySelector('.loading');
var loadingM = middle.querySelector('.loading');

var assets = {
  video: document.getElementById('video'),
  data: '/data/notations/chairy-tale.json',
  smallImg: '/img/assets/notations/chairy-tale-small.jpg',
  largeImg: '/img/assets/notations/chairy-tale-notations.jpg'
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
var innerPageHeight = options.pageHeight - options.pageMarginTop - options.pageMarginBottom;
options.percent.h = DDD.getPercent(innerPageHeight, options.pageHeight);
options.percent.top = DDD.getPercent(options.pageMarginTop, options.pageHeight);
options.percent.bottom = DDD.getPercent(options.pageMarginBottom, options.pageHeight);

// Set globally the video player and two canvases that will communicate with each other.
var video = notationsVideo(assets.video, videoReady);

var notationsData = [];

var timeline = DDD.canvas(middle, { css: { position: 'relative', opacity: 0 } });
middle.style.width = '10%';

var notations = DDD.canvas(right, { css: { position: 'relative', opacity: 0 } });
right.style.width = '50%';
notations.imgW = 1000;
notations.imgH = 6088;

var resize = {
  stage: function() {
    this.height = window.innerHeight;
  },
  timeline: function() {
    var h = this.height;
    var ih = 1218;
    timeline.canvas.width = middle.offsetWidth;
    timeline.canvas.height = h;
    timeline.imgResizeW = timeline.canvas.width * (h / ih);
    timeline.pageH = h / 4;
    timeline.offTop = DDD.sizeFromPercentage(options.percent.top, timeline.pageH);
    timeline.offBottom = DDD.sizeFromPercentage(options.percent.bottom, timeline.pageH);
    timeline.step = DDD.sizeFromPercentage(options.percent.h, timeline.pageH) / options.secondsPerPage;
    middle.style.height = h + 'px';

    if (timeline.canvas.width > timeline.imgResizeW) {
      timeline.imgX = (timeline.canvas.width - timeline.imgResizeW) / 2;
    } else {
      timeline.imgX = 0;
    }
  },
  notations: function() {
    var w = right.offsetWidth;
    var h = window.innerHeight;
    var h2 = DDD.sizeFromPercentage(DDD.getPercent(w, notations.imgW), notations.imgH) / 4;
    notations.canvas.width = w;
    notations.canvas.height = h;
    notations.headerY = h / 2;
    notations.offTop = DDD.sizeFromPercentage(options.percent.top, h2);
    notations.offBottom = DDD.sizeFromPercentage(options.percent.bottom, h2);
    notations.step = DDD.sizeFromPercentage(options.percent.h, h2) / options.secondsPerPage;
  },
  video: function() {
    var leftW = left.offsetWidth;
    var resizePercent = (leftW / video.width) * 100;
    video.width = leftW;
    video.height = DDD.sizeFromPercentage(resizePercent, video.height);
  },
  all: function() {
    this.timeline();
    this.notations();
    this.video();
    updateNotations();
  }
};

resize.stage();
loadingR.style.opacity = 1;
loadingM.style.opacity = 1;

function videoReady() {
  resize.video();
  // Load JSON data about notations
  DDD.json({
    url: assets.data,
    container: decription
  })
    .then(function(data) {
      notationsData = data.sections;

      /*----------  NOTATIONS IMG  ----------*/
      notations.img = new Image();
      notations.img.onload = function() {
        resize.notations();
        notations.imgY = notations.offTop - notations.headerY;
        loadingR.style.opacity = 0;
        notations.canvas.style.opacity = 1;
        checkAssetsLoaded();
        drawNotations();
      };
      notations.img.src = assets.largeImg;

      /*----------  TIMELINE IMG  ----------*/
      timeline.img = new Image();
      timeline.img.onload = function() {
        resize.timeline();
        timeline.headerY = timeline.offTop;
        loadingM.style.opacity = 0;
        timeline.canvas.style.opacity = 1;
        checkAssetsLoaded();
        drawTimeline();
      };
      timeline.img.src = assets.smallImg;

      checkAssetsLoaded();
    })
    .catch(function(err) {
      console.error(err);
    });

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

  checkAssetsLoaded();
}

function checkAssetsLoaded() {
  assetsLoaded++;

  if (assetsLoaded === assets.length) {
    video.controls = true;
    stageReady = true;
  }
}

function playerLoop() {
  updateNotations();
  requestAnimationFrame(playerLoop);
}

function updateNotations() {
  var time = video.currentTime;

  if (time <= 38) {
    var adjustCurrentTime = time * (30 / 38);

    timeline.headerY = adjustCurrentTime * timeline.step + timeline.offTop;
    notations.imgY = adjustCurrentTime * notations.step + notations.offTop - notations.headerY;
  } else {
    var i;
    var current;
    var currentTime = (time - 38) * (550 / 548.96);

    for (i = 1; i < notationsData.length; i++) {
      var head = notationsData[i - 1].notedEndFrame / options.fps;
      var tail = notationsData[i].notedEndFrame / options.fps;

      if (currentTime >= head && currentTime <= tail) {
        current = notationsData[i].page;
        break;
      }
    }

    // Move timeline header
    timeline.headerY = currentTime * timeline.step + timeline.offTop * current + 30 * timeline.step;

    // Move notations image
    notations.imgY =
      currentTime * notations.step +
      notations.offTop * current +
      30 * notations.step - //add the first section that has 30 seconds label but lasts 38 in the video.
      notations.headerY;

    if (current > 1) {
      timeline.headerY = timeline.headerY + timeline.offBottom * (current - 1);
      notations.imgY = notations.imgY + notations.offBottom * (current - 1);
    }
  }

  drawTimeline();
  drawNotations();
}

function drawTimeline() {
  timeline.ctx.clearRect(0, 0, timeline.canvas.width, timeline.canvas.height);
  timeline.ctx.drawImage(timeline.img, timeline.imgX, 0, timeline.imgResizeW, timeline.canvas.height);

  timeline.ctx.beginPath();
  timeline.ctx.moveTo(0, timeline.headerY);
  timeline.ctx.lineTo(timeline.canvas.width, timeline.headerY);
  timeline.ctx.strokeStyle = '#fe0404';
  timeline.ctx.stroke();
}

function drawNotations() {
  notations.ctx.clearRect(0, 0, notations.canvas.width, notations.canvas.height);
  notations.ctx.drawImage(
    notations.img,
    0,
    0,
    notations.imgW,
    notations.imgH,
    0,
    -notations.imgY,
    notations.canvas.width,
    notations.imgH * (notations.canvas.width / notations.imgW)
  );

  notations.ctx.beginPath();
  notations.ctx.moveTo(0, notations.headerY);
  notations.ctx.lineTo(notations.canvas.width, notations.headerY);
  notations.ctx.strokeStyle = '#fe0404';
  notations.ctx.stroke();
}

window.onresize = function() {
  if (stageReady) {
    resize.all();
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
