var html = {
  yearsMenu: yearsMenu,
  resetCurrent: resetCurrent,
  base64: base64,
  canvas: require('./canvas')
};

module.exports = html;

/**
 * @param {Number}    yearStart   First menu item
 * @param {Number}    yearEnd     Last menu item
 * @param {Number}    current     Default menu item to start with 'current' class
 * @param {Callback}  clickEvent  Name of the function to process the click events
 * @param {Callback}  callback    Name of the function for when the menu is ready
 */
function yearsMenu(yearStart, yearEnd, current, clickEvent, callback) {
  var yearsContainer = document.createElement('ul');
  var currentYearBtn = '';
  yearsContainer.id  = 'years';
  yearsContainer.style.zIndex = 99999;

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

function resetCurrent(old, target, className) {
  className = className || 'current';

  if (old) {
    old.classList.remove(className);
  }
  target.classList.add(className);
}

// This encoding function is from Philippe Tenenhaus's example at http://www.philten.com/us-xmlhttprequest-image/
function base64(inputStr) {
  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var outputStr = '';
  var i = 0;

  while (i < inputStr.length) {
    //all three "& 0xff" added below are there to fix a known bug
    //with bytes returned by xhr.responseText
    var byte1 = inputStr.charCodeAt(i++) & 0xff;
    var byte2 = inputStr.charCodeAt(i++) & 0xff;
    var byte3 = inputStr.charCodeAt(i++) & 0xff;

    var enc1 = byte1 >> 2;
    var enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);

    var enc3;
    var enc4;
    if (isNaN(byte2)) {
      enc3 = enc4 = 64;
    } else {
      enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
      if (isNaN(byte3)) {
        enc4 = 64;
      } else {
        enc4 = byte3 & 63;
      }
    }

    outputStr += b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4);
  }

  return outputStr;
}
