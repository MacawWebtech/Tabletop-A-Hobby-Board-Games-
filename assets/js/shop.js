/* Shop: category pills, filter chips, search and sort, all client-side on data attributes. */
(function () {
  "use strict";
  var grid = document.querySelector("[data-product-grid]");
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-product]"));
  var state = { cat: "all", players: "all", time: "all", age: "all", weight: "all", price: "all", q: "", sort: "featured" };
  var params = new URLSearchParams(location.search);
  if (params.get("category")) state.cat = params.get("category");
  if (params.get("q")) state.q = params.get("q").toLowerCase();
  if (params.get("sort")) state.sort = params.get("sort");

  var search = document.querySelector("[data-shop-search]");
  var sortSel = document.querySelector("[data-sort]");
  if (search) search.value = params.get("q") || "";
  if (sortSel) sortSel.value = state.sort;

  function n(c, k) { return parseFloat(c.dataset[k]); }
  function match(c) {
    if (state.cat !== "all" && c.dataset.category !== state.cat) return false;
    if (state.q && c.dataset.name.indexOf(state.q) === -1) return false;
    var pmin = n(c, "pmin"), pmax = n(c, "pmax"), t = n(c, "tmax"), a = n(c, "age"), w = n(c, "weight"), pr = n(c, "price");
    switch (state.players) {
      case "1": if (pmin > 1) return false; break;
      case "2": if (pmin > 2 || pmax < 2) return false; break;
      case "4": if (pmin > 4 || pmax < 3) return false; break;
      case "5": if (pmax < 5) return false; break;
    }
    if (state.time === "30" && !(t > 0 && t <= 30)) return false;
    if (state.time === "60" && !(t > 0 && t <= 60)) return false;
    if (state.time === "61" && !(t > 60)) return false;
    if (state.age !== "all" && a > parseInt(state.age, 10)) return false;
    if (state.weight === "2" && !(w > 0 && w <= 2)) return false;
    if (state.weight === "3" && w !== 3) return false;
    if (state.weight === "5" && w < 4) return false;
    if (state.price === "1000" && pr >= 1000) return false;
    if (state.price === "2500" && pr >= 2500) return false;
    if (state.price === "99999" && pr < 2500) return false;
    return true;
  }
  function sorter(a, b) {
    switch (state.sort) {
      case "newest": return n(b, "added") - n(a, "added");
      case "price-asc": return n(a, "price") - n(b, "price");
      case "price-desc": return n(b, "price") - n(a, "price");
      case "rating": return n(b, "rating") - n(a, "rating");
      default: return n(a, "featured") - n(b, "featured");
    }
  }
  function render() {
    var shown = cards.filter(match).sort(sorter);
    cards.forEach(function (c) { c.hidden = true; });
    shown.forEach(function (c) { grid.appendChild(c); c.hidden = false; });
    var rc = document.querySelector("[data-result-count]");
    if (rc) rc.textContent = shown.length + (shown.length === 1 ? " game" : " games");
    document.querySelector("[data-empty]").hidden = shown.length > 0;
    grid.hidden = shown.length === 0;
    document.querySelectorAll("[data-cat]").forEach(function (p) { p.setAttribute("aria-pressed", p.dataset.cat === state.cat ? "true" : "false"); });
    document.querySelectorAll("[data-filter]").forEach(function (c) { c.setAttribute("aria-pressed", state[c.dataset.filter] === c.dataset.value ? "true" : "false"); });
    var active = ["players", "time", "age", "weight", "price"].filter(function (k) { return state[k] !== "all"; }).length;
    var fo = document.querySelector("[data-filters-open]");
    if (fo) fo.innerHTML = '<i class="bi bi-sliders" aria-hidden="true"></i>Filters' + (active ? " (" + active + ")" : "");
  }
  function syncUrl() {
    var p = new URLSearchParams();
    if (state.cat !== "all") p.set("category", state.cat);
    if (state.q) p.set("q", state.q);
    if (state.sort !== "featured") p.set("sort", state.sort);
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cat]");
    if (b) { state.cat = b.dataset.cat; render(); syncUrl(); return; }
    b = e.target.closest("[data-filter]");
    if (b) { var k = b.dataset.filter; state[k] = state[k] === b.dataset.value && b.dataset.value !== "all" ? "all" : b.dataset.value; render(); return; }
    if (e.target.closest("[data-clear-filters]")) {
      ["players", "time", "age", "weight", "price"].forEach(function (k) { state[k] = "all"; });
      state.q = ""; state.cat = "all"; if (search) search.value = ""; render(); syncUrl();
    }
  });
  if (search) search.addEventListener("input", function () { state.q = search.value.trim().toLowerCase(); render(); syncUrl(); });
  if (sortSel) sortSel.addEventListener("change", function () { state.sort = sortSel.value; render(); syncUrl(); });
  render();
})();
