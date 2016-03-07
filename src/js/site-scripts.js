(function() {
  var mainNav = document.getElementById('main-nav');
  var menuIcon = document.getElementById('menu-icon');

  document.onclick = function(event) {
    if (menuIcon === event.target || menuIcon.contains(event.target)) {
      mainNav.classList.toggle('open');
      menuIcon.classList.toggle('open');
    } else {
      mainNav.classList.remove('open');
      menuIcon.classList.remove('open');
    }
  };

  if (document.getElementsByClassName('with-nav').length > 0) {
    document.getElementById('site-nav').classList.add('open');
  }
})();
