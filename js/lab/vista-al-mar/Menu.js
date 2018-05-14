var Menu = function() {
  this.container = document.createElement('div');
  this.container.id = 'credits';
  Object.assign(this.container.style, {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    top: 0,
    left: 0,
    zIndex: 999999
  });

  var title = document.createElement('h1');
  title.innerText = 'Vista al Mar';

  this.container.appendChild(title);
  document.body.appendChild(this.container);
};

export default Menu;
