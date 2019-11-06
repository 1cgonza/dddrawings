import { random } from 'dddrawings';
import * as d3 from 'd3';

var container = document.getElementById('ddd-container');
var wrapper = document.createElement('section');
var w = window.innerWidth;
var h = window.innerHeight;
var network;
var options = ['circle', 'line', 'polygon', 'rect', 'heads', 'randomize'];
var current = options[random(0, options.length - 1)];
current = 'circle';

container.appendChild(wrapper);

createMenu();
d3.json('/data/facebook/friends.json')
  .then(data => {
    data.nodes.forEach(d => {
      d.weight = 0;
    });
    data.links.forEach(d => {
      data.nodes[d.source].weight++;
    });
    console.log(data);
    network = new FN(data);
    network.init(current);
  })
  .catch(err => {
    if (err) {
      console.error(err);
    }
  });

function createMenu() {
  var nav = document.createElement('ul');
  nav.className = 'network-options';

  options.forEach(function(ele, i) {
    var li = document.createElement('li');
    li.innerHTML = ele;

    if (ele === 'randomize') {
      li.className = 'randomizer';
      li.onclick = function() {
        network.reset(current);
        return false;
      };
    } else {
      optionsClickEvent(li, ele);
    }

    if (ele === current) {
      li.className = 'current';
      current = ele;
    }

    nav.appendChild(li);
  });

  container.appendChild(nav);
}

function optionsClickEvent(li, type) {
  li.onclick = function(event) {
    var menu = document.querySelector('.network-options');
    var currentOption = menu.querySelector('.current');

    currentOption.classList.remove('current');
    event.target.classList.add('current');
    current = type;
    network.reset();

    return false;
  };
}

class FN {
  constructor(data) {
    this.data = data;
  }

  init() {
    this.svg = d3
      .select(wrapper)
      .append('svg')
      .attr('width', w)
      .attr('height', h);

    this.simulation = d3
      .forceSimulation()
      .force(
        'link',
        d3
          .forceLink()
          .id(d => d.index)
          .strength(random(0.04, 0.1, true))
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(w / 2, h / 2));

    this.simulation.nodes(this.data.nodes);
    console.log(this.data.nodes);
    this.simulation.force('link').links(this.data.links);

    this.nodes = this.svg
      .selectAll('.group-node')
      .data(this.data.nodes)
      .enter()
      .append('g');

    // .links(this.data.links);
    // this.force = d3.layout
    //   .force()
    //   .nodes(this.data.nodes)
    //   .links(this.data.links)
    //   .size([w, h]);

    // this.randomize();
    // At this point d3 has created a new data set and if you want to see the variables available to you, uncomment the next line and check the console in your browser.
    // console.log(d3.selectAll('.group-node').data());

    this[current]();
    this.tick();
  }

  reset() {
    this.force.stop();
    wrapper.innerHTML = '';
    delete this.svg;
    delete this.nodes;
    delete this.force;
    this.init();
  }

  randomize() {
    this.force
      .linkStrength(random(0.04, 0.1, true))
      .gravity(random(0.1, 5, true))
      .linkDistance(random(1, 2000, true))
      .charge(random(-100, -30))
      .start();
  }

  tick() {
    this.simulation.on(
      'tick',
      function() {
        this.nodes.attr('transform', function(d) {
          return 'translate(' + [d.x, d.y] + ')';
        });
      }.bind(this)
    );
  }
  /***** ATTACH NAMES *****/
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text
  // If you are interested in knowing how the names apper only when you hover a node,
  // take a look at the CSS and find the rules for .name and .node-group
  appendNames() {
    this.nodes
      .append('text')
      .attr('class', 'name')
      .attr('font-size', '21')
      .attr('dx', '-1em')
      .attr('dy', '-1em')
      .attr('fill', '#358a97')
      .text(function(d) {
        return d.name;
      });
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
      .attr('r', d => {
        // (Required) The radius of the circle in pixels.
        return d.weight / 5;
      })
      .call(d3.drag()); // (Optional) If you add this line, each node can be dragged with the mouse.
  }
  /***** DRAW SVG LINE *****/
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line
  line() {
    this.nodes
      .append('line') // (Required) This creates a <line> SVG
      .attr('class', 'line') // (Optional) this way we can apply styles on our CSS
      .attr('x1', '0') // (Required) Where in X coordinate the line should start drawing
      .attr('y1', '0') // (Required) Where in Y coordinate the line should start drawing
      .attr('x2', function(d) {
        // (Required) Where in X coordinate the line should finish drawing
        return d.x;
      })
      .attr('y2', function(d) {
        // (Required) Where in Y coordinate the line should finish drawing
        return d.y;
      })
      .attr('stroke', '#f9dd98') // (Optional) the color
      .attr('stroke-width', function(d) {
        // (Optional) Width of the stroke in pixels.
        return d.weight / 30;
      })
      .attr('r', function(d) {
        // (Required) The radius of the circle in pixels.
        return d.weight / 5;
      })
      .call(this.force.drag); // (Optional) If you add this line, each node can be dragged with the mouse.
  }
  /***** DRAW SVG POLYGON *****/
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path
  polygon() {
    this.nodes
      .append('path')
      .attr('d', function(d) {
        return (
          'M ' +
          d.weight / 5 +
          ' ' +
          d.weight * 2 +
          ' L ' +
          d.x / 4 +
          ' ' +
          d.y / 4 +
          ' L ' +
          d.x / 8 +
          ' ' +
          d.weight / 10 +
          ' Z'
        );
      })
      .attr('fill', 'rgba(255,205,85,0.7)')
      .attr('stroke', 'black')
      .attr('stroke-width', 3)
      .call(this.force.drag);
  }
  /***** DRAW SVG RECTANGLES *****/
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect
  rect() {
    this.nodes
      .append('rect')
      .attr('x', '0')
      .attr('y', '0')
      .attr('width', function(d) {
        return d.weight / 10;
      })
      .attr('height', function(d) {
        return d.weight / 5;
      })
      .attr('fill', 'yellow')
      .call(this.force.drag);
  }
  /***** EXTERNAL IMAGES *****/
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image
  heads() {
    this.nodes
      .append('image')
      .attr('class', 'image')
      .attr('xlink:href', '/img/assets/sprites/head.png')
      .attr('height', function(d) {
        return d.weight / 2;
      })
      .attr('width', '100')
      .call(this.force.drag);
  }
}
