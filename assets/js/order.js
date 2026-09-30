/* Order page: editable order lines, delivery fee logic, summary and demo submission. */
(function () {
  "use strict";
  var form = document.querySelector("[data-order-form]");
  if (!form) return;
  var fmt = TT.fmt;
  var FEES = { chennai: { fee: 99, free: 1500 }, india: { fee: 149, free: 2500 }, pickup: { fee: 0, free: 0 } };
  var linesEl = document.querySelector("[data-order-page-lines]");
  var empty = document.querySelector("[data-order-empty]");

  function method() { return form.querySelector('input[name="delivery"]:checked').value; }
  function render() {
    var t = TT.order.totals();
    var hasItems = t.list.length > 0;
    form.hidden = !hasItems; empty.hidden = hasItems || !document.querySelector("[data-order-done]").hidden;
    if (!hasItems) return;
    linesEl.innerHTML = t.list.map(TT.lineHTML).join("");
    var m = FEES[method()], fee = m.fee && t.sub < m.free ? m.fee : 0;
    Object.keys(FEES).forEach(function (k) {
      var el = form.querySelector('[data-fee="' + k + '"]');
      if (el) el.textContent = FEES[k].fee && t.sub < FEES[k].free ? fmt(FEES[k].fee) : "Free";
    });
    document.querySelector("[data-sum-count]").textContent = t.count;
    document.querySelector("[data-sum-sub]").textContent = fmt(t.sub);
    document.querySelector("[data-sum-fee]").textContent = fee ? fmt(fee) : "Free";
    document.querySelector("[data-sum-total]").textContent = fmt(t.sub + fee);
    var note = document.querySelector("[data-sum-free]");
    note.textContent = m.fee && t.sub < m.free ? "Add " + fmt(m.free - t.sub) + " more for free delivery." : (method() === "pickup" ? "We'll message you when it's ready to collect." : "You've unlocked free delivery.");
    var pickup = method() === "pickup";
    form.querySelectorAll("[data-address]").forEach(function (f) { f.hidden = pickup; f.querySelector("input, textarea").required = !pickup; });
  }
  form.addEventListener("change", function (e) { if (e.target.name === "delivery") render(); });
  document.addEventListener("tt:order", render);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!TT.validateForm(form)) return;
    var ref = "TT-" + Date.now().toString().slice(-6);
    document.querySelector("[data-order-ref]").textContent = ref;
    TT.order.save([]);
    form.hidden = true; empty.hidden = true;
    var done = document.querySelector("[data-order-done]");
    done.hidden = false; done.focus();
    window.scrollTo({ top: done.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
  });
  render();
})();
