/**
 * Create a canvas element, set style values and append it to the container if defined
 * Use Cases:
 * 1. DEFAULT: DDD.canvas(container);
 *
 * 2. STAGING: DDD.canvas(null, {});
 * (useful for staging canvases, render things on the side for performance optimization)
 *
 * 3. FULL:
 * DDD.canvas(container, {
 *   w: width, h: height,
 *   position: 'cssPosition',
 *   top: #css_top, left: #css_eft,
 *   zi: #css_z-index
 *   font: '12px fontName'
 * });
 *
 * @param {Element}   container          Element where canvas should be appended.
 * @param {Object}    options            Styling data:
 * @param {Number}    options.w          Width of canvas.
 * @param {Number}    options.h          Height of Canvas.
 * @param {String}    options.position   CSS position.
 * @param {Number}    options.top        CSS top.
 * @param {Number}    options.left       CSS left.
 * @param {Number}    options.zi         CSS z-index
 */
function canvas2D(container, options) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  options = options || {};

  canvas.width          = options.w || window.innerWidth;
  canvas.height         = options.h || window.innerHeight;

  canvas.style.position = options.position || 'absolute';
  canvas.style.top      = options.top || 0;
  canvas.style.left     = options.left || 0;
  canvas.style.zIndex   = options.zi || 9;

  if (options.css) {
    for (var key in options.css) {
      canvas.style[key] = options.css[key];
    }
  }

  ctx.font = options.font || '12px Inconsolata';

  if (container) {
    container.appendChild(canvas);
  }

  return {
    container: container,
    canvas: canvas,
    w: canvas.width,
    h: canvas.height,
    ctx: ctx,
    center: {
      x: canvas.width / 2,
      y: canvas.height / 2
    }
  };
}

module.exports = canvas2D;
