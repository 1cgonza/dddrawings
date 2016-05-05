var req = require('../http/req').audio;

var Audio = function(audios, cb) {
  if (!audios || Object.prototype.toString.call(audios) !== '[object Object]') {
    return console.error('The first parameter needs to be an Object.', 'Example:', '{audio1: \'audio1.mp3\', audio2: \'audio2.mp3\'}');
  }

  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  var total    = Object.keys(audios).length;
  var loaded   = 0;
  var retAudios = {};

  this.ctx = new AudioContext();

  for (var name in audios) {
    req(
      audios[name],
      finishedLoading.bind(this),
      name,
      document.body,
      'Loading Audio'
    );
  }

  function finishedLoading(arrayBuffer, name) {
    var a = this;
    this.ctx.decodeAudioData(
      arrayBuffer,
      onSucess.bind(a),
      onError
    );

    function onSucess(buffer) {
      if (!buffer) {
        console.error('Error decoding audio file:', name);
        return;
      }
      var src = this.ctx.createBufferSource();
      src.buffer = buffer;
      retAudios[name] = src;
      checkLoaded();
    }

    function onError(err) {
      console.error('decodeAudioData error', err);
    }
  };

  function checkLoaded() {
    loaded++;
    if (loaded === total) {
      cb(retAudios);
    }
  };
};

Audio.prototype.source = function(src) {
  var src = this.ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(this.gainNode);
  this.gainNode.connect(this.ctx.destination);

  return src;
};

module.exports = {
  Audio: Audio
};
