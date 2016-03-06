var Notations = function(data) {
  this.container = data.container;
  this.loading   = data.loadingEle;

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

  this.imageLoaded  = false;
  this.img        = new Image();
  this.img.onload = this.imageReady.bind(this);
  this.img.src    = data.img.src;

  if (data.url) {
    DDD.json(data.url, data.cb);
  }
};

Notations.prototype.imageReady = function() {
  this.imageLoaded = true;
};

var NotationsVideo = function(video, cb) {
  this.video = video;
  this.videoReady = cb;
  this.checkVideoState();
};

NotationsVideo.prototype.checkVideoState = function() {
  if (this.video.readyState < 4) {
    console.log('Checking video state...');
    requestAnimationFrame(this.checkVideoState.bind(this));
  } else {
    console.log('The video is ready.');
    this.videoReady();
  }
};
