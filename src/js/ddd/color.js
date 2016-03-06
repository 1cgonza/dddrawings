var color = {
  hexToRgb: hexToRgb,
  rgbToHex: rgbToHex,
  convertAlpha: convertAlpha,
  getRGBA: getRGBA
};

function rgbToHex(r, g, b) {
  return '0x' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
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

function convertAlpha(processingAlpha) {
  var avg = 255 / processingAlpha;
  var cssA = 1 / avg;
  return cssA;
}

function getRGBA(c, a) {
  return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
}

module.exports = color;
