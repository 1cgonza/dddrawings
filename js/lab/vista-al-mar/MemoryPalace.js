import { canvas, random } from 'dddrawings';
export default class MemoryPalace {
  constructor(container) {
    let basePath = '/img/assets/vistaMemory/';
    this.memories = [];
    this.mnemonics = [`${basePath}golpe1.png`, `${basePath}mono.jpg`, `${basePath}caida1.jpg`, `${basePath}golpe2.jpg`];
    this.stage = canvas(container);
    this.stage.canvas.id = 'memory';
    this.stage.canvas.style.zIndex = 0;
    this.loadMemories();
  }

  invokeStatic() {
    let ctx = this.stage.ctx;

    setTimeout(() => {
      let i = random(0, this.memories.length);

      ctx.clearRect(0, 0, this.stage.w, this.stage.h);
      ctx.drawImage(this.memories[i].img, 0, 0);
      this.invokeStatic();
    }, 10000);
  }

  updateOpacity(o) {
    this.stage.ctx.globalAlpha = o / 2;
  }

  loadMemories() {
    this.mnemonics.forEach(mnemonic => {
      let img = new Image();
      img.onload = () => {
        this.memories.push({
          img: img,
          w: img.naturalWidth,
          h: img.naturalHeight
        });
      };
      img.src = mnemonic;
    });
  }
}
