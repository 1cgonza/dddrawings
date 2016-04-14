(function() {
  'use strict';
  var container = document.getElementById('ddd-container');
  var stageW = window.innerWidth;
  var stageH = window.innerHeight;
  var tick = 0;
  var reduce = 5;
  var reduceW = stageW / reduce;
  var reduceH = stageH / reduce;
  var maggots = [];
  var centerX = stageW / 2;
  var centerY = stageH / 2;
  var maxW = centerX + reduceW;
  var minW = centerX - reduceW;
  var maxH = centerY + reduceH;
  var minH = centerY - reduceH;

  var webgl = new DDD.Webgl(container, stageW, stageH);

  var imgData = {
    url: '/img/sprites/bird2.png',
    w: 352,
    h: 32,
    fw: 44,
    fh: 50,
    total: 14,
    frames: [],
    cb: imgReady
  };

  for (var i = 0; i < imgData.total; i++) {
    imgData.frames.push({
      x: i * imgData.fw,
      y: 0,
      w: imgData.fw,
      h: imgData.fh
    });
  };

  // create the root of the scene graph
  var totalSprites = 1500;
  var stage = new DDD.Stage(imgData, webgl, totalSprites, {
    scale: true,
    position: true,
    rotation: true,
    uvs: true,
    alpha: true
  });

  function imgReady() {
    for (var i = 0; i < totalSprites; i++) {
      var startFrame = Math.floor(Math.random() * (11 - 0));

      var dude = stage.particle({
        anchor: new DDD.Point(0.5),
        scale: new DDD.Point(1, 1),
        alpha: 1,
        frame: startFrame || 0
      });
      // set the anchor point so the texture is centerd on the sprite
      dude.anchor.set(0.5);
      // different maggots, different sizes
      dude.scale.set(0.8 + Math.random() * 0.3);

      // scatter them all
      // Math.random() * (max - min) + min;
      dude.x = Math.random() * (maxW - minW) + minW;
      dude.y = Math.random() * (maxH - minH) + minH;

      // create a random direction in radians
      dude.direction = Math.random() * Math.PI * 2;

      // this number will be used to modify the direction of the sprite over time
      dude.turningSpeed = Math.random() - 0.8;

      // create a random speed between 0 - 2, and these maggots are slooww
      dude.speed = (2 + Math.random() * 2) * 0.2;

      dude.offset = Math.random() * 100;
    }

    requestAnimationFrame(animate);
  }

  // create a bounding box box for the little maggots
  var dudeBoundsPadding = 100;
  var dudeBounds = new DDD.Rectangle(-dudeBoundsPadding,
                                      -dudeBoundsPadding,
                                      webgl.width + dudeBoundsPadding * 2,
                                      webgl.height + dudeBoundsPadding * 2);
  var s = 4;
  var t = 0;
  function animate() {
    if (t >= s) {
      for (var i = 0; i < stage.children.length; i++) {
        var dude = stage.children[i];
        dude.scale.y = 0.95 + Math.sin(tick + dude.offset) * 0.05;
        dude.direction += dude.turningSpeed * 0.01;
        dude.x += Math.sin(dude.direction) * (dude.speed * dude.scale.y);
        dude.y += Math.cos(dude.direction) * (dude.speed * dude.scale.y);
        dude.rotation = -dude.direction + Math.PI;

        // wrap the maggots
        if (dude.x < dudeBounds.x) {
          dude.x += dudeBounds.width;
        } else if (dude.x > dudeBounds.x + dudeBounds.width) {
          dude.x -= dudeBounds.width;
        }

        if (dude.y < dudeBounds.y) {
          dude.y += dudeBounds.height;
        } else if (dude.y > dudeBounds.y + dudeBounds.height) {
          dude.y -= dudeBounds.height;
        }

        if (dude.frame === 11) {
          dude.frame = 0;
        } else {
          dude.frame++;
        }
        t = 0;
      }
    }
    t++;
    tick += 0.1;
    webgl.render(stage);
    requestAnimationFrame(animate);
  }


})();
