export class Notations {
  constructor(data) {
    var container = data.container || document.body;

    if (data.hasOwnProperty('url')) {
      DDD.json({
        url: data.url,
        container: container
      }).then(data.cb)
        .catch(err => {
          console.error(err);
        });
    }

    if (data.hasOwnProperty('img')) {
      this.imgCallback = data.img.cb;
      DDD.image({
        url: data.img.src,
        container: container,
        loadingMsg: data.img.msg
      }).then(this.prepareImageData.bind(this));

      // Image Dimensions
      this.imgW = data.img.width;
      this.imgH = data.img.height;
      this.fps = data.fps;

      var areaWidth = this.imgW - data.img.offLeft - data.img.offRight;
      var areaHeight = this.imgH - data.img.offTop - data.img.offBottom;

      this.percent = {
        h: DDD.getPercent(areaHeight, this.imgH),
        w: DDD.getPercent(areaWidth, this.imgW),
        top: DDD.getPercent(data.img.offTop, this.imgH),
        bottom: DDD.getPercent(data.img.offBottom, this.imgH),
        left: DDD.getPercent(data.img.offLeft, this.imgW),
        right: DDD.getPercent(data.img.offRight, this.imgW)
      };
    }

    this.stage = DDD.canvas(container, {
      w: container.offsetWidth
    });
    this.canvas = this.stage.canvas;
    this.ctx = this.stage.ctx;
  }

  prepareImageData(res) {
    this.img = new Image();
    this.img.onload = this.imgCallback;
    this.img.src = 'data:image/jpeg;base64,' + DDD.base64(res);
  }
}

export const notationsVideo = (video, cb) => {
  // Happens once and triggers callback when video information (eg: duration) is accessible
  video.onloadedmetadata = function() {
    cb();
    return false;
  };

  // TODO: implement some progress report or abort if taking too long
  // var startLoading = Date.now();
  // video.onprogress = function() {
  //   var now = Date.now();
  //   if (now - startLoading >= 10000 && video.readyState < 4) {
  //     ...abort?
  //   }
  //   return false;
  // };

  video.onerror = function(event) {
    var errMsg = document.createElement('div');
    errMsg.innerHTML = video.innerHTML;
    video.parentNode.replaceChild(errMsg, video);
    console.log(err);
    return false;
  };

  return video;
};
