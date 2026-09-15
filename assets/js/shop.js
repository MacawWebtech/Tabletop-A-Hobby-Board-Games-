/* ==========================================================================
   SHOP.JS — demo catalog filtering, sorting and "load more" for shop.html.
   Filters run entirely client-side against data attributes on each product
   card, so this stays a front-end demo with no backend dependency.
   ========================================================================== */
(function () {
  "use strict";
  var grid = document.querySelector("[data-product-grid]");
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-product]"));
  var resultCount = document.querySelector("[data-result-count]");
  var pageSize = 8;
  var visibleCount = pageSize;

  var state = { category: "all", players: "all", age: "all", time: "all", difficulty: "all", price: "all", rating: "all", sort: "featured" };

  function matches(card) {
    return Object.keys(state).every(function (key) {
      if (key === "sort" || state[key] === "all") return true;
      if (key === "rating") return parseFloat(card.dataset.rating) >= parseFloat(state.rating);
      return card.dataset[key] === state[key];
    });
  }

  function applySort(list) {
    var sorted = list.slice();
    switch (state.sort) {
      case "newest":
        sorted.sort(function (a, b) { return parseInt(b.dataset.added, 10) - parseInt(a.dataset.added, 10); });
        break;
      case "price-asc":
        sorted.sort(function (a, b) { return parseFloat(a.dataset.price) - parseFloat(b.dataset.price); });
        break;
      case "price-desc":
        sorted.sort(function (a, b) { return parseFloat(b.dataset.price) - parseFloat(a.dataset.price); });
        break;
      case "rating":
        sorted.sort(function (a, b) { return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating); });
        break;
      default:
        sorted.sort(function (a, b) { return parseInt(a.dataset.featured, 10) - parseInt(b.dataset.featured, 10); });
    }
    return sorted;
  }

  function render() {
    var filtered = applySort(cards.filter(matches));
    cards.forEach(function (c) { c.style.display = "none"; });
    filtered.slice(0, visibleCount).forEach(function (c) {
      grid.appendChild(c);
      c.style.display = "";
    });
    if (resultCount) {
      resultCount.textContent = filtered.length + (filtered.length === 1 ? " game found" : " games found");
    }
    var loadMoreBtn = document.querySelector("[data-load-more]");
    if (loadMoreBtn) loadMoreBtn.hidden = visibleCount >= filtered.length;
    var emptyState = document.querySelector("[data-empty-state]");
    if (emptyState) emptyState.hidden = filtered.length !== 0;
  }

  document.querySelectorAll("[data-filter]").forEach(function (control) {
    control.addEventListener("change", function () {
      state[control.dataset.filter] = control.value;
      visibleCount = pageSize;
      render();
    });
  });

  document.querySelectorAll("[data-sort]").forEach(function (control) {
    control.addEventListener("change", function () {
      state.sort = control.value;
      render();
    });
  });

  document.querySelectorAll("[data-clear-filters]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      Object.keys(state).forEach(function (k) { if (k !== "sort") state[k] = "all"; });
      document.querySelectorAll("[data-filter]").forEach(function (el) { el.value = "all"; });
      visibleCount = pageSize;
      render();
    });
  });

  var loadMore = document.querySelector("[data-load-more]");
  if (loadMore) {
    loadMore.addEventListener("click", function () {
      visibleCount += pageSize;
      render();
    });
  }

  /* Mobile filter off-canvas */
  var filterPanel = document.querySelector("[data-filter-panel]");
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-filter-open]") && filterPanel) {
      filterPanel.classList.add("is-open");
      document.body.classList.add("menu-open");
    }
    if (e.target.closest("[data-filter-close]") && filterPanel) {
      filterPanel.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    }
  });

  render();
})();
