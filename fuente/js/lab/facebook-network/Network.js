import { select, event } from 'd3-selection';
import { drag } from 'd3-drag';
import { forceLink, forceManyBody, forceCenter, forceSimulation } from 'd3-force';
import { random } from 'dddrawings';

const d3 = { select, event, drag, forceLink, forceManyBody, forceCenter, forceSimulation };
export default class Network {
  constructor(data, wrapper, menu) {
    this.data = data;
    this.wrapper = wrapper;
    this.menu = menu;
  }

  init(w, h) {
    this.svg = d3.select(this.wrapper).append('svg').attr('width', w).attr('height', h);

    this.simulation = d3
      .forceSimulation()
      .force(
        'link',
        d3
          .forceLink()
          .id((d) => d.index)
          .distance(random(1, h, true))
          .strength(random(0.04, 0.1, true))
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(w / 2, h / 2));

    this.simulation.nodes(this.data.nodes);
    this.simulation.force('link').links(this.data.links);

    this.simulation.on('tick', () => {
      this.nodes.attr('transform', (d) => `translate(${[d.x, d.y]})`);
    });

    this.nodes = this.svg.selectAll('.group-node').data(this.data.nodes).enter().append('g');
    // this.appendNames();
    this[this.menu.current]();
  }

  reset() {
    this.simulation.stop();
    this.wrapper.innerHTML = '';
    this.svg = '';
    this.nodes = [];
    this.simulation = '';
    this.init(window.innerWidth, window.innerHeight);
  }

  drag = (node) => {
    node.x = d3.event.x;
    node.y = d3.event.y;
    this.simulation.alphaTarget(random(0, 1, true));
    this.simulation.restart();
  };

  /***** ATTACH NAMES *****/
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text
  // If you are interested in knowing how the names apper only when you hover a node,
  // take a look at the CSS and find the rules for .name and .node-group
  appendNames() {
    this.nodes
      .append('text')
      .attr('class', 'name')
      .attr('font-size', '11')
      .attr('dx', '-1em')
      .attr('dy', '-1em')
      .attr('fill', '#358a97')
      .text((d) => d.name);
  }
  /*--------------------------------------------------------------------
    We are going to draw SVG elements as our nodes.
    Below you will find a series of examples using basic SVG shapes.
    For reference of other SVG elements you can use,
    take a look at the "Graphic elements" section here:
    https://developer.mozilla.org/en-US/docs/Web/SVG/Element#Graphics_elements
    ----------------------------------------------------------------------*/
  /***** DRAW SVG CIRCLE *****/
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle
  circle() {
    this.nodes
      .append('circle') // (Required) This creates a <circle> SVG
      .attr('class', 'circle') // (Optional) this way we can apply styles on our CSS
      .attr('fill', '#d9eff1') // (Optional) the fill color, defaults to black.
      .attr('stroke', '#253c3e') // (Optional) the color of the line around the circles
      .attr('stroke-width', '1.5') // (Optional) Width of the stroke in pixels.
      .attr('r', (d) => d.weight / 3) // (Required) The radius of the circle in pixels.
      .call(d3.drag().on('drag', this.drag)); // (Optional) If you add this line, each node can be dragged with the mouse.
  }
  /***** DRAW SVG LINE *****/
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line
  line() {
    this.nodes
      .append('line') // (Required) This creates a <line> SVG
      .attr('class', 'line') // (Optional) this way we can apply styles on our CSS
      .attr('x1', '0') // (Required) Where in X coordinate the line should start drawing
      .attr('y1', '0') // (Required) Where in Y coordinate the line should start drawing
      .attr('x2', (d) => d.x) // (Required) Where in X coordinate the line should finish drawing
      .attr('y2', (d) => d.y) // (Required) Where in Y coordinate the line should finish drawing
      .attr('stroke', '#f9dd98') // (Optional) the color
      .attr('stroke-width', (d) => d.weight / 30) // (Optional) Width of the stroke in pixels.
      .attr('r', (d) => d.weight / 5) // (Required) The radius of the circle in pixels.
      .call(d3.drag().on('drag', this.drag)); // (Optional) If you add this line, each node can be dragged with the mouse.
  }
  /***** DRAW SVG POLYGON *****/
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path
  polygon() {
    this.nodes
      .append('path')
      .attr('d', (d) => `M ${d.weight / 5} ${d.weight * 2} L ${d.x / 4} ${d.y / 4} L ${d.x / 8} ${d.weight / 10} Z`)
      .attr('fill', 'rgba(255,205,85,0.7)')
      .attr('stroke', 'black')
      .attr('stroke-width', 3)
      .call(d3.drag().on('drag', this.drag));
  }
  /***** DRAW SVG RECTANGLES *****/
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect
  rect() {
    this.nodes
      .append('rect')
      .attr('x', '0')
      .attr('y', '0')
      .attr('width', (d) => d.weight / 5)
      .attr('height', (d) => d.weight / 2.5)
      .attr('fill', 'yellow')
      .call(d3.drag().on('drag', this.drag));
  }
  /***** EXTERNAL IMAGES *****/
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image
  heads() {
    this.nodes
      .append('image')
      .attr('class', 'image')
      .attr('xlink:href', '/img/sprites/head.png')
      .attr('height', (d) => d.weight / 2)
      .attr('width', '100')
      .call(d3.drag().on('drag', this.drag));
  }
}
