import FontFaceObserver from 'fontfaceobserver';
import imagesLoaded from 'imagesloaded';
import * as THREE from 'three';

import Scene from './Scene';

// Loading
const fontSourceSansPro = new Promise((resolve) => {
  new FontFaceObserver('source-sans-pro').load().then(() => {
    resolve();
  });
});

const fontOrpheusPro = new Promise((resolve) => {
  new FontFaceObserver('orpheuspro').load().then(() => {
    resolve();
  });
});

const preloadImages = new Promise((resolve) => {
  imagesLoaded(document.querySelectorAll('img'), { background: true }, resolve);
});

const textureLoader = new THREE.TextureLoader();

const loadedTextures = {};

const textureUrls = [
  '/tiles/woods/base.jpg',
  '/tiles/woods/hover.jpg',
  '/tiles/rocks/base.jpg',
  '/tiles/rocks/hover.jpg',
  '/tiles/cities/base.jpg',
  '/tiles/cities/hover.jpg',
  '/tiles/deserts/base.jpg',
  '/tiles/deserts/hover.jpg',
  '/tiles/snow/base.jpg',
  '/tiles/snow/hover.jpg',
  'shape.jpg',
];

const loadTextures = Promise.all(
  textureUrls.map(
    (url) =>
      new Promise((resolve) => {
        textureLoader.load(url, (texture) => {
          loadedTextures[url] = texture;
          resolve(texture);
        });
      })
  )
);

Promise.all([
  fontSourceSansPro,
  fontOrpheusPro,
  preloadImages,
  loadTextures,
]).then(() => {
  new Scene(document.getElementById('webgl'), loadedTextures);
  const body = document.querySelector('body');
  body.classList.remove('loading');
});
