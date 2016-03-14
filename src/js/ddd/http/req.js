function DataRequest() {
  this.oReq = new XMLHttpRequest();
}

DataRequest.prototype.abort = function() {
  this.oReq.abort();
};

DataRequest.prototype.json = function(url, callback, ret, container, msgLoading, loading) {
  this.getD(url, callback, ret, 'application/json', container, msgLoading, loading);
};

DataRequest.prototype.getD = function(url, callback, ret, type, container, msgLoading, loading) {
  var progress;
  var msg;

  var hasLoading = false;
  if (loading) {
    hasLoading = true;
    loading = loading;
  } else {
    loading = document.createElement('div');
  }

  loading.className = 'loading';
  msgLoading = msgLoading || '';
  container  = container || document.body;

  this.oReq.onloadstart = displayProgress;
  this.oReq.onprogress = updateProgress;
  this.oReq.onloadend = hideProgress;
  this.oReq.onload = function() {
    var data = this.oReq.responseText;
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

  this.oReq.send(null);

  function updateProgress(event) {
    if (event.lengthComputable) {
      var value = event.loaded / event.total * 100;
      progress.value = value;
      msg.innerText = Math.floor(value) + '%' + '\n' + msgLoading;
    } else {
      console.log('File size unknown, unable to show progress bar');
    }
  }

  function hideProgress() {
    if (!hasLoading) {
      loading.style.opacity = 0;
    }
    loading.style.zIndex = 0;
  }

  function displayProgress() {
    loading.style.zIndex = 99999;
    msg = document.createElement('p');
    msg.className = 'loading-msg';
    msg.innerText = '0%' + '\n' + msgLoading;

    progress              = document.createElement('progress');
    progress.className    = 'progress';
    progress.style.zIndex = 0;
    progress.value        = 0;
    progress.max          = 100;

    loading.appendChild(progress);
    loading.appendChild(msg);
    container.appendChild(loading);
  }
};

function json(url, callback, ret, container, msgLoading, loading) {
  var req = new DataRequest();
  req.json(url, callback, ret, container, msgLoading);
}

function image(url, callback, ret, container, msgLoading, loading) {
  var req = new DataRequest().getD(url, callback, ret, 'text/plain; charset=x-user-defined', container, msgLoading);
}

module.exports = {
  DataRequest: DataRequest,
  json: json,
  image: image
};
