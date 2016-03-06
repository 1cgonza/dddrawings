function DataRequest() {
  this.oReq = new XMLHttpRequest();
}

DataRequest.prototype.abort = function() {
  this.oReq.abort();
};

DataRequest.prototype.json = function(url, callback, ret) {
  this.getD(url, callback, ret, 'application/json');
};

DataRequest.prototype.getD = function(url, callback, ret, type) {
  this.oReq.open('GET', url, true);

  if (type) {
    this.oReq.overrideMimeType(type);
  }

  this.oReq.onreadystatechange = function() {
    if (this.oReq.readyState == 4) {
      if (this.oReq.status == '200') {
        var data = JSON.parse(this.oReq.responseText);
        callback(data, ret);
      } else {
        console.log('Error loading data.');
      }
    }
  }.bind(this);

  this.oReq.send();
};

function json(url, callback, ret) {
  var req = new DataRequest();
  req.json(url, callback, ret);
}

module.exports = {
  DataRequest: DataRequest,
  json: json
};
