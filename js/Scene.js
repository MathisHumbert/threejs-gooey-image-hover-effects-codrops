import * as THREE from 'three';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import Tile from './Tile';

gsap.registerPlugin(ScrollTrigger);

export default class Scene {
  constructor(container) {
    this.container = container;
    [...this.tilesDom] = document.querySelectorAll('.slideshow__list__element');

    this.scroll = 0;

    this.start();
  }

  start() {
    // Scene
    this.scene = new THREE.Scene();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.scroll = 0;
    this.previousScroll = 0;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: true,
      alpha: true,
    });

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.tiles = this.tilesDom.map((el, i) => new Tile(el, this, i));

    this.initLights();
    this.initCamera();
    this.initScroll();
    this.initScrollAnimation();
    this.onScroll();
    this.onResize();
    this.update();
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight('0xffffff', 2);
    this.scene.add(ambientLight);
  }

  initCamera() {
    const perspective = 800;
    const fov = 2 * Math.atan(this.height / 2 / perspective) * (180 / Math.PI);

    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.width / this.height,
      1,
      1000
    );
    this.camera.position.z = perspective;
  }

  initScroll() {
    const lenis = new Lenis({
      // lerp: 0.05,
      // duration: 2,
    });

    this.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }

  initScrollAnimation() {
    const container = document.querySelector('.slideshow__container');
    const pageTile = document.querySelector('.page__title');
    const progressBar = document.querySelector('.slideshow__progress--bar');

    this.hozizontalScrollX = this.tilesDom.reduce((acc, curr) => {
      return acc + curr.offsetWidth;
    }, 0);

    const tl = gsap.timeline({
      scrollTrigger: { trigger: container, pin: true, scrub: true },
    });

    tl.to(container, {
      ease: 'none',
      x: () => -(this.hozizontalScrollX + this.width * 0.1),
    })
      .to(pageTile, { x: -100 }, 0)
      .to(progressBar, { x: 0 }, 0);
  }

  onResize() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.hozizontalScrollX = this.tilesDom.reduce((acc, curr) => {
        return acc + curr.offsetWidth;
      }, 0);

      for (const tile of this.tiles) {
        tile.onResize();
      }
    });
  }

  onScroll() {
    this.lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      this.scroll = e.scroll;

      for (const tile of this.tiles) {
        tile.onScroll({
          scroll: this.scroll,
          previousScroll: this.previousScroll,
        });
      }

      this.previousScroll = this.scroll;
    });
  }

  update() {
    this.renderer.render(this.scene, this.camera);

    for (const tile of this.tiles) {
      tile.update();
    }

    requestAnimationFrame(this.update.bind(this));
  }
}
