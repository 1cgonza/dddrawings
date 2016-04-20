var fs        = require('fs');
var path      = require('path');
var chalk     = require('chalk');
var imgMagick = require('imagemagick-native');

var imagesManager = {
  paths: {
    notations: {
      src: path.resolve(__dirname, 'src/notations'),
      dest: path.resolve(__dirname, 'src/img/notations')
    },
    lab: {
      src: path.resolve(__dirname, 'src/lab'),
      dest: path.resolve(__dirname, 'src/img/lab')
    }
  },

  plugin: function(options) {
    return function(files, metalsmith, done) {
      setImmediate(done);

      init(options);
    };
  },

  process: init
};

module.exports = imagesManager;

function init(options) {
  options = options || {};
  var force = options.force || false;
  var log = options.log || false;

  for (var i in imagesManager.paths) {
    var src = imagesManager.paths[i].src;
    var dest = imagesManager.paths[i].dest;
    processImages(src, dest, force, log);
  }
}

var sizes = [
  {name: 'full'},
  {name: 'thumb', width: 550, height: 332},
  {name: 'large', width: 1200, height: 630}
];

function processImages(dir, imgFolder, force, log) {
  var list = fs.readdirSync(dir);
  var existingImages = [];

  if (!force) {
    existingImages = fs.readdirSync(imgFolder);
  }

  list.forEach(function(name) {
    var url = path.resolve(dir, name);
    var stat = fs.statSync(url);

    if (stat.isDirectory()) {
      if (name === 'img') {
        var imgsList = fs.readdirSync(url);

        if (log === 'verbose') {
          console.log(chalk.blue.bold('Processing images from:'));
          console.log(chalk.blue.underline.bold(url));
        }

        imgsList.forEach(function(file) {
          if (file.indexOf('.jpg') > 0 || file.indexOf('.jpeg') > 0 || file.indexOf('.png') > 0) {
            var imgPath = path.resolve(url, file);
            var srcData = fs.readFileSync(imgPath);

            var res = imgMagick.identify({srcData: srcData});

            if (res) {
              var imgInfo = path.parse(file);

              for (var i = 0; i < sizes.length; i++) {
                var size = sizes[i];
                var fileName;
                var quality = 80;

                if (size.name === 'full') {
                  fileName = imgInfo.name + '.jpg';
                  size.width = res.width;
                  size.height = res.height;
                  quality = 95;
                } else {
                  fileName = imgInfo.name + '-' + size.name + '.jpg';
                }

                if (existingImages.length > 0 && existingImages.indexOf(fileName) >= 0) {
                  if (log === 'verbose') {
                    console.log(chalk.red('Skipping File:', fileName));
                  }
                  continue;
                }

                var dest = path.resolve(imgFolder, fileName);

                if (log === 'new' || log === 'verbose') {
                  console.log(chalk.green('Saving file:', dest));
                }

                fs.writeFileSync(dest, imgMagick.convert({
                  srcData: srcData,
                  quality: quality,
                  width: size.width,
                  height: size.height,
                  format: 'JPEG'
                }));
              }
            }
          }

        });
      } else {
        processImages(url, imgFolder, force, log);
      }
    }
  });
}
