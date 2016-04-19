var ddd = {
  _name: 'Data Driven Drawings'
};

global.DDD = Object.assign(
  ddd,
  require('./math'),
  require('./html'),
  require('./Map'),
  require('./http/req'),
  require('./color'),
  require('./audio'),
  require('./webgl')
);
