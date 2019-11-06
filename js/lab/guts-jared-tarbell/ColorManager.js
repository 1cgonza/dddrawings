import { canvas, random } from 'dddrawings';

export default class ColorManager {
  constructor() {
    this.goodColors = [];
  }

  takeColor(imgURL) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const temp = canvas(null, { w: w, h: h });

        temp.ctx.drawImage(img, 0, 0);
        const pixels = temp.ctx.getImageData(0, 0, w, h).data;

        for (let i = 0; i < pixels.length; i += 4) {
          const color = [pixels[i], pixels[i + 1], pixels[i + 2]];
          const catchColor = false;

          for (let j = 0; j < this.goodColors.length; j++) {
            if (
              color[0] === this.goodColors[j][0] &&
              this.goodColors[1] === this.goodColors[j][1] &&
              this.goodColors[2] === this.goodColors[j][2]
            ) {
              catchColor = true;
              break;
            }
          }

          if (!catchColor) {
            this.goodColors.push(color);
          }
        }
        resolve();
      };
      img.src = imgURL;
    });
  }

  someColor() {
    return this.goodColors[random(0, this.goodColors.length)];
  }
}
