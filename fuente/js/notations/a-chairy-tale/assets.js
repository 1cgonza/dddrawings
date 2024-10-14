const assets = {
  video: document.getElementById('video'),
  data: '/data/notations/chairy-tale.json',
  smallImg: '/img/notations/chairy-tale-small.jpg',
  largeImg: '/img/notations/chairy-tale-notations.jpg',
};
assets.length = Object.keys(assets).length;
assets.loaded = 0;

export default assets;
