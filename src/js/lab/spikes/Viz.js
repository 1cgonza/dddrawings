export default class Viz {
  constructor(container, options) {
    this.options = options;
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.info = document.createElement('div');
    this.info.id = 'info';
    this.svg.setAttribute('class', 'eqta');
    this.svg.setAttribute('width', options.stageW);
    this.svg.setAttribute('height', options.stageH);
    container.appendChild(this.svg);
    container.appendChild(this.info);
  }

  render() {
    this.eqRender();
    this.taRender();
  }

  eqRender() {
    this.options.eqData.forEach((d) => {
      const poly = document.createElementNS(this.svg.namespaceURI, 'polygon');
      poly.setAttribute('class', 'eq');
      poly.dataset.val = d.ml || 0;
      poly.dataset.date = d.date.unix;
      this.eqNodeDraw(poly);
      this.eqNodeColor(poly);
      this.nodeOpacity(poly);
      this.eqNodeTransform(poly);
      this.svg.appendChild(poly);
    });
  }

  taRender() {
    const op = this.options;
    op.taData.forEach((d) => {
      const poly = document.createElementNS(this.svg.namespaceURI, 'polygon');
      const impact = op.taSize + Number(d.fatal * 5) + Number(d.injured);
      poly.setAttribute('class', 'ta');
      poly.dataset.date = d.date.unix;
      //render all spikes with same width and position. The height is dynamic
      const points = `0,0 ${op.nodeWidth},0 ${op.nodeWidth / 2},${-impact}`;
      poly.setAttribute('points', points);
      poly.setAttribute('fill', op.taColor);
      poly.style.opacity = op.opacity;

      this.svg.appendChild(poly);
      this.taNodeTransform(poly);
      this.taNodeMouseEvents(poly, d);
    });
  }

  taNodeTransform(node) {
    const op = this.options;
    const date = +node.dataset.date;
    const dReset = date - Date.parse(op.year) * 0.001;
    const rot = dReset * op.secondsW;

    //Now that the spikes are rendered, first translate all together, then rotate using 3 param: degrees, x axis and y. The y amount gives us the radius of the circle.
    let t = `translate(${op.center.x - op.center.node},${op.center.y - op.radius}) `;
    t += `rotate(${rot},${op.center.node},${op.radius})`;

    node.setAttribute('transform', t);
  }

  eqNodeDraw(poly) {
    const ml = poly.dataset.val;
    const mag = Math.pow(this.options.powOf, ml) / this.options.dividedBy;
    const points = `0,0 ${this.options.nodeWidth},0 ${this.options.nodeWidth / 2},${-mag}`;
    poly.setAttribute('points', points);
  }

  eqNodeChangeRange() {
    this.svg.querySelectorAll('.eq').forEach((node) => {
      const ml = +node.dataset.val;

      if (!(ml >= this.options.rangeStart && ml <= this.options.rangeEnd)) {
        node.style.opacity = 0;
      } else {
        node.style.opacity = this.options.opacity;
      }
    });
  }

  eqNodeColor(poly) {
    const ml = poly.dataset.val;
    const fill = ml < 6 ? this.options.lowMagnitude : this.options.highMagnitude;
    poly.setAttribute('fill', fill);
  }

  nodeOpacity(poly) {
    poly.style.opacity = this.options.opacity;
  }

  eqNodeTransform(poly) {
    const op = this.options;
    const date = +poly.dataset.date;
    const dReset = date - Date.parse(op.year) * 0.001;
    const rot = dReset * op.secondsW;
    //Now that the eqNode are rendered, first translate all together, then rotate using 3 param: degrees, x axis and y. The y amount gives us the radius of the circle.
    let t = `translate(${op.center.x - op.center.node},${op.center.y - op.radius}) `;
    t += `rotate(${rot},${op.center.node},${op.radius})`;
    poly.setAttribute('transform', t);
  }

  taNodeMouseEvents(node, d) {
    node.onmouseenter = () => {
      node.style.opacity = 1;

      if (d.date !== '') this.createInfoElement('Fecha', d.date.human);
      if (d.by !== '') this.createInfoElement('Quien', d.by);
      if (d.dep !== '') this.createInfoElement('Departamento', d.dep);
      if (d.mun !== '') this.createInfoElement('Municipio', d.mun);
      if (d.place !== '') this.createInfoElement('Lugar', d.place);
      if (d.fatal !== null) this.createInfoElement('Victimas Fatales', d.fatal);
      if (d.injured !== null) this.createInfoElement('Heridos', d.injured);
      if (d.source !== '') this.createInfoElement('Fuente', d.source);
    };

    node.onmouseleave = () => {
      node.style.opacity = this.options.opacity;
      this.info.innerText = '';
    };
  }

  createInfoElement(title, d) {
    const p = document.createElement('p');
    p.innerText = `${title}: ${d}`;
    this.info.appendChild(p);
  }
}
