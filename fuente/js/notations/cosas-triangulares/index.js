import { sizeFromPercentage, getPercent } from 'dddrawings';
import assets from './assets.js';

const porcentajes = {
  izq: 40,
  centro: 15,
  der: 45,
};

const margen = {
  arriba: 61,
  abajo: 42,
};

const dims = {};

const video = assets.video;
const izquierda = document.getElementById('left-col');
const centro = document.getElementById('middle-col');
const derecha = document.getElementById('right-col');
const loadingR = derecha.querySelector('.loading');
const loadingM = centro.querySelector('.loading');

let animReq;

izquierda.style.width = `${porcentajes.izq}%`;
centro.style.width = `${porcentajes.centro}%`;
derecha.style.width = `${porcentajes.der}%`;
centro.style.position = derecha.style.position = 'relative';

const lienzoCentro = document.createElement('canvas');
const ctxCentro = lienzoCentro.getContext('2d');
lienzoCentro.style.position = 'absolute';
lienzoCentro.style.opacity = '0';
lienzoCentro.width = sizeFromPercentage(porcentajes.centro, window.innerWidth);
lienzoCentro.height = window.innerHeight;
centro.appendChild(lienzoCentro);

const lienzoDerecha = document.createElement('canvas');
const ctxDerecha = lienzoDerecha.getContext('2d');
lienzoDerecha.style.position = 'absolute';
lienzoDerecha.style.opacity = '0';
lienzoDerecha.width = sizeFromPercentage(porcentajes.der, window.innerWidth);
lienzoDerecha.height = window.innerHeight;
derecha.appendChild(lienzoDerecha);

function cargarImagenes() {
  return new Promise((finalizar) => {
    function revisar() {
      assets.loaded++;
      if (assets.loaded === assets.length) {
        finalizar();
      }
    }

    video.onloadedmetadata = () => {
      revisar();
    };

    const imgCentro = new Image();
    imgCentro.onload = () => {
      assets.pequeña.img = imgCentro;
      assets.pequeña.ancho = imgCentro.naturalWidth;
      assets.pequeña.alto = imgCentro.naturalHeight;
      revisar();
    };
    imgCentro.src = assets.pequeña.url;

    const imgDerecha = new Image();
    imgDerecha.onload = () => {
      assets.grande.img = imgDerecha;
      assets.grande.ancho = imgDerecha.naturalWidth;
      assets.grande.alto = imgDerecha.naturalHeight;
      revisar();
    };
    imgDerecha.src = assets.grande.url;
  });
}

async function inicio() {
  await cargarImagenes();
  definirTamaños();
  lienzoCentro.style.opacity = 1;
  loadingM.style.opacity = 0;
  lienzoDerecha.style.opacity = 1;
  loadingR.style.opacity = 0;

  pintarImgs(0);
  pintarLineas(0);

  video.onplay = () => {
    animReq = requestAnimationFrame(animar);
  };
  video.onpause = () => window.cancelAnimationFrame(animReq);
  video.onseeking = () => actualizarReproductores();
  video.controls = true;
}

function definirTamaños() {
  lienzoCentro.width = sizeFromPercentage(porcentajes.centro, window.innerWidth);
  lienzoCentro.height = window.innerHeight;

  lienzoDerecha.width = sizeFromPercentage(porcentajes.der, window.innerWidth);
  lienzoDerecha.height = window.innerHeight;

  ctxCentro.strokeStyle = ctxDerecha.strokeStyle = 'red';

  if (assets.grande.img) {
    dims.grande = extraerDims(lienzoDerecha.width, assets.grande.ancho, assets.grande.alto);
  }

  if (assets.pequeña.img) {
    dims.pequeña = extraerDims(lienzoCentro.width, assets.pequeña.ancho, assets.pequeña.alto);
  }

  function extraerDims(lienzoAncho, imgAncho, imgAlto) {
    const porcentaje = getPercent(lienzoAncho, imgAncho);
    const alto = sizeFromPercentage(porcentaje, imgAlto) | 0;
    const porcentajeMargen = getPercent(alto, assets.grande.alto);
    const arriba = sizeFromPercentage(porcentajeMargen, margen.arriba);
    const abajo = sizeFromPercentage(porcentajeMargen, margen.abajo);
    const altoInterno = alto - arriba - abajo;

    return {
      ancho: lienzoAncho,
      alto: alto,
      paso: altoInterno / video.duration,
      arriba: arriba,
      abajo: abajo,
    };
  }
}

function pintarImgs(tiempo) {
  const y = lienzoDerecha.height / 2 - dims.grande.arriba - tiempo * dims.grande.paso;
  ctxCentro.drawImage(assets.pequeña.img, 0, 0, dims.pequeña.ancho, dims.pequeña.alto);
  ctxDerecha.drawImage(assets.grande.img, 0, y, dims.grande.ancho, dims.grande.alto);
}

function pintarLineas(tiempo) {
  const y1 = dims.pequeña.arriba + tiempo * dims.pequeña.paso;
  const y2 = lienzoDerecha.height / 2;
  ctxCentro.beginPath();
  ctxCentro.moveTo(0, y1);
  ctxCentro.lineTo(lienzoCentro.width, y1);
  ctxCentro.stroke();

  ctxDerecha.beginPath();
  ctxDerecha.moveTo(0, y2);
  ctxDerecha.lineTo(lienzoDerecha.width, y2);
  ctxDerecha.stroke();
}

function animar() {
  actualizarReproductores();
  animReq = requestAnimationFrame(animar);
}

function actualizarReproductores() {
  const tiempoVideo = video.currentTime;
  ctxCentro.clearRect(0, 0, lienzoCentro.width, lienzoCentro.height);
  ctxDerecha.clearRect(0, 0, lienzoDerecha.width, lienzoDerecha.height);
  pintarImgs(tiempoVideo);
  pintarLineas(tiempoVideo);
}

inicio();

window.onresize = () => {
  definirTamaños();
  actualizarReproductores();
};
