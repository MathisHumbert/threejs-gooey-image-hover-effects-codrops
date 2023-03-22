import * as THREE from 'three';
import gsap from 'gsap';

import vertex from '../glsl/vertex.glsl';
import fragment from '../glsl/fragment.glsl';

export default class Tile {
  constructor(el, scene, tileIndex) {
    this.elDom = el;
    this.scene = scene.scene;
    this.tileIndex = tileIndex;

    this.domImage = this.elDom.querySelector('.tile__image');
    this.domLink = this.elDom.querySelector('a');
    this.loader = new THREE.TextureLoader();

    this.image = this.loader.load(this.domImage.dataset.src);
    this.hoverImage = this.loader.load(this.domImage.dataset.hover);

    this.sizes = new THREE.Vector2(0, 0);
    this.offset = new THREE.Vector2(0, 0);
    this.mouse = new THREE.Vector2(0, 0);
    this.hover = 0;
    this.scroll = 0;

    this.initTile();
    this.onMouseMove();
    this.onHover();
  }

  getSizes() {
    const { width, height, top, left } = this.domImage.getBoundingClientRect();

    this.sizes.set(width, height);
    this.offset.set(
      left - window.innerWidth / 2 + width / 2,
      -top + window.innerHeight / 2 - height / 2
    );
  }

  initTile() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        uImage: { value: this.image },
        uImageHover: { value: this.hoverImage },
        uMouse: { value: this.mouse },
        uTime: { value: 0 },
        uHover: { value: 0 },
        uRes: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
      defines: {
        PR: window.devicePixelRatio.toFixed(1),
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    // this.material = new THREE.MeshBasicMaterial({
    //   color: 'red',
    //   wireframe: true,
    // });

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.setPosition();
  }

  setPosition() {
    this.getSizes();

    this.mesh.scale.set(this.sizes.x, this.sizes.y, 0);
    this.mesh.position.set(this.offset.x, this.offset.y, 1);

    this.scene.add(this.mesh);
  }

  onScroll() {
    this.setPosition();
  }

  onResize() {
    this.setPosition();
  }

  onMouseMove() {
    window.addEventListener('mousemove', (e) => {
      gsap.to(this.mouse, {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
        duration: 1,
      });
    });
  }

  onHover() {
    this.domLink.addEventListener('mouseenter', () => {
      document.documentElement.style.setProperty(
        '--color-bg',
        `var(--color-bg${this.tileIndex + 1})`
      );
      document.documentElement.style.setProperty(
        '--color-text',
        `var(--color-text${this.tileIndex + 1})`
      );

      gsap.to(this.material.uniforms.uHover, { value: 1 });
    });

    this.domLink.addEventListener('mouseleave', () => {
      gsap.to(this.material.uniforms.uHover, { value: 0 });
    });
  }

  update(scroll) {
    // Update scroll
    this.scroll = scroll;

    // this.material.uniforms.uTime.value += 0.01;
  }
}
