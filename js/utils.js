export const wrapLines = (arr, wrapType) => {
  arr.forEach((el) => {
    const wrapEl = document.createElement(wrapType);
    el.parentNode.appendChild(wrapEl);
    wrapEl.appendChild(el);
  });
};
