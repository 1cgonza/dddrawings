var html = {
  yearsMenu: yearsMenu,
  resetCurrent: resetCurrent
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
  old.classList.remove(className);
  target.classList.add(className);
}
