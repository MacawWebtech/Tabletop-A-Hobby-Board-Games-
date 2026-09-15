/*!
 * Lightweight scroll parallax for existing photography.
 * - Only ever sets a CSS transform (translate3d) on .ph-photo images
 *   inside .ph.has-photo containers — no layout, markup or content changes.
 * - Uses IntersectionObserver so only on-screen images are animated.
 * - Batches all reads/writes into a single requestAnimationFrame tick.
 * - Skips entirely on touch devices, small screens, and when the user
 *   has requested reduced motion (see prefers-reduced-motion below).
 * - The complementary "fixed background" parallax for the category
 *   tiles is handled purely in CSS (assets/css/style.css) and needs no JS.
 */
(function () {
  'use strict';

  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fineHoverQuery = window.matchMedia('(hover:hover) and (pointer:fine)');
  var wideQuery = window.matchMedia('(min-width:768px)');

  var PARALLAX_SPEED = 0.12; // fraction of scroll distance the photo drifts — subtle by design
  var MAX_SHIFT = 14; // px, kept well inside the CSS oversize buffer so no edge is ever revealed

  var items = [];
  var active = new Set();
  var observer = null;
  var ticking = false;
  var enabled = false;

  function clamp(value, min, max) {
    return value < min ? min : (value > max ? max : value);
  }

  function updateItem(img) {
    var container = img.parentElement;
    if (!container) return;
    var rect = container.getBoundingClientRect();
    var viewportH = window.innerHeight || document.documentElement.clientHeight;
    var distanceFromCenter = (rect.top + rect.height / 2) - (viewportH / 2);
    var shift = clamp(distanceFromCenter * -PARALLAX_SPEED, -MAX_SHIFT, MAX_SHIFT);
    img.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
  }

  function tick() {
    active.forEach(updateItem);
    ticking = false;
  }

  function requestTick() {
    if (!enabled || ticking) return;
    ticking = true;
    window.requestAnimationFrame(tick);
  }

  function resetAll() {
    items.forEach(function (img) { img.style.transform = ''; });
    active.clear();
  }

  function handleIntersect(entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        active.add(entry.target);
      } else {
        active.delete(entry.target);
        entry.target.style.transform = '';
      }
    });
    requestTick();
  }

  function enable() {
    if (enabled) return;
    enabled = true;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(handleIntersect, { rootMargin: '25% 0px' });
      items.forEach(function (img) { observer.observe(img); });
    } else {
      items.forEach(function (img) { active.add(img); });
    }
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
    requestTick();
  }

  function disable() {
    if (!enabled) return;
    enabled = false;
    if (observer) { observer.disconnect(); observer = null; }
    window.removeEventListener('scroll', requestTick);
    window.removeEventListener('resize', requestTick);
    resetAll();
  }

  function evaluate() {
    var shouldRun = wideQuery.matches && fineHoverQuery.matches && !reduceMotionQuery.matches;
    if (shouldRun) { enable(); } else { disable(); }
  }

  function init() {
    items = Array.prototype.slice.call(document.querySelectorAll('.ph.has-photo .ph-photo'));
    if (!items.length) return;
    evaluate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // React live if the user toggles OS-level reduced motion, resizes past
  // a breakpoint, or switches between touch and pointer input.
  [reduceMotionQuery, fineHoverQuery, wideQuery].forEach(function (mq) {
    if (mq.addEventListener) mq.addEventListener('change', evaluate);
    else if (mq.addListener) mq.addListener(evaluate); // legacy Safari
  });
})();
