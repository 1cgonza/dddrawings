export default class Menu {
  constructor(container, options, cb) {
    this.options = options;
    this.cb = cb;
    this.yearsStart = 1993;
    this.yearsEnd = 2014;
    this.years = [];
    this.menu = document.createElement('ul');
    this.menu.id = 'years';
    container.appendChild(this.menu);
  }

  onItemClick = e => {
    const item = e.target;
    if (!item.classList.contains('current')) {
      this.options.year = +item.innerText;
      this.menu.querySelector('li.current').classList.remove('current');
      item.classList.add('current');
      this.cb();
    }
  };

  bindData(data) {
    // Build an array of objects for every year available.
    for (let i = this.yearsStart; i < this.yearsEnd + 1; i++) {
      const intensity = data.hasOwnProperty(i) ? data[i].length : 0;
      this.years.push({ year: i, intensity: intensity });
    }
  }

  buildMenu() {
    this.years.forEach(d => {
      const item = document.createElement('li');
      item.innerText = d.year;
      item.style.borderBottom = `${d.intensity}px solid rgba(192,55,23,.2)`;
      if (this.options.year == d.year) item.className = 'current';
      item.onclick = this.onItemClick;
      this.menu.appendChild(item);
    });
  }
}
