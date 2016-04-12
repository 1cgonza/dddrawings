var Notations = function(data) {
  this.container = data.container;
  this.imgCallback = data.img.cb;

  // Image Dimensions
  this.imgW = data.img.width;
  this.imgH = data.img.height;
  this.fps  = data.fps;

  var areaWidth     = this.imgW - data.img.offLeft - data.img.offRight;
  var areaHeight    = this.imgH - data.img.offTop - data.img.offBottom;

  this.percent = {
    h: DDD.getPercent(areaHeight, this.imgH),
    w: DDD.getPercent(areaWidth, this.imgW),
    top: DDD.getPercent(data.img.offTop, this.imgH),
    bottom: DDD.getPercent(data.img.offBottom, this.imgH),
    left: DDD.getPercent(data.img.offLeft, this.imgW),
    right: DDD.getPercent(data.img.offRight, this.imgW)
  };

  this.stage  = DDD.canvas(this.container, {w: this.container.offsetWidth});
  this.canvas = this.stage.canvas;
  this.ctx    = this.stage.ctx;

  DDD.image(data.img.src, this.prepareImageData.bind(this), null, this.container, data.img.msg);

  if (data.url) {
    DDD.json(data.url, data.cb);
  }
};

Notations.prototype.prepareImageData = function(res) {
  this.img = new Image();
  this.img.onload = this.imgCallback;
  this.img.src = 'data:image/jpeg;base64,' + DDD.base64(res);
};

var notationsVideo = function(video, cb) {
  video.oncanplay = function() {
    cb();
    return false;
  };

  // TODO: implement some progress report or abort if taking too long
  // var startLoading = Date.now();
  video.onprogress = function() {
    // var now = Date.now();
    // if (now - startLoading >= 10000 && video.readyState < 4) {
    //   ...abort?
    // }
    return false;
  };

  video.onerror = function(event) {
    var errMsg = document.createElement('div');
    errMsg.innerHTML = video.innerHTML;
    video.parentNode.replaceChild(errMsg, video);
    return false;
    console.log(err);
  };

  return video;
};
