import * as THREE from 'three';

import Figure from './Figure';

export default class Scene {
  constructor() {
    this.container = document.getElementById('stage');

    // Scene
    this.scene = new THREE.Scene();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: true,
      alpha: true,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Figure
    this.figure = new Figure(this.scene);

    this.initLights();
    this.initCamera();
    // this.addObject();
    this.update();
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight('0xffffff', 2);
    this.scene.add(ambientLight);
  }

  initCamera() {
    const perspective = 800;
    const fov =
      2 * Math.atan(window.innerHeight / 2 / perspective) * (180 / Math.PI);

    this.camera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.z = perspective;
  }

  addObject() {
    const material = new THREE.MeshBasicMaterial({
      color: 'red',
      wireframe: true,
    });
    const geometry = new THREE.PlaneGeometry(200, 200, 10, 10);
    const mesh = new THREE.Mesh(geometry, material);

    this.scene.add(mesh);
  }

  update() {
    this.renderer.render(this.scene, this.camera);

    this.figure.update();

    requestAnimationFrame(this.update.bind(this));
  }
}
