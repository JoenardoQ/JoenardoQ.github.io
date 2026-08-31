// Accessible, deterministic particle motion for the two homepage title fragments.
(function () {
  'use strict';

  const selector = '.site-top-left, .site-top-right';
  const timers = new Map();
  const listeners = new Map();
  const canAnimate = () => (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches === false
    && window.matchMedia('(hover: hover)').matches
    && window.matchMedia('(pointer: fine)').matches
  );

  function clearElementTimers(element) {
    for (const timer of timers.get(element) || []) clearTimeout(timer);
    timers.delete(element);
  }

  function splitText(element) {
    if (element.dataset.motionReady === 'true') return;
    const text = element.textContent;
    element.textContent = '';
    element.setAttribute('aria-label', text);
    element.tabIndex = 0;
    Array.from(text).forEach((character, index) => {
      const particle = document.createElement('span');
      const angle = index * 2.3999632297 + (element.classList.contains('site-top-right') ? Math.PI : 0);
      const radius = 32 + (index % 5) * 8;
      particle.className = 'site-top-particle';
      particle.textContent = character === ' ' ? '\u00a0' : character;
      particle.setAttribute('aria-hidden', 'true');
      particle.style.setProperty('--particle-x', `${(Math.cos(angle) * radius).toFixed(2)}px`);
      particle.style.setProperty('--particle-y', `${(Math.sin(angle) * radius * 0.66 - 9).toFixed(2)}px`);
      particle.style.setProperty('--particle-rot', `${((index * 47) % 96) - 48}deg`);
      particle.style.setProperty('--particle-delay', `${Math.min(index * 14, 154)}ms`);
      element.appendChild(particle);
    });
    element.dataset.motionReady = 'true';
  }

  function play(element) {
    if (!canAnimate() || element.dataset.motionPlaying === 'true') return;
    clearElementTimers(element);
    element.dataset.motionPlaying = 'true';
    element.classList.remove('is-reassembling');
    void element.offsetWidth;
    element.classList.add('is-disintegrating');

    const reassemble = window.setTimeout(() => {
      element.classList.remove('is-disintegrating');
      element.classList.add('is-reassembling');
    }, 760);
    const finish = window.setTimeout(() => {
      element.classList.remove('is-reassembling');
      element.dataset.motionPlaying = 'false';
      timers.delete(element);
    }, 1480);
    timers.set(element, [reassemble, finish]);
  }

  function bind(element) {
    splitText(element);
    if (listeners.has(element)) return;
    const enter = () => play(element);
    const focus = event => {
      if (event.target === element) play(element);
    };
    element.addEventListener('mouseenter', enter);
    element.addEventListener('focusin', focus);
    listeners.set(element, { enter, focus });
  }

  function init() {
    document.querySelectorAll(selector).forEach(bind);
  }

  function destroy() {
    for (const [element, handlers] of listeners) {
      clearElementTimers(element);
      element.removeEventListener('mouseenter', handlers.enter);
      element.removeEventListener('focusin', handlers.focus);
      element.classList.remove('is-disintegrating', 'is-reassembling');
      element.dataset.motionPlaying = 'false';
    }
    listeners.clear();
  }

  window.JoenardoMotion = { init, destroy, canAnimate };
  document.addEventListener('DOMContentLoaded', init, { once: true });
  document.addEventListener('pjax:complete', init);
  if (window.btf && typeof window.btf.addGlobalFn === 'function') {
    window.btf.addGlobalFn('pjaxComplete', init);
  }
}());
