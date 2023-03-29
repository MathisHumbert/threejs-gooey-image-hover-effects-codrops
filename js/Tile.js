import * as THREE from 'three';
import gsap from 'gsap';

import testShader from '../glsl/shader.glsl';
import vertex from '../glsl/vertex.glsl';

export default class Tile {
  constructor(el, scene, tileIndex, shader) {
    this.domEl = el;
    this.domElTitle = el.querySelectorAll('.tile__title span span');
    this.domElCta = el.querySelectorAll('.tile__cta span span');

    this.detail = scene.detail;
    this.scene = scene.scene;
    this.lenis = scene.lenis;
    this.tilesDom = scene.tilesDom.filter((_, i) => tileIndex !== i);
    this.tilesMaterial = scene.tilesMaterial;
    this.tileIndex = tileIndex;
    this.shader = shader;

    this.domImage = this.domEl.querySelector('.tile__image');
    this.domLink = this.domEl.querySelector('a');
    this.loader = new THREE.TextureLoader();

    this.image = this.loader.load(this.domImage.dataset.src);
    this.hoverImage = this.loader.load(this.domImage.dataset.hover);
    this.shape = this.loader.load('shape.jpg');

    this.sizes = new THREE.Vector2(0, 0);
    this.offset = new THREE.Vector2(0, 0);
    this.mouse = new THREE.Vector2(0, 0);
    this.hover = 0;
    this.delta = 0;
    this.isZoomed = false;

    this.initTile();
    this.onMouseMove();
    this.onHover();
    this.onClick();
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
        uAlpha: {
          value: 1,
        },
        uZoomed: { value: 0 },
      },
      defines: {
        PR: window.devicePixelRatio.toFixed(1),
      },
      vertexShader: vertex,
      fragmentShader: this.shader,
      transparent: true,
    });

    this.tilesMaterial.push(this.material);

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

    if (this.isZoomed) {
      this.sizes.set(window.innerWidth * 0.44, window.innerHeight - 140);
      this.offset.set(
        window.innerWidth / 2 - window.innerWidth * 0.05 - width * 0.95,
        -20
      );
    } else {
      this.sizes.set(width, height);
      this.offset.set(
        left - window.innerWidth / 2 + width / 2,
        -top + window.innerHeight / 2 - height / 2
      );
    }
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

  onClick() {
    this.domLink.addEventListener('click', (e) => {
      e.preventDefault();

      if (this.isZoomed) {
        this.zoomOut();
      } else {
        this.zoomIn();
      }
    });
  }

  zoomIn() {
    const uAlphaMaterial = this.tilesMaterial
      .filter((_, i) => i !== this.tileIndex)
      .map((material) => material.uniforms.uAlpha);

    const tl = gsap.timeline({
      onStart: () => {
        this.lenis.stop();
        this.detail.hideDetail();
        this.isZoomed = true;
      },
      onComplete: () => {
        this.material.uniforms.uZoomed.value = 1;
      },
    });

    tl.to(this.tilesDom, { opacity: 0, ease: 'Power3.easeIn' }, 0)
      .to(uAlphaMaterial, { value: 0, ease: 'Power3.easeIn' }, 0)
      .to(
        [this.domElTitle, this.domElCta],
        {
          yPercent: 110,
          ease: 'Expo.easeInOut',
          duration: 1,
          stagger: 0.1,
        },
        0
      )
      .to(this.mesh.position, {
        x:
          window.innerWidth / 2 -
          window.innerWidth * 0.05 -
          this.sizes.x * 0.95,
        y: -20,
      })
      .to(
        this.mesh.scale,
        {
          x: window.innerWidth * 0.44,
          y: window.innerHeight - 140,
        },
        '<'
      );
  }

  zoomOut() {}

  update() {
    // if (this.hover) {
    this.material.uniforms.uTime.value += 0.01;
    // }
  }
}
