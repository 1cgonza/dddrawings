import { year, animReq } from './index';

export default class UI {
  constructor(container, reloadStage, violenceReq) {
    this.container = container;
    this.current;
    this.reloadStage = reloadStage;
    this.violenceReq = violenceReq;
    this.menu = DDD.yearsMenu(2008, 2016, year, this.onClick.bind(this), this.menuReady.bind(this));
  }

  menuReady(menu, currentFirst) {
    this.container.appendChild(menu);
    this.current = currentFirst;
  }

  onClick(event) {
    if (event.target !== this.current) {
      window.cancelAnimationFrame(animReq);
      DDD.resetCurrent(this.current, event.target);
      this.violenceReq.abort();
      this.current = event.target;
      this.reloadStage(event.target.textContent);
    }
  }
}
