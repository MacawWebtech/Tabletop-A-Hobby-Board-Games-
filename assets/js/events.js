/* ==========================================================================
   EVENTS.JS — game-nights.html: simple month filter for the events timeline
   and a demo "Reserve seat" confirmation state (no backend).
   ========================================================================== */
(function () {
  "use strict";
  var monthSelect = document.querySelector("[data-events-month]");
  var eventCards = document.querySelectorAll("[data-event-month]");

  if (monthSelect && eventCards.length) {
    monthSelect.addEventListener("change", function () {
      var val = monthSelect.value;
      eventCards.forEach(function (card) {
        card.style.display = val === "all" || card.dataset.eventMonth === val ? "" : "none";
      });
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-reserve-seat]");
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-check2-circle" aria-hidden="true"></i> Seat reserved';
  });
})();
