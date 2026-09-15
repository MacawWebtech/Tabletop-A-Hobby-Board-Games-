/* ==========================================================================
   MAIN.JS — shared behaviour across every page:
   theme system, mobile off-canvas nav, sticky header state, scroll reveals,
   generic client-side form validation, wishlist/cart demo counters, and the
   coming-soon countdown (only runs if the markup for it exists on the page).
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------ Theme system --------------------------- */
  var THEME_KEY = "tabletop-theme";
  var root = document.documentElement;

  function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function storeTheme(value) {
    try { localStorage.setItem(THEME_KEY, value); } catch (e) { /* ignore */ }
  }
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    });
  }
  var initialTheme = getStoredTheme();
  if (!initialTheme) {
    initialTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  applyTheme(initialTheme);

  document.addEventListener("click", function (e) {
    var toggle = e.target.closest(".theme-toggle");
    if (!toggle) return;
    var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    var next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    storeTheme(next);
  });

  /* ------------------------------ Mobile nav ------------------------------ */
  var menu = document.querySelector(".mobile-menu");
  var scrim = document.querySelector(".menu-scrim");
  var body = document.body;
  var lastFocused = null;

  function openMenu() {
    if (!menu) return;
    lastFocused = document.activeElement;
    menu.classList.add("is-open");
    if (scrim) scrim.classList.add("is-open");
    body.classList.add("menu-open");
    menu.setAttribute("aria-hidden", "false");
    var closeBtn = menu.querySelector(".mobile-menu-close");
    if (closeBtn) closeBtn.focus();
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("is-open");
    if (scrim) scrim.classList.remove("is-open");
    body.classList.remove("menu-open");
    menu.setAttribute("aria-hidden", "true");
    if (lastFocused) lastFocused.focus();
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-menu-open]")) openMenu();
    if (e.target.closest("[data-menu-close]")) closeMenu();
    if (scrim && e.target === scrim) closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu && menu.classList.contains("is-open")) closeMenu();
  });

  /* ---------------------------- Sticky header state ----------------------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* -------------------------------- Back to top ---------------------------- */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("is-visible", window.scrollY > 700);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* -------------------------------- Reveal on scroll ------------------------ */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* -------------------------------- Wishlist demo ---------------------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".wishlist-btn");
    if (!btn) return;
    btn.classList.toggle("active");
    var pressed = btn.classList.contains("active");
    btn.setAttribute("aria-pressed", pressed ? "true" : "false");
  });

  /* --------------------------------- Cart demo ------------------------------- */
  var cartCountEls = document.querySelectorAll(".cart-count");
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add-to-cart]");
    if (!btn) return;
    cartCountEls.forEach(function (el) {
      var current = parseInt(el.textContent, 10) || 0;
      el.textContent = String(current + 1);
    });
    var original = btn.innerHTML;
    btn.classList.add("added");
    btn.innerHTML = '<i class="bi bi-check2" aria-hidden="true"></i> Added';
    window.setTimeout(function () {
      btn.innerHTML = original;
      btn.classList.remove("added");
    }, 1400);
  });

  /* ------------------------------ Generic form validation ---------------------- */
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    form.setAttribute("novalidate", "novalidate");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        var wrap = field.closest(".was-validated-field") || field.parentElement;
        var fieldValid = field.checkValidity();
        if (field.type === "email" && field.value.trim()) {
          fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        }
        if (field.type === "tel" && field.value.trim()) {
          fieldValid = /^[0-9+\-\s()]{7,}$/.test(field.value.trim());
        }
        wrap.classList.toggle("is-invalid", !fieldValid);
        if (!fieldValid) valid = false;
      });
      var successEl = form.querySelector("[data-form-success]");
      if (valid) {
        form.reset();
        form.querySelectorAll(".is-invalid").forEach(function (el) { el.classList.remove("is-invalid"); });
        if (successEl) {
          successEl.hidden = false;
          successEl.focus();
          window.setTimeout(function () { successEl.hidden = true; }, 6000);
        }
      } else {
        var firstInvalid = form.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea");
        if (firstInvalid) firstInvalid.focus();
      }
    });
  });

  /* --------------------------------- Countdown -------------------------------- */
  var countdown = document.querySelector("[data-countdown]");
  if (countdown) {
    var target = new Date(countdown.getAttribute("data-countdown"));
    var dEl = countdown.querySelector("[data-cd-days]");
    var hEl = countdown.querySelector("[data-cd-hours]");
    var mEl = countdown.querySelector("[data-cd-minutes]");
    var sEl = countdown.querySelector("[data-cd-seconds]");
    function pad(n) { return String(n).padStart(2, "0"); }
    function tick() {
      var diff = Math.max(0, target.getTime() - Date.now());
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var minutes = Math.floor((diff % 3600000) / 60000);
      var seconds = Math.floor((diff % 60000) / 1000);
      if (dEl) dEl.textContent = pad(days);
      if (hEl) hEl.textContent = pad(hours);
      if (mEl) mEl.textContent = pad(minutes);
      if (sEl) sEl.textContent = pad(seconds);
    }
    tick();
    window.setInterval(tick, 1000);
  }

  /* ------------------------------ Generic chip groups --------------------------- */
  /* Single-select chip rows outside the full recommendations wizard (e.g. the
     homepage "Find Your Perfect Game" teaser). Groups share a data-chip-group name. */
  document.addEventListener("click", function (e) {
    var chip = e.target.closest("[data-chip-group]");
    if (!chip) return;
    var group = chip.dataset.chipGroup;
    document.querySelectorAll('[data-chip-group="' + group + '"]').forEach(function (c) {
      c.setAttribute("aria-pressed", "false");
    });
    chip.setAttribute("aria-pressed", "true");
  });

  var homeFinderBtn = document.querySelector("[data-home-finder-submit]");
  if (homeFinderBtn) {
    homeFinderBtn.addEventListener("click", function () {
      var target = homeFinderBtn.getAttribute("href") || "pages/recommendations.html";
      window.location.href = target;
    });
  }

  /* --------------------------------- Year stamp -------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
