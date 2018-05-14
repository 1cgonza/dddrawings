import { Notations, notationsVideo } from '../../utils/Notations';

/*----------  Elements  ----------*/
var bottom    = document.getElementById('bottom');
var left      = document.getElementById('left');
var labelBox  = document.getElementById('label-box');
var polish    = document.getElementById('pol');
var eng       = document.getElementById('eng');

var video = notationsVideo(document.getElementById('video'), videoReady);

var loadingMsg = 'Please be patient, loading large images';
var msg = document.createElement('p');
msg.className = 'loading-msg';
msg.innerText = loadingMsg;

var loading = document.createElement('div');
loading.className = 'loading';
loading.style.opacity = 0;

var progress  = document.createElement('progress');
progress.className = 'progress';
progress.style.zIndex = 0;
progress.max = 100;
progress.value = 0;

loading.appendChild(progress);
loading.appendChild(msg);
left.appendChild(loading);

var animReq;
var timeline;
var timelineBg;
var notations;
var data = {};
var loaded = false;

var assets = {
  small: '/img/assets/notations/tango-small.jpg',
  large: '/img/assets/notations/tango.jpg'
};
var assetsLoaded = 0;

var sectionsLen = 0;
var bleedBottom = 30;
var dragging    = false;
var prevX       = 0;
var tX          = 0;
var nX          = 0;

var images = {
  total: 16,
  loaded: 0,
  totalW: 15458,
  width: 1000,
  height: 785,
  frames: {}
};

var resize = {
  reset: function() {
    this.bottomW          = window.innerWidth;
    this.topH             = document.getElementById('header').offsetHeight;
    this.timelinePercent  = DDD.getPercent(this.bottomW, images.totalW);
    this.bottomH          = DDD.sizeFromPercentage(this.timelinePercent, images.height) + bleedBottom | 0;
    this.leftH            = window.innerHeight - this.topH - this.bottomH;
    this.notationsPercent = DDD.getPercent(this.leftH, images.height);
  },

  resizeTimeline: function(noReset) {
    if (!noReset) {
      this.reset();
    }
    this.timelineH = DDD.sizeFromPercentage(this.timelinePercent, images.height) | 0;
    timeline.canvas.width  = timelineBg.canvas.width = this.bottomW;
    timeline.canvas.height = timelineBg.canvas.height = this.bottomH;
    bottom.style.height    = this.bottomH + 'px';

    if (this.bottomH > this.timelineH) {
      timeline.offY = (this.bottomH / 2) - (this.timelineH / 2);
    } else {
      timeline.offY = 0;
    }

    timeline.offX = DDD.sizeFromPercentage(this.timelinePercent, data.initX) | 0;
    timeline.ctx.strokeStyle = 'red';

    images.timelineW = DDD.sizeFromPercentage(this.timelinePercent, 1000);
  },

  resizeNotations: function(noReset) {
    if (!noReset) {
      this.reset();
    }
    this.leftW        = left.offsetWidth;
    left.style.top    = this.topH + 'px';
    left.style.height = this.leftH + 'px';

    notations.resizeW       = DDD.sizeFromPercentage(this.notationsPercent, images.totalW);
    notations.canvas.height = this.leftH;
    notations.canvas.width  = this.leftW;

    notations.offX = DDD.sizeFromPercentage(this.notationsPercent, data.initX) | 0;
    notations.ctx.strokeStyle = 'red';

    labelBox.style.left = notations.offX + 'px';

    images.notationsW = DDD.sizeFromPercentage(this.notationsPercent, 1000);
  },

  videoData: function(noReset) {
    if (!noReset) {
      this.reset();
    }
    var videoH = window.innerHeight - this.bottomH;
    var x = data.endX - data.initX;
    video.style.maxHeight = videoH + 'px';
    video.style.marginTop = (videoH / 2) - (video.offsetHeight / 2) + 'px';

    this.videoTimelineW = video.duration / DDD.sizeFromPercentage(this.timelinePercent, x);
    this.videoNotationsW = video.duration / DDD.sizeFromPercentage(this.notationsPercent, x);
  },

  resizeData: function() {
    var sectionsLength = data.sections.length;
    var labelsLength = data.labels.length;
    var bg = 'e03f40';

    for (var i = 0; i < sectionsLength; i++) {
      var x = data.sections[i].x;
      var w = i === data.sections.length - 1 ? data.endX - x : data.sections[i + 1].x - x;

      data.sections[i].nX = DDD.sizeFromPercentage(this.notationsPercent, x) | 0;
      data.sections[i].nW = DDD.sizeFromPercentage(this.notationsPercent, w) | 0;

      data.sections[i].tX = DDD.sizeFromPercentage(this.timelinePercent, x) | 0;
      data.sections[i].tW = DDD.sizeFromPercentage(this.timelinePercent, w) | 0;
    }

    for (var j = 0; j < labelsLength; j++) {
      var x = data.labels[j].x;
      var y = data.labels[j].y;
      var w = data.labels[j].w;
      var h = data.labels[j].h;

      data.labels[j].nX = DDD.sizeFromPercentage(this.notationsPercent, x) | 0;
      data.labels[j].nY = this.topH + DDD.sizeFromPercentage(this.notationsPercent, y) | 0;
      data.labels[j].nW = DDD.sizeFromPercentage(this.notationsPercent, w) | 0;
      data.labels[j].nH = DDD.sizeFromPercentage(this.notationsPercent, h) | 0;
    }
  },

  updateRepaint: function() {
    this.reset();
    this.resizeTimeline(true);
    this.resizeNotations(true);
    this.videoData(true);
    this.resizeData();
    repaintTimeline();
    updateNotations();
  },

  all: function() {
    this.reset();
    this.resizeTimeline(true);
    this.resizeNotations(true);
    this.videoData(true);
    this.resizeData();
  }
};

