(function() {
  'use strict';

  var animReq;
  var data = {};

  var assets = {
    json: '/data/notations/tango.json',
    small: '/img/notations/tango-small.jpg',
    large: '/img/notations/tango.jpg'
  };
  var assetsLoaded = 0;
  var assetsLength = Object.keys(assets).length;

  var sectionsLen = 0;
  var bleedBottom = 30;
  var dataLoaded  = false;
  var dragging    = false;
  var prevX       = 0;
  var tX          = 0;
  var nX          = 0;
  var header      = document.getElementById('header');
  var container   = document.getElementById('ddd-container');
  var bottom      = document.createElement('div');
  var left        = document.createElement('div');
  var labelBox    = document.createElement('div');
  var polish      = document.createElement('p');
  var eng         = document.createElement('p');
  var video       = new NotationsVideo(document.getElementById('video'), videoReady).video;

  bottom.id               = 'bottom';
  bottom.style.position   = 'fixed';
  left.id                 = 'left';
  left.style.position     = 'fixed';
  labelBox.id             = 'label-box';

  container.appendChild(bottom);
  container.appendChild(left);

  eng.className = 'eng';
  polish.className = 'pol';
  labelBox.appendChild(polish);
  labelBox.appendChild(eng);
  left.appendChild(labelBox);

  var timeline = new Notations({
    img: {
      width: 2000,
      height: 103,
      src: assets.small,
      cb: timelineReady,
      msg: 'Loading Timeline'
    },
    'fps': 24,
    container: bottom,
  });
  timeline.canvas.style.opacity = 0;
  timeline.canvas.height = DDD.sizeFromPercentage(DDD.getPercent(window.innerWidth, timeline.imgW), timeline.imgH) + bleedBottom;
  bottom.style.width    = '100%';
  bottom.style.height   = timeline.canvas.height + 'px';
  bottom.style.bottom   = 0;
  var timelineBg = DDD.canvas(bottom, {h: timeline.canvas.height, zi: 1});

  var notations = new Notations({
    img: {
      width: 15458,
      height: 800,
      src: assets.large,
      cb: notationsReady,
      msg: 'Loading Notations \n (This is a large image, please be patient)'
    },
    fps: 24,
    container: left,
  });
  notations.canvas.style.opacity = 0;
  notations.canvas.height = window.innerHeight - header.offsetHeight - timeline.canvas.height;
  left.style.width  = '60%';
  left.style.height = notations.canvas.height + 'px';
  left.style.top    = header.offsetHeight + 'px';

  function checkAssetsLoaded() {
    function stopDrag() {
      dragging = false;
      return false;
    }

    function updateAll() {
      if (video.paused) {
        updateNotations();
      }
    }

    if (assetsLoaded < assetsLength) {
      requestAnimationFrame(checkAssetsLoaded);
    } else {
      resize.updateRepaint();
      video.controls = true;

      // videoControl();
      left.onmousedown = function(event) {
        prevX = event.clientX;
        dragging = true;

        return false;
      };

      left.onmouseup = stopDrag;
      bottom.onmouseup = stopDrag;

      left.onmousemove = function(event) {
        if (dragging) {
          var distance = prevX - event.clientX;
          video.currentTime += resize.videoNotationsW * distance;
          prevX = event.clientX;
          updateAll();
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

      bottom.onmousedown = function(event) {
        var distance = event.clientX - tX;
        video.currentTime += resize.videoTimelineW * distance;
        dragging = true;
        updateAll();

        return false;
      };

      bottom.onmousemove = function(event) {
        if (dragging) {
          var distance = event.clientX - tX;
          video.currentTime += resize.videoTimelineW * distance;
          updateAll();
        }
        return false;
      };
    }
  }

  function timelineReady() {
    assetsLoaded++;
    resize.resizeTimeline();
    repaintTimeline();
    timeline.canvas.style.opacity = 1;
  }

  function notationsReady() {
    assetsLoaded++;
    resize.resizeNotations();
    repaintNotations(0);
    notations.canvas.style.opacity = 1;
  }

  function dataReady(d) {
    data = d;
    sectionsLen = d.sections.length;
    assetsLoaded++;
    dataLoaded = true;
  }

  function videoReady() {
    DDD.json(assets.json, dataReady);
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

    notations.ctx.clearRect(0, 0, resize.leftW, resize.leftH);
    repaintNotations(nX);

    notations.ctx.beginPath();
    notations.ctx.moveTo(notations.offX, 0);
    notations.ctx.lineTo(notations.offX, resize.leftH);
    notations.ctx.stroke();
  }

  function repaintNotations(x) {
    notations.ctx.drawImage(
      notations.img,
      0, 0,
      notations.imgW, notations.imgH,
      -x, 0,
      notations.resizeW, resize.leftH
    );
  }

  function repaintTimeline() {
    timelineBg.ctx.fillRect(0, 0, resize.bottomW, resize.bottomH);
    timelineBg.ctx.drawImage(
      timeline.img,
      0, 0,
      timeline.imgW, timeline.imgH,
      0, timeline.offY,
      resize.bottomW, resize.timelineH
    );
  }

  var resize = {
    reset: function() {
      this.bottomW          = window.innerWidth;
      this.topH             = header.offsetHeight;
      this.timelinePercent  = DDD.getPercent(this.bottomW, timeline.imgW);
      this.adjustPercent    = DDD.getPercent(timeline.imgW, data.imgW);
      this.bottomH          = DDD.sizeFromPercentage(this.timelinePercent, timeline.imgH) + bleedBottom | 0;
      this.leftH            = window.innerHeight - this.topH - this.bottomH;
      this.notationsPercent = DDD.getPercent(this.leftH, notations.imgH);
    },

    adjustTimelineX: function(x) {
      var resizeX = DDD.sizeFromPercentage(this.adjustPercent, x);

      return DDD.sizeFromPercentage(this.timelinePercent, resizeX);
    },

    resizeTimeline: function(noReset) {
      if (!noReset) {
        this.reset();
      }
      this.timelineH         = DDD.sizeFromPercentage(this.timelinePercent, timeline.imgH) | 0;
      timeline.canvas.width  = timelineBg.canvas.width = this.bottomW;
      timeline.canvas.height = timelineBg.canvas.height = this.bottomH;
      bottom.style.height    = this.bottomH + 'px';

      if (this.bottomH > this.timelineH) {
        timeline.offY = (this.bottomH / 2) - (this.timelineH / 2);
      } else {
        timeline.offY = 0;
      }

      if (dataLoaded) {
        timeline.offX = this.adjustTimelineX(data.initX) | 0;
        timeline.ctx.strokeStyle = 'red';
      }

      var videoH = window.innerHeight - this.bottomH;
      video.style.maxHeight = videoH + 'px';
      video.style.marginTop = (videoH / 2) - (video.offsetHeight / 2) + 'px';
      this.videoTimelineW = video.duration / this.adjustTimelineX(data.endX - data.initX);
    },

    resizeNotations: function(noReset) {
      if (!noReset) {
        this.reset();
      }
      this.leftW              = left.offsetWidth;
      left.style.top          = this.topH + 'px';
      left.style.height       = this.leftH + 'px';

      notations.resizeW       = DDD.sizeFromPercentage(this.notationsPercent, notations.imgW);
      notations.canvas.height = this.leftH;
      notations.canvas.width  = this.leftW;

      if (dataLoaded) {
        notations.offX = DDD.sizeFromPercentage(this.notationsPercent, data.initX) | 0;
        notations.ctx.strokeStyle = 'red';

        labelBox.style.left = notations.offX + 'px';
      }

      this.videoNotationsW = video.duration / DDD.sizeFromPercentage(this.notationsPercent, data.endX - data.initX);
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

        data.sections[i].tX = this.adjustTimelineX(x) | 0;
        data.sections[i].tW = this.adjustTimelineX(w) | 0;
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
      this.resizeData();
      repaintTimeline();
      updateNotations();
    }
  };

  window.onresize = resize.updateRepaint.bind(resize);

  function videoControl() {
    var container = document.getElementById('video-container');
    var back = document.createElement('button');
    var forward = document.createElement('button');

    var back2 = document.createElement('button');
    var forward2 = document.createElement('button');

    var back3 = document.createElement('button');
    var forward3 = document.createElement('button');

    var back4 = document.createElement('button');
    var forward4 = document.createElement('button');

    back.innerHTML = '&larr;';
    forward.innerHTML = '&rarr;';

    back2.innerHTML = '&larr;';
    forward2.innerHTML = '&rarr;';

    back3.innerHTML = '&larr;';
    forward3.innerHTML = '&rarr;';

    back4.innerHTML = '&larr;';
    forward4.innerHTML = '&rarr;';

    back.onclick = function() {
      video.currentTime -= 0.0001;
      console.log(video.currentTime);
      return false;
    };

    forward.onclick = function() {
      video.currentTime += 0.0001;
      console.log(video.currentTime);
      return false;
    };

    back2.onclick = function() {
      video.currentTime -= 0.001;
      console.log(video.currentTime);
      return false;
    };

    forward2.onclick = function() {
      video.currentTime += 0.001;
      console.log(video.currentTime);
      return false;
    };

    back3.onclick = function() {
      video.currentTime -= 0.01;
      console.log(video.currentTime);
      return false;
    };

    forward3.onclick = function() {
      video.currentTime += 0.01;
      console.log(video.currentTime);
      return false;
    };

    back4.onclick = function() {
      video.currentTime -= 0.1;
      console.log(video.currentTime);
      return false;
    };

    forward4.onclick = function() {
      video.currentTime += 0.1;
      console.log(video.currentTime);
      return false;
    };

    container.appendChild(back);
    container.appendChild(forward);
    container.appendChild(document.createElement('div'));

    container.appendChild(back2);
    container.appendChild(forward2);
    container.appendChild(document.createElement('div'));

    container.appendChild(back3);
    container.appendChild(forward3);
    container.appendChild(document.createElement('div'));

    container.appendChild(back4);
    container.appendChild(forward4);
  }

})();
