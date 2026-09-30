/* Tabletop — shared behaviour: theme, drawers, order list, search, forms. */
(function () {
  "use strict";
  var root = document.documentElement;
  var R = document.body.getAttribute("data-root") || "";
  var CAT = window.TT_CATALOG || [];
  var byId = {};
  CAT.forEach(function (p) { byId[p.id] = p; });
  var fmt = function (n) { return "₹" + n.toLocaleString("en-IN"); };
  window.TT = { fmt: fmt, byId: byId, root: R };

  /* ---------- Theme ---------- */
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".theme-toggle")) return;
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("tabletop-theme", next); } catch (err) {}
  });

  /* ---------- RTL / LTR direction ---------- */
  function setDir(d) {
    root.setAttribute("dir", d);
    document.querySelectorAll("[data-rtl-toggle]").forEach(function (b) { b.setAttribute("aria-pressed", d === "rtl" ? "true" : "false"); });
  }
  setDir(root.getAttribute("dir") === "rtl" ? "rtl" : "ltr");
  document.addEventListener("click", function (e) {
    if (!e.target.closest("[data-rtl-toggle]")) return;
    var next = root.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
    setDir(next);
    try { localStorage.setItem("tabletop-dir", next); } catch (err) {}
  });

  /* ---------- Drawers ---------- */
  var scrim = document.querySelector("[data-scrim]");
  var openDrawerEl = null, lastFocus = null;
  function openDrawer(name) {
    var d = document.querySelector('[data-drawer="' + name + '"]');
    if (!d) return;
    closeDrawer(true);
    lastFocus = document.activeElement;
    d.classList.add("is-open"); d.setAttribute("aria-hidden", "false");
    if (scrim) scrim.classList.add("is-open");
    document.body.classList.add("no-scroll");
    openDrawerEl = d;
    var mt = document.querySelector("[data-menu-open]");
    if (name === "menu" && mt) mt.setAttribute("aria-expanded", "true");
    var f = d.querySelector("[data-drawer-close]"); if (f) f.focus();
  }
  function closeDrawer(silent) {
    if (!openDrawerEl) return;
    openDrawerEl.classList.remove("is-open"); openDrawerEl.setAttribute("aria-hidden", "true");
    if (scrim) scrim.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    var mt = document.querySelector("[data-menu-open]"); if (mt) mt.setAttribute("aria-expanded", "false");
    openDrawerEl = null;
    if (!silent && lastFocus) lastFocus.focus();
  }
  window.TT.openDrawer = openDrawer;
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-menu-open]")) openDrawer("menu");
    else if (e.target.closest("[data-order-open]")) { hideToast(); openDrawer("order"); }
    else if (e.target.closest("[data-filters-open]")) openDrawer("filters");
    else if (e.target.closest("[data-drawer-close]") || e.target === scrim) closeDrawer();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeDrawer(); closeSearch(); }
  });

  /* ---------- Header state + back to top ---------- */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 10);
    if (toTop) toTop.classList.toggle("is-visible", y > 800);
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Order list (localStorage) ---------- */
  var KEY = "tabletop-order";
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} render(); document.dispatchEvent(new CustomEvent("tt:order")); }
  function add(id, qty) {
    var list = load(), line = list.find(function (l) { return l.id === id; });
    if (line) line.qty = Math.min(20, line.qty + qty); else list.push({ id: id, qty: qty });
    save(list);
  }
  function setQty(id, qty) {
    var list = load().map(function (l) { if (l.id === id) l.qty = qty; return l; }).filter(function (l) { return l.qty > 0; });
    save(list);
  }
  function totals() {
    var list = load().filter(function (l) { return byId[l.id]; });
    var count = 0, sub = 0;
    list.forEach(function (l) { count += l.qty; sub += l.qty * byId[l.id].price; });
    return { list: list, count: count, sub: sub };
  }
  window.TT.order = { load: load, save: save, add: add, setQty: setQty, totals: totals };

  function lineHTML(l) {
    var p = byId[l.id];
    return '<div class="order-line"><img src="' + R + 'assets/images/' + p.img + '" alt="">' +
      '<div><h3>' + p.name + '</h3><div class="qty"><button type="button" data-line-dec="' + p.id + '" aria-label="Decrease ' + p.name + '">−</button><span aria-label="Quantity">' + l.qty + '</span><button type="button" data-line-inc="' + p.id + '" aria-label="Increase ' + p.name + '">+</button></div> <button type="button" class="remove-line" data-line-remove="' + p.id + '">Remove</button></div>' +
      '<span class="price">' + fmt(p.price * l.qty) + '</span></div>';
  }
  window.TT.lineHTML = lineHTML;

  function render() {
    var t = totals();
    document.querySelectorAll("[data-order-count]").forEach(function (el) {
      el.textContent = t.count; el.setAttribute("data-empty", t.count ? "false" : "true");
    });
    var btn = document.querySelector("[data-order-open].icon-btn");
    if (btn) btn.setAttribute("aria-label", "Your order list, " + t.count + (t.count === 1 ? " item" : " items"));
    var lines = document.querySelector("[data-order-lines]");
    var foot = document.querySelector("[data-order-foot]");
    if (lines) {
      lines.innerHTML = t.list.length ? t.list.map(lineHTML).join("") :
        '<div class="empty-state"><i class="bi bi-bag" aria-hidden="true"></i><h3>Nothing here yet</h3><p class="muted">Add games from the shop, then place your order in one step.</p><a class="btn btn-primary mt-2" href="' + R + 'pages/shop.html">Shop games</a></div>';
    }
    if (foot) foot.hidden = !t.list.length;
    var st = document.querySelector("[data-order-subtotal]"); if (st) st.textContent = fmt(t.sub);
  }
  document.addEventListener("click", function (e) {
    var b;
    if ((b = e.target.closest("[data-line-inc]"))) { var l = load().find(function (x) { return x.id === b.dataset.lineInc; }); setQty(b.dataset.lineInc, Math.min(20, (l ? l.qty : 0) + 1)); }
    else if ((b = e.target.closest("[data-line-dec]"))) { var l2 = load().find(function (x) { return x.id === b.dataset.lineDec; }); setQty(b.dataset.lineDec, (l2 ? l2.qty : 1) - 1); }
    else if ((b = e.target.closest("[data-line-remove]"))) setQty(b.dataset.lineRemove, 0);
  });

  /* Add to order buttons */
  var toast = document.querySelector("[data-toast]"), toastTimer;
  function hideToast() { if (toast) toast.classList.remove("is-visible"); }
  function showToast(msg) {
    if (!toast) return;
    toast.querySelector("[data-toast-text]").textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer); toastTimer = setTimeout(hideToast, 4200);
  }
  window.TT.toast = showToast;
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]");
    if (!b) return;
    var id = b.dataset.add, qty = 1;
    if (b.hasAttribute("data-add-qty")) {
      var inp = document.querySelector("[data-qty-input]"); qty = Math.max(1, Math.min(20, parseInt(inp && inp.value, 10) || 1));
    }
    add(id, qty);
    var orig = b.innerHTML;
    b.classList.add("is-added"); b.innerHTML = '<i class="bi bi-check2" aria-hidden="true"></i>Added';
    setTimeout(function () { b.classList.remove("is-added"); b.innerHTML = orig; }, 1500);
    if (byId[id]) showToast(byId[id].name + " added to your order");
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-order-now]");
    if (!b) return;
    var inp = document.querySelector("[data-qty-input]");
    add(b.dataset.orderNow, Math.max(1, parseInt(inp && inp.value, 10) || 1));
    window.location.href = R + "pages/order.html";
  });
  render();
  window.addEventListener("storage", function (e) { if (e.key === KEY) render(); });

  /* ---------- Search modal ---------- */
  var modal = document.querySelector("[data-search-modal]");
  function openSearch() { if (!modal) return; lastFocus = document.activeElement; modal.classList.add("is-open"); var i = modal.querySelector("input"); if (i) i.focus(); }
  function closeSearch() { if (modal && modal.classList.contains("is-open")) { modal.classList.remove("is-open"); if (lastFocus) lastFocus.focus(); } }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-search-open]")) openSearch();
    else if (modal && e.target === modal) closeSearch();
  });
  if (modal) {
    var input = modal.querySelector("input"), out = modal.querySelector("[data-search-results]");
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      if (q.length < 2) { out.innerHTML = ""; return; }
      var hits = CAT.filter(function (p) { return (p.name + " " + p.mech + " " + (window.TT_CATS[p.cat] || "")).toLowerCase().indexOf(q) !== -1; }).slice(0, 5);
      out.innerHTML = hits.length ? hits.map(function (p) {
        return '<a href="' + R + 'pages/product-' + p.id + '.html"><img src="' + R + 'assets/images/' + p.img + '" alt=""><span><b>' + p.name + '</b><small>' + (window.TT_CATS[p.cat] || "") + ', ' + fmt(p.price) + '</small></span></a>';
      }).join("") : '<p class="muted">No matching games. Press Search to see everything, or <a class="text-link" href="' + R + 'pages/contact.html?topic=stock">ask us to find it</a>.</p>';
    });
  }

  /* ---------- Form validation ---------- */
  function validField(f) {
    var v = f.value.trim();
    if (f.required && !v) return false;
    if (!v) return true;
    if (f.type === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (f.type === "tel") return v.replace(/\D/g, "").length >= 10;
    if (f.name === "pincode") return /^\d{6}$/.test(v);
    return true;
  }
  function validateForm(form) {
    var ok = true, first = null;
    form.querySelectorAll("input, textarea, select").forEach(function (f) {
      var wrap = f.closest(".field"); if (!wrap || wrap.hidden) return;
      var good = validField(f);
      wrap.classList.toggle("is-invalid", !good);
      if (!good) { f.setAttribute("aria-invalid", "true"); if (!first) first = f; } else f.removeAttribute("aria-invalid");
      if (!good) ok = false;
    });
    if (first) first.focus();
    return ok;
  }
  window.TT.validateForm = validateForm;
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      var s = form.querySelector("[data-form-success]");
      form.querySelectorAll("input:not([type=checkbox]), textarea").forEach(function (f) { f.value = ""; });
      if (s) { s.hidden = false; s.focus(); }
    });
    form.addEventListener("input", function (e) {
      var wrap = e.target.closest(".field.is-invalid");
      if (wrap && validField(e.target)) { wrap.classList.remove("is-invalid"); e.target.removeAttribute("aria-invalid"); }
    });
  });

  /* ---------- Countdown (coming soon) ---------- */
  var cd = document.querySelector("[data-countdown]");
  if (cd) {
    var target = new Date(cd.getAttribute("data-countdown")).getTime();
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var tick = function () {
      var d = Math.max(0, target - Date.now());
      cd.querySelector("[data-cd-days]").textContent = pad(Math.floor(d / 864e5));
      cd.querySelector("[data-cd-hours]").textContent = pad(Math.floor(d % 864e5 / 36e5));
      cd.querySelector("[data-cd-minutes]").textContent = pad(Math.floor(d % 36e5 / 6e4));
    };
    tick(); setInterval(tick, 30000);
  }

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
