import gsap from 'gsap';
export default class Detail {
  constructor() {
    this.pageTitleDom = document.querySelector('.page__title');
    this.progressDom = document.querySelector('.slideshow__progress');
    // split text
  }

  showDetail() {}

  hideDetail() {
    const tl = gsap.timeline();
    tl.to(this.progressDom, { opacity: 0, ease: 'Power3.easeIn' }).to(
      this.pageTitleDom,
      { opacity: 0, ease: 'Power3.easeIn' },
      1.5
    );
    console.log('hide');
  }
}
