var ddd = {
  name: 'Data Driven Drawings',

  math: require('./math'),
  Transform: require('./math').Transform,
  random: require('./math').random,
  getPercent: require('./math').getPercent,
  sizeFromPercentage: require('./math').sizeFromPercentage,

  canvas: require('./html/canvas'),

  html: require('./html'),
  yearsMenu: require('./html').yearsMenu,
  resetCurrent: require('./html').resetCurrent,

  Map: require('./map'),

  DataRequest: require('./http/req').DataRequest,
  json: require('./http/req').json,

  color: require('./color'),
  hexToRgb: require('./color').hexToRgb,
  rgbToHex: require('./color').rgbToHex,
  convertAlpha: require('./color').convertAlpha
};

global.DDD = ddd;
