(function () {
  var mainNav = document.getElementById('main-nav');
  var menuIcon = document.getElementById('menu-icon');

  document.onclick = function(event) {
    if (event.target.id !== 'menu-icon') {
      mainNav.classList.remove('open');
      menuIcon.classList.remove('open');
    }
  };

  menuIcon.onclick = function(event) {
    event.target.classList.toggle('open');
    mainNav.classList.toggle('open');
  };

  if (document.getElementsByClassName('with-nav').length > 0) {
    document.getElementById('site-nav').classList.add('open');
  }
})();