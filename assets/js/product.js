/* Product page: gallery thumbs, quantity stepper, tabs, pincode delivery estimate. */
(function () {
  "use strict";
  var main = document.querySelector("[data-gallery-main]");
  document.querySelectorAll("[data-thumb]").forEach(function (t) {
    t.addEventListener("click", function () {
      main.src = t.dataset.thumb;
      document.querySelectorAll("[data-thumb]").forEach(function (x) { x.setAttribute("aria-pressed", x === t ? "true" : "false"); });
    });
  });
  var inp = document.querySelector("[data-qty-input]");
  function clamp(v) { return Math.max(1, Math.min(20, v || 1)); }
  document.addEventListener("click", function (e) {
    if (!inp) return;
    if (e.target.closest("[data-qty-inc]")) inp.value = clamp(parseInt(inp.value, 10) + 1);
    if (e.target.closest("[data-qty-dec]")) inp.value = clamp(parseInt(inp.value, 10) - 1);
  });
  if (inp) inp.addEventListener("change", function () { inp.value = clamp(parseInt(inp.value, 10)); });

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function select(t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute("aria-selected", on ? "true" : "false"); x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
    });
    t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") select(tabs[(i + 1) % tabs.length]);
      if (e.key === "ArrowLeft") select(tabs[(i - 1 + tabs.length) % tabs.length]);
    });
  });

  var pin = document.querySelector("[data-pincode]");
  if (pin) pin.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = pin.querySelector("input").value.trim(), out = document.querySelector("[data-pin-result]");
    out.hidden = false;
    if (!/^\d{6}$/.test(v)) { out.textContent = "Enter a 6-digit pincode."; return; }
    var h = new Date().getHours();
    if (/^60[0-3]/.test(v)) out.textContent = h < 14 ? "Same-day delivery available. Order in the next " + (14 - h) + " hour(s) to get it by 9 pm today." : "Same-day delivery available. Order now for delivery tomorrow evening.";
    else out.textContent = "Courier delivery to " + v + " in 2–5 working days.";
  });
})();
