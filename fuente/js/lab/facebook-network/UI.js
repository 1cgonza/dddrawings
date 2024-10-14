import { random } from 'dddrawings';

export default class UI {
  constructor() {
    this.options = ['circle', 'line', 'polygon', 'rect', 'heads', 'randomize'];
    this.current = this.options[random(0, this.options.length - 1)];
  }

  init(network, container) {
    this.network = network;
    const nav = document.createElement('ul');
    nav.className = 'network-options';

    this.options.forEach((ele) => {
      const li = document.createElement('li');

      li.innerHTML = ele;

      if (ele === 'randomize') {
        li.className = 'randomizer';
        li.onclick = () => {
          network.reset(this.current);
        };
      } else {
        this.optionsClickEvent(li, ele);
      }

      if (ele === this.current) {
        li.className = 'current';
        this.current = ele;
      }

      nav.appendChild(li);
    });

    container.appendChild(nav);
  }

  optionsClickEvent(li, type) {
    li.onclick = (event) => {
      const menu = document.querySelector('.network-options');
      const currentOption = menu.querySelector('.current');

      currentOption.classList.remove('current');
      event.target.classList.add('current');
      this.current = type;
      this.network.reset();
    };
  }

  getCurrent() {
    return this.current;
  }
}
