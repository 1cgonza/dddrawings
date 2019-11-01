import fs from 'fs';
import { resolve, parse } from 'path';
import chalk from 'chalk';
import sharp from 'sharp';

export default class ImagesManager {
  constructor() {
    this.count = 0;
    this.total = 0;
    this.queue = [];
    this.paths = {
      notations: {
        src: resolve(__dirname, '../src/notations'),
        dest: resolve(__dirname, '../src/img/notations')
      },
      lab: {
        src: resolve(__dirname, '../src/lab'),
        dest: resolve(__dirname, '../src/img/lab')
      }
    };
    this.sizes = [
      { name: 'full' },
      { name: 'thumb', width: 550, height: 332 },
      { name: 'large', width: 1200, height: 630 }
    ];
    for (var collection in this.paths) {
      var folder = this.paths[collection].dest;
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
    }
  }
  plugin(options) {
    let self = this;
    return function(files, metalsmith, done) {
      self.process(options, done);
    };
  }
  process(options, callback) {
    this.callback = callback;
    this.log = options.log || false;
    this.queue = [];
    options = options || {};
    for (var i in this.paths) {
      var src = this.paths[i].src;
      var dest = this.paths[i].dest;
      if (options.force) {
        var files = fs.readdirSync(dest);
        files.forEach(function(file) {
          fs.unlinkSync(resolve(dest, file));
        });
      }
      this._run(src, dest);
    }
    this.total = this.queue.length * this.sizes.length;
    this.createFiles();
  }
  check() {
    this.count++;
    if (this.count === this.total) {
      console.log(chalk.blue('___________DONE PROCESSING IMAGES____________'));
      this.callback();
    }
  }
  createFiles() {
    var queue = this.queue;
    if (!queue.length) {
      // Leave if there is nothing to process.
      this.callback();
    } else {
      if (this.log === 'verbose') {
        console.log(chalk.blue('...:::Processing ' + chalk.red(queue.length) + ' new images:::...'));
      }
      for (var i = 0; i < queue.length; i++) {
        var imgPath = queue[i].path;
        let imgFolder = queue[i].dest;
        let imgBuffer = fs.readFileSync(imgPath);
        let imgInfo = parse(imgPath);
        let self = this;
        if (this.log === 'new' || this.log === 'verbose') {
          console.log(chalk.blue('Saving file:', chalk.yellow(imgPath)));
        }
        for (var j = 0; j < this.sizes.length; j++) {
          var size = this.sizes[j];
          let name = size.name == 'full' ? '' : '-' + size.name;
          sharp(imgBuffer)
            .resize(size.width, size.height)
            .toFile(resolve(imgFolder, imgInfo.name + name + imgInfo.ext))
            .then(function(info) {
              self.check();
            })
            .catch(function(err) {
              console.log(err);
              self.check();
            });
        }
      }
    }
  }
  _run(dir, imgFolder) {
    var list = fs.readdirSync(dir);
    var existingImages = fs.readdirSync(imgFolder);
    for (var i = 0; i < list.length; i++) {
      var name = list[i];
      var url = resolve(dir, name);
      var stat = fs.statSync(url);
      if (stat.isDirectory()) {
        if (name === 'img') {
          var imgsList = fs.readdirSync(url);
          for (var j = 0; j < imgsList.length; j++) {
            var file = imgsList[j];
            if (file.indexOf('.jpg') > 0 || file.indexOf('.jpeg') > 0 || file.indexOf('.png') > 0) {
              let imgPath = resolve(url, file);
              if (existingImages.length > 0 && existingImages.indexOf(file) >= 0) {
                if (this.log === 'verbose') {
                  console.log(chalk.red('Skipping File:', file));
                }
                continue;
              }
              this.queue.push({
                path: imgPath,
                dest: imgFolder
              });
            }
          }
        } else {
          this._run(url, imgFolder);
        }
      }
    }
  }
}
