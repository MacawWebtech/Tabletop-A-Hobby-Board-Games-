/* Game nights: month filter and demo seat reservation. */
(function () {
  "use strict";
  var sel = document.querySelector("[data-events-month]");
  if (sel) sel.addEventListener("change", function () {
    document.querySelectorAll("[data-event-month]").forEach(function (r) { r.hidden = sel.value !== "all" && r.dataset.eventMonth !== sel.value; });
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-reserve]");
    if (!b) return;
    b.disabled = true; b.classList.add("is-added");
    b.innerHTML = '<i class="bi bi-check2-circle" aria-hidden="true"></i>Seat reserved';
    if (window.TT && TT.toast) TT.toast("Seat reserved. We'll send details by SMS.");
  });
})();