function init() {
  var videoC   = document.getElementById('video-container');
  var loading2 = document.createElement('div');

  loading2.className = 'loading';
  videoC.appendChild(loading2);

  DDD.json({
    url: '/data/notations/tango.json',
    container: document.getElementById('ddd-container'),
    loadingEle: loading2,
    loadingMsg: 'Loading metadata'
  })
  .then(function(d) {
    videoC.removeChild(loading2);
    data = d;
    sectionsLen = d.sections.length;
    assetsLoaded++;

    timeline = new Notations({container: bottom});
    notations = new Notations({container: left});
    timelineBg = DDD.canvas(bottom, {h: timeline.canvas.height, zi: 1});
    resize.all();

    timelineBg.ctx.fillRect(0, 0, resize.bottomW, resize.bottomH);
    loading.style.opacity = 1;
    loadImages();
  })
  .catch(function(err) {
    console.error(err);
  });
}

function loadImages() {
  var i = 0;

  while (i < images.total) {
    var img = new Image();
    img.dataset.key = i;
    img.onload = function() {
      var key = this.dataset.key;
      var w = images.timelineW;
      images.loaded++;

      var value = images.loaded / images.total * 100;
      progress.value = value;
      msg.innerText = Math.floor(value) + '%' + '\n' + loadingMsg;

      paintTimelineFrame(images.frames[key], key * w, timeline.offY, w);

      checkAssetsLoaded();
    };
    img.src = '/img/assets/notations/tango/tango' + i + '.jpg';
    images.frames[i] = img;
    i++;
  }
}

function checkAssetsLoaded() {
  assetsLoaded++;

  if (assetsLoaded === 18) {
    loaded = true;
    left.removeChild(loading);
    updateNotations();
    video.controls = true;
    start();
  }
}

function start() {
  function stopDrag() {
    dragging = false;
    return false;
  }

  // videoControl();
  left.onmousedown = function(event) {
    if (loaded) {
      prevX = event.clientX;
      dragging = true;
    }

    return false;
  };

  left.onmouseup = stopDrag;
  bottom.onmouseup = stopDrag;

  left.onmousemove = function(event) {
    if (dragging) {
      var distance = prevX - event.clientX;
      video.currentTime += resize.videoNotationsW * distance;
      prevX = event.clientX;
    } else {
      var x = event.clientX;
      var y = event.clientY;
      var labelsLength = data.labels.length;
      var onLabel = false;

      for (var i = 0; i < labelsLength; i++) {
        var x1 = data.labels[i].nX - nX;
        var x2 = x1 + data.labels[i].nW;
        var y1 = data.labels[i].nY;
        var y2 = y1 + data.labels[i].nH;

        if (x >= x1 && x < x2 && y >= y1 && y < y2) {
          labelBox.className = data.labels[i].class;
          labelBox.style.top = (y1 - resize.topH - 16) + 'px';
          polish.innerText = data.labels[i].label;
          eng.innerText = data.labels[i].eng;
          onLabel = true;
          labelBox.style.opacity = 1;
          break;
        }
      }

      if (!onLabel) {
        labelBox.style.opacity = 0;
      }
    }

    return false;
  };

  left.onmouseleave = function() {
    dragging = false;
  };

  bottom.onmousedown = function(event) {
    if (loaded) {
      var distance = event.clientX - tX;
      video.currentTime += resize.videoTimelineW * distance;
      dragging = true;
    }

    return false;
  };

  bottom.onmousemove = function(event) {
    if (dragging) {
      var distance = event.clientX - tX;
      video.currentTime += resize.videoTimelineW * distance;
    }
    return false;
  };
}

