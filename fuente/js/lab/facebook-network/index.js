import Network from './Network.js';
import UI from './UI.js';
import { json } from 'dddrawings';

const menu = new UI();
const container = document.getElementById('ddd-container');
const wrapper = document.createElement('section');

container.appendChild(wrapper);

json('/data/facebook/friends.json')
  .then((data) => {
    data.nodes.forEach((d) => {
      d.weight = 0;
    });
    data.links.forEach((d) => {
      data.nodes[d.source].weight++;
    });

    const network = new Network(data, wrapper, menu);
    menu.init(network, container);
    network.init(window.innerWidth, window.innerHeight);
  })
  .catch((err) => {
    if (err) console.error(err);
  });
