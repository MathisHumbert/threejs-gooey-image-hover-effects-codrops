import * as THREE from 'three';
import gsap from 'gsap';

import testShader from '../glsl/shader.glsl';
import vertex from '../glsl/vertex.glsl';

export default class Tile {
  constructor(el, scene, tileIndex, shader) {
    this.elDom = el;
    this.scene = scene.scene;
    this.tileIndex = tileIndex;
    this.shader = shader;

    this.domImage = this.elDom.querySelector('.tile__image');
    this.domLink = this.elDom.querySelector('a');
    this.loader = new THREE.TextureLoader();

    this.image = this.loader.load(this.domImage.dataset.src);
    this.hoverImage = this.loader.load(this.domImage.dataset.hover);
    this.shape = this.loader.load('shape.jpg');

    this.sizes = new THREE.Vector2(0, 0);
    this.offset = new THREE.Vector2(0, 0);
    this.mouse = new THREE.Vector2(0, 0);
    this.hover = 0;
    this.delta = 0;

    this.initTile();
    this.onMouseMove();
    this.onHover();
  }

  initTile() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        uImage: { value: this.image },
        uImageHover: { value: this.hoverImage },
        uMouse: { value: this.mouse },
        uTime: { value: 0 },
        uHover: { value: this.hover },
        uRes: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uShape: {
          value: this.shape,
        },
      },
      defines: {
        PR: window.devicePixelRatio.toFixed(1),
      },
      vertexShader: vertex,
      fragmentShader: this.shader,
      transparent: true,
    });

    // this.material = new THREE.MeshBasicMaterial({
    //   color: 'red',
    //   wireframe: true,
    // });

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.setTile();

    this.scene.add(this.mesh);
  }

  setPosition() {
    this.getSizes();

    this.mesh.position.x = this.offset.x;

    gsap.to(this.mesh.scale, {
      x: this.sizes.x - this.delta,
      y: this.sizes.y - this.delta,
      duration: 0.3,
    });
  }

  setTile() {
    this.getSizes();

    this.mesh.scale.set(this.sizes.x, this.sizes.y, 0);
    this.mesh.position.set(this.offset.x, this.offset.y, 1);
  }

  getSizes() {
    const { width, height, top, left } = this.domImage.getBoundingClientRect();

    this.sizes.set(width, height);
    this.offset.set(
      left - window.innerWidth / 2 + width / 2,
      -top + window.innerHeight / 2 - height / 2
    );
  }

  onScroll({ scroll, previousScroll }) {
    this.delta = Math.abs(scroll - previousScroll);

    this.setPosition();
  }

  onResize() {
    this.setTile();

    this.material.uniforms.uRes.value = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight
    );
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
      this.hover = 1;
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
      this.hover = 0;
      gsap.to(this.material.uniforms.uHover, { value: 0 });
    });
  }

  update() {
    // if (this.hover) {
    this.material.uniforms.uTime.value += 0.01;
    // }
  }
}