function videoReady() {
  checkAssetsLoaded();
  init();

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

function playerLoop() {
  updateNotations();
  animReq = requestAnimationFrame(playerLoop);
}

function assetReady() {
  assetsLoaded++;
}

function updateNotations() {
  var currentTime = video.currentTime;
  var current;
  var next;

  for (var i = 0; i < sectionsLen; i++) {
    if (i < sectionsLen - 1) {
      if (currentTime >= data.sections[i].start && currentTime < data.sections[i + 1].start) {
        current = data.sections[i];
        next = data.sections[i + 1];
        break;
      } else {
        continue;
      }
    } else {
      current = data.sections[i];
      next = {
        start: video.duration,
        x: data.endX
      };
    }
  }

  var sectionLength = next.start - current.start;
  var timeOffset    = currentTime - current.start;
  var stepN         = timeOffset * (current.nW / sectionLength);
  var stepT         = timeOffset * (current.tW / sectionLength);
  tX                = stepT + (current.tX);
  nX                = stepN + (current.nX - notations.offX);

  timeline.ctx.clearRect(0, 0, resize.bottomW, resize.bottomH);
  timeline.ctx.beginPath();
  timeline.ctx.moveTo(tX, 0);
  timeline.ctx.lineTo(tX, resize.bottomH);
  timeline.ctx.stroke();

  repaintNotations(nX);

  notations.ctx.beginPath();
  notations.ctx.moveTo(notations.offX, 0);
  notations.ctx.lineTo(notations.offX, resize.leftH);
  notations.ctx.stroke();
}

function repaintNotations(x) {
  notations.ctx.clearRect(0, 0, resize.leftW, resize.leftH);
  var w = images.notationsW;
  var len = images.total;
  var i;

  for (i = 0; i < len; i++) {
    var fx = i * w;
    var x1 = fx - x;
    var x2 = x1 + w;

    if (x2 <= 0) {
      continue;
    } else if (x1 > resize.leftW) {
      break;
    }

    paintNotationsFrame(images.frames[i], x1, w);
  }
}

function paintNotationsFrame(img, x, w) {
  notations.ctx.drawImage(
    img,
    0, 0,
    images.width, images.height,
    x, 0,
    w, resize.leftH
  );
}

function repaintTimeline() {
  timelineBg.ctx.fillRect(0, 0, resize.bottomW, resize.bottomH);
  var i = 0;
  var w = images.timelineW;

  while (i < images.total) {
    paintTimelineFrame(images.frames[i], i * w, timeline.offY, w);
    i++;
  }
}

function paintTimelineFrame(img, x, y, w) {
  timelineBg.ctx.drawImage(
    img,
    0, 0,
    images.width, images.height,
    x | 0, y | 0,
    w, resize.timelineH
  );
}

window.onresize = resize.updateRepaint.bind(resize);

// function videoControl() {
//   var container = document.getElementById('video-container');
//   var back = document.createElement('button');
//   var forward = document.createElement('button');

//   var back2 = document.createElement('button');
//   var forward2 = document.createElement('button');

//   var back3 = document.createElement('button');
//   var forward3 = document.createElement('button');

//   var back4 = document.createElement('button');
//   var forward4 = document.createElement('button');

//   back.innerHTML = '&larr;';
//   forward.innerHTML = '&rarr;';

//   back2.innerHTML = '&larr;';
//   forward2.innerHTML = '&rarr;';

//   back3.innerHTML = '&larr;';
//   forward3.innerHTML = '&rarr;';

//   back4.innerHTML = '&larr;';
//   forward4.innerHTML = '&rarr;';

//   back.onclick = function() {
//     video.currentTime -= 0.0001;
//     console.log(video.currentTime);
//     return false;
//   };

//   forward.onclick = function() {
//     video.currentTime += 0.0001;
//     console.log(video.currentTime);
//     return false;
//   };

//   back2.onclick = function() {
//     video.currentTime -= 0.001;
//     console.log(video.currentTime);
//     return false;
//   };

//   forward2.onclick = function() {
//     video.currentTime += 0.001;
//     console.log(video.currentTime);
//     return false;
//   };

//   back3.onclick = function() {
//     video.currentTime -= 0.01;
//     console.log(video.currentTime);
//     return false;
//   };

//   forward3.onclick = function() {
//     video.currentTime += 0.01;
//     console.log(video.currentTime);
//     return false;
//   };

//   back4.onclick = function() {
//     video.currentTime -= 0.1;
//     console.log(video.currentTime);
//     return false;
//   };

//   forward4.onclick = function() {
//     video.currentTime += 0.1;
//     console.log(video.currentTime);
//     return false;
//   };

//   container.appendChild(back);
//   container.appendChild(forward);
//   container.appendChild(document.createElement('div'));

//   container.appendChild(back2);
//   container.appendChild(forward2);
//   container.appendChild(document.createElement('div'));

//   container.appendChild(back3);
//   container.appendChild(forward3);
//   container.appendChild(document.createElement('div'));

//   container.appendChild(back4);
//   container.appendChild(forward4);
// }
