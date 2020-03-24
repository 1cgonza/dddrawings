import { create as createSlider } from 'nouislider';

export default class Sliders {
  constructor(container, options, viz) {
    this.container = container;
    this.options = options;
    this.viz = viz;
  }

  initSliders() {
    this.magnitudeSlider();
    this.radiusSlider();
    this.opacitySlider();
    this.logScaleSlider();
    this.dividedBySlider();
  }

  createWrapper(id) {
    const slider = document.createElement('div');
    const val = document.createElement('span');
    val.className = 'sliderValues';
    slider.id = id;

    slider.appendChild(val);
    this.container.appendChild(slider);

    return {
      slider: slider,
      val: val
    };
  }

  magnitudeSlider() {
    const eles = this.createWrapper('sliderMagnitude');

    const magnitude = createSlider(eles.slider, {
      step: 0.1,
      start: [this.options.rangeStart, this.options.rangeEnd],
      range: {
        min: this.options.rangeStart,
        max: this.options.rangeEnd
      }
    });

    magnitude.on('update', values => {
      this.options.rangeStart = values[0];
      this.options.rangeEnd = values[1];
      eles.val.textContent = `${this.options.rangeStart} - ${this.options.rangeEnd} Ml`;
      this.viz.eqNodeChangeRange();
    });
  }

  radiusSlider() {
    const eles = this.createWrapper('sliderRadius');

    const radius = createSlider(eles.slider, {
      step: 1,
      start: this.options.radius,
      range: {
        min: 0,
        max: 300
      }
    });

    radius.on('update', values => {
      this.options.radius = +values[0];
      eles.val.textContent = `Radius: ${this.options.radius} px`;
      this.viz.svg.querySelectorAll('.eq').forEach(node => this.viz.eqNodeTransform(node));
      this.viz.svg.querySelectorAll('.ta').forEach(node => this.viz.taNodeTransform(node));
    });
  }

  opacitySlider() {
    const eles = this.createWrapper('sliderOpacity');

    const opacity = createSlider(eles.slider, {
      step: 0.1,
      start: this.options.opacity,
      range: {
        min: 0.1,
        max: 1
      }
    });

    opacity.on('update', values => {
      this.options.opacity = +values[0];
      eles.val.textContent = `Opacity: ${this.options.opacity}`;
      this.viz.svg.querySelectorAll('polygon').forEach(node => this.viz.nodeOpacity(node));
    });
  }

  logScaleSlider() {
    const eles = this.createWrapper('sliderPowOf');

    const powOf = createSlider(eles.slider, {
      orientation: 'vertical',
      direction: 'rtl',
      step: 1,
      start: this.options.powOf,
      range: {
        min: 1,
        max: 10
      }
    });

    powOf.on('update', values => {
      this.options.powOf = +values[0];
      eles.val.textContent = `Pow: ${this.options.powOf}`;
      this.viz.svg.querySelectorAll('.eq').forEach(node => this.viz.eqNodeDraw(node));
    });
  }

  dividedBySlider() {
    const eles = this.createWrapper('sliderDividedBy');

    const dividedBy = createSlider(eles.slider, {
      orientation: 'vertical',
      direction: 'rtl',
      step: 1,
      start: this.options.dividedBy,
      range: {
        min: 1,
        max: 10
      }
    });

    dividedBy.on('update', values => {
      this.options.dividedBy = +values[0];
      eles.val.textContent = `/ by: ${this.options.dividedBy}`;
      this.viz.svg.querySelectorAll('.eq').forEach(node => this.viz.eqNodeDraw(node));
    });
  }
}
