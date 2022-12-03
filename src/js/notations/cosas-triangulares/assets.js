const assets = {
  video: document.getElementById('video'),
  pequeña: {
    url: '/img/assets/notations/cosas-triangulares-small.jpg',
    img: null,
  },
  grande: {
    url: '/img/assets/notations/cosas-triangulares.jpg',
    img: null,
  },
};
assets.length = Object.keys(assets).length;
assets.loaded = 0;

export default assets;