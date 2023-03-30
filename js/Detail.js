import gsap from 'gsap';
import SplitType from 'split-type';

import { wrapLines } from './utils';
export default class Detail {
  constructor() {
    this.detailDom = document.querySelector('.detail');
    this.pageTitleDom = document.querySelector('.page__title');
    this.progressDom = document.querySelector('.slideshow__progress');
    this.textDom = document.querySelectorAll('.detail__text');
    this.buttonDom = document.querySelector('.close__detail');
    this.titleDom = document.querySelectorAll('.detail__title span span');

    this.splitText = [];

    for (const text of this.textDom) {
      const splitLine = new SplitType(text, {
        types: 'lines',
        tagName: 'span',
      });

      this.splitText.push(splitLine);

      wrapLines(splitLine.lines, 'span');
    }

    window.addEventListener('resize', () => {
      for (const line of this.splitText) {
        line.split();

        wrapLines(line.lines, 'span');
      }
    });
  }

  showDetail() {
    const tl = gsap.timeline();

    tl.to(this.progressDom, { opacity: 0, ease: 'power2.inOut' })
      .to(
        this.pageTitleDom,
        {
          opacity: 0,
          ease: 'power3.inOut',
          onComplete: () => {
            this.detailDom.classList.add('visible');
          },
        },
        1.5
      )
      .fromTo(
        this.buttonDom,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, ease: 'power3.inOut' }
      )
      .fromTo(
        '.line',
        { yPercent: 100 },
        { yPercent: 0, ease: 'power3.inOut', duration: 0.8, stagger: 0.05 },
        '<'
      )
      .fromTo(
        this.titleDom,
        { yPercent: 100 },
        { yPercent: 0, ease: 'power3.inOut', duration: 0.8, stagger: 0.05 },
        '<'
      );
  }

  hideDetail() {
    const tl = gsap.timeline();

    tl.to(this.pageTitleDom, {
      opacity: 0.1,
      ease: 'power3.inOut',
    })
      .to(this.buttonDom, { opacity: 0, scale: 0, ease: 'power3.inOut' }, 0)
      .to(
        this.titleDom,
        { yPercent: 1000, ease: 'power3.inOut', duration: 0.8, stagger: 0.05 },
        0
      )
      .to(
        '.line',
        { yPercent: 100, ease: 'power3.inOut', duration: 0.8, stagger: 0.05 },
        0
      )
      .to(this.progressDom, { opacity: 1, ease: 'power2.inOut' });
  }
}
