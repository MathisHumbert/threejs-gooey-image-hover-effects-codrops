import * as THREE from 'three';
import gsap from 'gsap';

import vertex from '../glsl/vertex.glsl';
import fragment from '../glsl/fragment.glsl';

export default class Figure {
  constructor(scene) {
    this.domImage = document.querySelector('.tile__image');
    this.scene = scene;

    // Texture loader
    this.loader = new THREE.TextureLoader();

    this.image = this.loader.load(this.domImage.dataset.src);
    this.hoverImage = this.loader.load(this.domImage.dataset.hover);

    this.sizes = new THREE.Vector2(0, 0);
    this.offset = new THREE.Vector2(0, 0);
    this.mouse = new THREE.Vector2(0, 0);

    this.onMouseMove();
    this.getSizes();
    this.createMesh();
  }

  getSizes() {
    const { width, height, top, left } = this.domImage.getBoundingClientRect();

    this.sizes.set(width, height);
    this.offset.set(
      left - window.innerWidth / 2 + width / 2,
      -top + window.innerHeight / 2 - height / 2
    );
  }

  createMesh() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        uImage: { value: this.image },
        uImageHover: { value: this.hoverImage },
        uMouse: { value: this.mouse },
        uTime: { value: 0 },
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
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.scale.set(this.sizes.x, this.sizes.y, 0);
    this.mesh.position.set(this.offset.x, this.offset.y, 1);

    this.scene.add(this.mesh);
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

  update() {
    this.material.uniforms.uTime.value += 0.01;
  }
}
