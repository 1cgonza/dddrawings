export default class Images {
  constructor(paintTimelineFrame) {
    this.paintTimelineFrame = paintTimelineFrame;
    this.total = 16;
    this.loaded = 0;
    this.totalW = 15458;
    this.width = 1000;
    this.height = 785;
    this.frames = {};

    this.loadingMsg = 'Please be patient, loading large images';
    this.msg = document.createElement('p');
    this.msg.className = 'loading-msg';
    this.msg.innerText = this.loadingMsg;

    this.loading = document.createElement('div');
    this.loading.className = 'loading';
    this.loading.style.opacity = 0;

    this.progress = document.createElement('progress');
    this.progress.className = 'progress';
    this.progress.style.zIndex = 0;
    this.progress.max = 100;
    this.progress.value = 0;

    this.loading.appendChild(this.progress);
    this.loading.appendChild(this.msg);
  }

  load(offY) {
    return new Promise((res) => {
      for (let i = 0; i < this.total; i++) {
        let img = new Image();
        img.dataset.key = i;

        img.onload = () => {
          const key = img.dataset.key;
          const w = this.timelineW;
          this.loaded++;
          const value = (this.loaded / this.total) * 100;

          this.progress.value = value;
          this.msg.innerText = `${value | 0}%${'\n' + this.loadingMsg}`;
          this.paintTimelineFrame(this.frames[key], key * w, offY, w);

          if (this.loaded === this.total) res();
        };
        img.src = `/img/notations/tango/tango${i}.jpg`;
        this.frames[i] = img;
      }
    });
  }
}
