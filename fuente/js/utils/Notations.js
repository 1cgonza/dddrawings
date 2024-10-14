import { canvas, json, image, base64, getPercent } from 'dddrawings';

export class Notations {
  constructor(data) {
    const container = data.container || document.body;

    if (data.hasOwnProperty('url')) {
      json({
        url: data.url,
        container: container,
      })
        .then(data.cb)
        .catch((err) => console.error(err));
    }

    if (data.hasOwnProperty('img')) {
      this.imgCallback = data.img.cb;
      image({
        url: data.img.src,
        container: container,
        loadingMsg: data.img.msg,
      }).then(this.prepareImageData);

      // Image Dimensions
      this.imgW = data.img.width;
      this.imgH = data.img.height;
      this.fps = data.fps;

      var areaWidth = this.imgW - data.img.offLeft - data.img.offRight;
      var areaHeight = this.imgH - data.img.offTop - data.img.offBottom;

      this.percent = {
        h: getPercent(areaHeight, this.imgH),
        w: getPercent(areaWidth, this.imgW),
        top: getPercent(data.img.offTop, this.imgH),
        bottom: getPercent(data.img.offBottom, this.imgH),
        left: getPercent(data.img.offLeft, this.imgW),
        right: getPercent(data.img.offRight, this.imgW),
      };
    }

    this.stage = canvas(container, { w: container.offsetWidth });
    this.canvas = this.stage.canvas;
    this.ctx = this.stage.ctx;
  }

  prepareImageData = (res) => {
    this.img = new Image();
    this.img.onload = this.imgCallback;
    this.img.src = 'data:image/jpeg;base64,' + base64(res);
  };
}

export const notationsVideo = (video) => {
  return new Promise((res, rej) => {
    // Happens once and triggers callback when video information (eg: duration) is accessible
    video.onloadedmetadata = () => {
      res();
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

    video.onerror = (err) => {
      var errMsg = document.createElement('div');
      errMsg.innerHTML = video.innerHTML;
      video.parentNode.replaceChild(errMsg, video);
      console.log(err);
      rej(err);
    };
  });
};
