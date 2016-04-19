function json(options) {
  var req = new DataRequest();
  return req.json(options);
}

function image(options) {
  var o = new DataRequest();
  o.req.overrideMimeType('text/plain; charset=x-user-defined');

  return o.getD(options)
  .then(function(res) {
    if (res.ret !== undefined) {
      return res;
    } else {
      return res.data;
    }
  })
  .catch(function(err) {
    console.error(err);
  });
}

function audio(options) {
  var o = new DataRequest();
  o.req.responseType = 'arraybuffer';

  return o.getD(options)
  .then(function(res) {
    return res;
  })
  .catch(function(err) {
    console.error('Error fetching audio file', err);
  });
}

function DataRequest() {
  this.req = new XMLHttpRequest();
}

DataRequest.prototype.abort = function() {
  this.req.abort();
};

DataRequest.prototype.json = function(options) {
  this.req.overrideMimeType('application/json');

  return this.getD(options)
  .then(function(res) {
    if (res.ret !== undefined) {
      res.data = JSON.parse(res.data);
      return res;
    } else {
      return JSON.parse(res.data);
    }
  })
  .catch(function(err) {
    console.error('Error in data request, reason:', err);
  });
};

DataRequest.prototype.getD = function(options) {
  if (typeof options === 'object') {
    if (!options.url) {
      console.error('The request did not receive a url, instead got', options.url);
      return;
    }
  } else if (typeof options === 'string' && options.length > 0) {
    options = {
      url: options
    };
  }

  var msg;
  var progress;
  var progressBar = false;
  var req = this.req;
  var loadingMsg = options.loadingMsg || 'Loading';
  var container  = options.container || document.body;

  var loadingWrapper = container.querySelector('.loading');

  if (!loadingWrapper) {
    loadingWrapper = document.createElement('div');
    loadingWrapper.className = 'loading';
    container.appendChild(loadingWrapper);
  }

  var hasLoading = !!options.loadingEle;
  var loadingEle = hasLoading ? options.loadingEle : null;

  if (!loadingEle) {
    var firstLoadingEle = container.querySelector('.loading-ele');
    loadingEle = document.createElement('div');
    loadingEle.className = 'loadingEle';

    if (firstLoadingEle) {
      loadingWrapper.insertBefore(firstLoadingEle, loadingEle);
    } else {
      loadingWrapper.appendChild(loadingEle);
    }
  }

  function displayProgress() {
    loadingEle.style.opacity = 1;
    loadingWrapper.style.zIndex = 9;

    msg = loadingEle.querySelector('.loading-msg');
    if (!msg) {
      msg = document.createElement('p');
      msg.className = 'loading-msg';
      msg.innerText = loadingMsg;
      loadingEle.appendChild(msg);
    };
  }

  function updateProgress(event) {
    if (event.lengthComputable) {
      if (!progressBar) {
        // console.log(loadingEle)
        progress = loadingEle.querySelector('.progress');

        if (!progress) {
          progress              = document.createElement('progress');
          progress.className    = 'progress';
          progress.style.zIndex = 0;
          progress.max          = 100;
          progress.value        = 0;
          loadingEle.insertBefore(progress, msg);
          progressBar = true;
        }
      }
      var value = event.loaded / event.total * 100;
      progress.value = value;
      msg.innerText = Math.floor(value) + '%' + '\n' + loadingMsg;
    } else {
      // progress = document.createElement('div');
      // progress.className = 'no-progress';
      // loading.insertBefore(progress, msg);
      req.onprogress = null;
    }
  }

  function hideProgress() {
    if (!hasLoading) {
      loadingEle.style.display = 'none';
    }
    loadingWrapper.style.zIndex = 0;
  }

  return new Promise(function(resolve, reject) {
    req.open('GET', options.url, true);
    req.onloadstart = displayProgress;
    req.onprogress  = updateProgress;
    req.onloadend   = hideProgress;

    req.onload = function() {
      if (req.status === 200) {
        resolve({data: req.response, ret: options.ret});
      } else {
        reject(req.statusText);
      }
    };
    req.onerror = function() {
      reject('Network Error');
    };

    req.send(null);
  });
};

module.exports = {
  DataRequest: DataRequest,
  json: json,
  image: image,
  audio: audio
};
