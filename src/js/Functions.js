/**
 * [requestData makes HTTP request and return an array to a callback function]
 * @param  {string}   url       URL to request data
 * @param  {callback} callback  Function name to run when request is successful
 * @return {Array}
 */
function requestData (url, callback) {
  var oReq = new XMLHttpRequest();

  oReq.open('GET', url, true);
  oReq.overrideMimeType('application/json');

  oReq.onreadystatechange = function () {
    if (oReq.readyState == 4) {
      if (oReq.status == '200') {
        var data = JSON.parse(oReq.responseText);
        callback(data);
      } else {
        console.log('Error loading data.');
      }
    }
  };
  oReq.send();
}

/**
 * @param {string || number}  yearStart   First menu item
 * @param {string || number}  yearEnd     Last menu item
 * @param {string || number}  current     Default menu item to start with 'current' class
 * @param {callback}          clickEvent  Name of the function to process the click events
 * @param {callback}          callback    Name of the function for when the menu is ready
 */
function yearsListMenu (yearStart, yearEnd, current, clickEvent, callback) {
  var yearsContainer = document.createElement('ul');
  var currentYearBtn = '';
  yearsContainer.id  = 'years';

  for (var year = yearStart; year <= yearEnd; year++) {
    var btn   = document.createElement('li');
    var label = document.createTextNode(year);

    if (year === current) {
      btn.className = 'current';
      currentYearBtn = btn;
    }

    btn.appendChild(label);
    yearsContainer.appendChild(btn);
    btn.addEventListener('click', clickEvent, false);
  }
  callback(yearsContainer, currentYearBtn);
}

function resetCurrentClass (old, target) {
  old.classList.remove('current');
  target.classList.add('current');
}