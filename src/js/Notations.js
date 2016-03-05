var Notations = function(data) {
  this.container = data.container;
  this.loading   = data.loadingEle;

  // Image Dimensions
  this.imgW = data.img.width;
  this.imgH = data.img.height;
  this.fps  = data.fps;

  var innerPageWidth  = this.imgW - data.img.offLeft - data.img.offRight;
  var innerPageHeight = this.imgW - data.img.offTop - data.img.offBottom;

  this.innerPageHeightPercent = DDD.getPercent(innerPageHeight, this.imgH);
  this.innerPageWidthPercent  = DDD.getPercent(innerPageWidth, this.imgW);
  this.oneSecondSize          = innerPageHeight / data.secPerPage;
  this.oneSecondPercent       = DDD.getPercent(this.oneSecondSize, this.imgH);
  this.offsetTopPercent       = DDD.getPercent(data.img.offTop, this.imgH);
  this.offsetRightPercent     = DDD.getPercent(data.img.offRight, this.imgW);
  this.offsetBottomPercent    = DDD.getPercent(data.img.offBottom, this.imgH);
  this.offsetLeftPercent      = DDD.getPercent(data.img.offLeft, this.imgW);

  this.update();

  this.imgLoaded  = false;
  this.img        = new Image();
  this.img.onload = this.imageReady.bind(this);
  this.img.src    = data.img.src;

  var stage   = DDD.canvas(this.container, {w: this.width});
  this.canvas = stage.canvas;
  this.ctx    = stage.ctx;

  DDD.json(data.url, data.cb);
};

Notations.prototype.imageReady = function(event) {
  this.imageLoaded = true;
};

Notations.prototype.update = function() {
  this.width = this.container.offsetWidth;

  if (typeof this.canvas !== 'undefined') {
    this.canvas.width  = this.width;
    this.canvas.height = window.innerHeight;
  }

  var pageScale = DDD.getPercent(this.width, this.imgW);
  this.height   = DDD.sizeFromPercentage(pageScale, this.imgH);
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
