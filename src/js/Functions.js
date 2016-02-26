function DREQ () {
  this.oReq = new XMLHttpRequest();

  this.getD = function (url, callback, ret) {
    this.oReq.open('GET', url, true);
    this.oReq.overrideMimeType('application/json');

    this.oReq.onreadystatechange = function () {
      if (this.oReq.readyState == 4) {
        if (this.oReq.status == '200') {
          var data = JSON.parse(this.oReq.responseText);
          callback(data, ret);
        } else {
          console.log('Error loading data.');
        }
      }
    }.bind(this);
    this.oReq.send();
  };

  this.abort = function () {
    this.oReq.abort();
  };
}

/**
 * @param {string || number}  yearStart   First menu item
 * @param {string || number}  yearEnd     Last menu item
 * @param {string || number}  current     Default menu item to start with 'current' class
 * @param {callback}          clickEvent  Name of the function to process the click events
 * @param {callback}          callback    Name of the function for when the menu is ready
 */
function yearsListMenu (yearStart, yearEnd, current, clickEvent, callback) {
  var yearsContainer = document.createElement('ul');
  var currentYearBtn = '';
  yearsContainer.id  = 'years';
  yearsContainer.style.zIndex = 99999;

  for (var year = yearStart; year <= yearEnd; year++) {
    var btn   = document.createElement('li');
    var label = document.createTextNode(year);

    if (year === current) {
      btn.className = 'current';
      currentYearBtn = btn;
    }

    btn.appendChild(label);
    yearsContainer.appendChild(btn);
    btn.addEventListener('click', clickEvent, false);
  }
  callback(yearsContainer, currentYearBtn);
}

function resetCurrentClass (old, target) {
  old.classList.remove('current');
  target.classList.add('current');
}

function getRandom (min, max, isFloat) {
  var random = Math.floor(Math.random() * (max - min)) + min;

  if (isFloat) {
    random = Math.random() * (max - min) + min;
  }
  return random;
}

/**
 * @param {DOM Ele}           container       Element where canvas should be appended.
 * @param {Object}            data            (Optional) Styling data:
 * @param {number}            data.w          (Optional) Width of canvas.
 * @param {number}            data.h          (Optional) Height of Canvas.
 * @param {string}            data.position   (Optional) CSS position.
 * @param {string || number}  data.top        (Optional) CSS top.
 * @param {string || number}  data.left       (Optional) CSS left.
 * @param {number}            data.zi         (Optional) CSS z-index
 */
function createCanvas (container, data) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  data = data || {};

  canvas.width          = data.w || window.innerWidth;
  canvas.height         = data.h || window.innerHeight;
  canvas.style.position = data.position || 'absolute';
  canvas.style.top      = data.top || 0;
  canvas.style.left     = data.left || 0;
  canvas.style.zIndex   = data.zi || 9;

  if (container) container.appendChild(canvas);
  return {canvas: canvas, ctx: ctx};
}

// http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb (hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

function convertAlpha (processingAlpha) {
  var avg = 255 / processingAlpha;
  var cssA = 1 / avg;
  return cssA;
}

function newSizefromPercentage (percent, totalSize) {
  return percent / 100 * totalSize;
}

function getPercent (section, total) {
  return (section / total) * 100;
}

/*=================================
=            NOTATIONS            =
=================================*/
var Notations = function (data) {
  var req = new DREQ();
  this.container = data.container;
  this.loading   = data.loadingEle;

  // Image Dimensions
  this.imgW                   = data.img.width;
  this.imgH                   = data.img.height;
  this.fps                    = data.fps;

  var innerPageWidth          = this.imgW - data.img.offLeft - data.img.offRight;
  var innerPageHeight         = this.imgW - data.img.offTop - data.img.offBottom;

  this.innerPageHeightPercent = getPercent(innerPageHeight, this.imgH);
  this.innerPageWidthPercent  = getPercent(innerPageWidth, this.imgW);
  this.oneSecondSize          = innerPageHeight / data.secPerPage;
  this.oneSecondPercent       = getPercent(this.oneSecondSize, this.imgH);
  this.offsetTopPercent       = getPercent(data.img.offTop, this.imgH);
  this.offsetRightPercent     = getPercent(data.img.offRight, this.imgW);
  this.offsetBottomPercent    = getPercent(data.img.offBottom, this.imgH);
  this.offsetLeftPercent      = getPercent(data.img.offLeft, this.imgW);

  this.update();

  this.imgLoaded  = false;
  this.img        = new Image();
  this.img.onload = this.imageReady.bind(this);
  this.img.src    = data.img.src;

  var canvas = createCanvas(this.container, {
    w: this.width,
    h: window.innerHeight
  });

  this.canvas = canvas.canvas;
  this.ctx = canvas.ctx;

  req.getD(data.url, data.cb);
};

Notations.prototype.imageReady = function (event) {
  this.imageLoaded = true;
};

Notations.prototype.update = function() {
  this.width = this.container.offsetWidth;

  if (typeof this.canvas !== 'undefined') {
    this.canvas.width = this.width;
    this.canvas.height = window.innerHeight;
  }

  var pageScale = getPercent(this.width, this.imgW);
  this.height   = newSizefromPercentage(pageScale, this.imgH);
};

var NotationsVideo = function (video, cb) {
  this.v = video;
  this.videoReady = cb;
  this.checkVideoState();
};

NotationsVideo.prototype.checkVideoState = function () {
  if (this.v.readyState < 4) {
    console.log('Checking video state...');
    requestAnimationFrame( this.checkVideoState.bind(this) );
  } else {
    console.log('The video is ready.');
    this.videoReady();
  }
};
/*=====  End of NOTATIONS  ======*/

