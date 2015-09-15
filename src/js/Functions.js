/**
 * [requestData makes HTTP request and return an array to a callback function]
 * @param  {string}   url       URL to request data
 * @param  {callback} callback  Function name to run when request is successful
 * @return {Array}
 */
function requestData (url, callback) {
  var oReq = new XMLHttpRequest();

  oReq.open('GET', url, true);
  oReq.overrideMimeType('application/json');

  oReq.onreadystatechange = function () {
    if (oReq.readyState == 4) {
      if (oReq.status == '200') {
        var data = JSON.parse(oReq.responseText);
        callback(data);
      } else {
        console.log('Error loading data.');
      }
    }
  };
  oReq.send();
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

  if (data) {
    canvas.width = data.w;
    canvas.height = data.h;
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = data.zi;
  }
  container.appendChild(canvas);
  return {canvas: canvas, ctx: ctx};
}

function newSizefromPercentage (percent, totalSize) {
  var newSize = percent / 100 * totalSize;
  return newSize;
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
