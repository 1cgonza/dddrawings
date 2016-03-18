function DataRequest() {
  this.oReq = new XMLHttpRequest();
}

DataRequest.prototype.abort = function() {
  this.oReq.abort();
};

DataRequest.prototype.json = function(url, callback, ret, container, msgLoading, loading) {
  this.getD(url, callback, ret, 'application/json', container, msgLoading, loading);
};

DataRequest.prototype.getD = function(url, callback, ret, type, container, msgLoading, loading, resType) {
  var progress;
  var msg;

  msgLoading = msgLoading || '';
  container  = container || document.body;

  var hasLoading = false;
  var progressBar = false;

  if (loading) {
    hasLoading = true;
    loading = loading;
  } else {
    loading = container.querySelector('.loading');

    if (!loading) {
      loading = document.createElement('div');
      container.appendChild(loading);
    }
  }
  loading.className = 'loading';

  this.oReq.onloadstart = displayProgress;
  this.oReq.onprogress = updateProgress.bind(this);
  this.oReq.onloadend = hideProgress;
  this.oReq.onload = function() {
    var data;
    if (resType === 'arraybuffer') {
      data = this.oReq.response;
    } else {
      data = this.oReq.responseText;
    }

    if (type === 'application/json') {
      data = JSON.parse(data);
    }
    callback(data, ret);
  }.bind(this);

  this.oReq.onerror = function(event) {
    console.error('Error loading file', event);
  };
  this.oReq.onabort = function() {
    // console.log('Request aborted');
  };

  this.oReq.open('GET', url, true);

  if (type) {
    this.oReq.overrideMimeType(type);
  }

  if (resType) {
    this.oReq.responseType = resType;
  }

  this.oReq.send(null);

  function updateProgress(event) {
    if (event.lengthComputable) {
      if (!progressBar) {
        progress = container.querySelector('.progress');
        if (!progress) {
          progress              = document.createElement('progress');
          progress.className    = 'progress';
          progress.style.zIndex = 0;
          progress.max          = 100;
          progress.value        = 0;
          loading.insertBefore(progress, msg);
          progressBar = true;
        }
      }
      var value = event.loaded / event.total * 100;
      progress.value = value;
      msg.innerText = Math.floor(value) + '%' + '\n' + msgLoading;
    } else {
      // progress = document.createElement('div');
      // progress.className = 'no-progress';
      // loading.insertBefore(progress, msg);
      this.oReq.onprogress = null;
    }
  }

  function hideProgress() {
    if (!hasLoading) {
      loading.style.opacity = 0;
    }
    loading.style.zIndex = 0;
  }

  function displayProgress() {
    loading.style.opacity = 1;
    loading.style.zIndex = 9;

    msg = container.querySelector('.loading-msg');
    if (!msg) {
      msg = document.createElement('p');
      msg.className = 'loading-msg';
      msg.innerText = msgLoading;
      loading.appendChild(msg);
    };
  }
};

function json(url, callback, ret, container, msgLoading, loading) {
  var req = new DataRequest();
  req.json(url, callback, ret, container, msgLoading);
}

function image(url, callback, ret, container, msgLoading, loading) {
  var req = new DataRequest().getD(url, callback, ret, 'text/plain; charset=x-user-defined', container, msgLoading);
}

function audio(url, callback, ret, container, msgLoading, loading) {
  var req = new DataRequest().getD(url, callback, ret, null, container, msgLoading, null, 'arraybuffer');
}

module.exports = {
  DataRequest: DataRequest,
  json: json,
  image: image,
  audio: audio
};
