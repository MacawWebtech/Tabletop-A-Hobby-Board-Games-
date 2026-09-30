/* Game Finder: five questions, scored against the shared catalog, top three shown with reasons. */
(function () {
  "use strict";
  var box = document.querySelector("[data-finder]");
  if (!box) return;
  var steps = Array.prototype.slice.call(box.querySelectorAll("[data-step]"));
  var bar = box.querySelector("[data-finder-bar]"), label = box.querySelector("[data-finder-label]");
  var prev = box.querySelector("[data-finder-prev]"), next = box.querySelector("[data-finder-next]");
  var err = box.querySelector("[data-finder-error]");
  var quiz = box.querySelector("[data-finder-quiz]"), results = box.querySelector("[data-finder-results]");
  var i = 0, answers = {};
  var R = TT.root, fmt = TT.fmt;

  function show(n, focus) {
    i = n;
    steps.forEach(function (s, k) { s.hidden = k !== n; });
    bar.style.width = (n / steps.length * 100) + "%";
    label.textContent = "Question " + (n + 1) + " of " + steps.length;
    prev.disabled = n === 0;
    next.textContent = n === steps.length - 1 ? "Show my games" : "Next question";
    err.hidden = true;
    if (focus) steps[n].querySelector("h2").focus();
  }
  box.addEventListener("click", function (e) {
    var a = e.target.closest("[data-answer]");
    if (a) {
      a.parentNode.querySelectorAll("[data-answer]").forEach(function (b) { b.setAttribute("aria-pressed", b === a ? "true" : "false"); });
      answers[a.dataset.field] = a.dataset.answer; err.hidden = true;
      if (i < steps.length - 1) setTimeout(function () { show(i + 1, true); }, 180);
    }
  });
  next.addEventListener("click", function () {
    var field = steps[i].querySelector("[data-field]").dataset.field;
    if (!answers[field]) { err.hidden = false; return; }
    if (i < steps.length - 1) show(i + 1, true); else finish();
  });
  prev.addEventListener("click", function () { if (i > 0) show(i - 1, true); });
  box.querySelector("[data-finder-restart]").addEventListener("click", function () {
    answers = {}; box.querySelectorAll("[data-answer]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    results.hidden = true; quiz.hidden = false; show(0, true);
  });

  var moodWord = { relaxed: "relaxed", social: "loud and social", strategic: "thinky", competitive: "competitive" };
  function score(g) {
    var pts = 0, why = [];
    var pmin = g.players[0], pmax = g.players[1], tmin = g.time[0], tmax = g.time[1];
    var pl = answers.players, okP =
      pl === "1" ? pmin <= 1 : pl === "2" ? pmin <= 2 && pmax >= 2 : pl === "4" ? pmin <= 4 && pmax >= 3 : pmax >= 5;
    if (okP) { pts += 30; why.push("works for " + (pl === "1" ? "one player" : pl === "6" ? "5 or more" : pl === "4" ? "3–4 players" : "two")); }
    var age = parseInt(answers.age, 10);
    if (g.age <= age) { pts += 20; why.push("suits ages " + g.age + "+"); } else pts -= 25;
    var t = parseInt(answers.time, 10);
    var okT = t === 30 ? tmax <= 30 : t === 60 ? tmax <= 60 && tmax > 20 : tmax > 60;
    if (okT) { pts += 15; why.push("plays in " + (tmin === tmax ? tmin : tmin + "–" + tmax) + " minutes"); }
    else if (t === 60 && tmin <= 60) pts += 8;
    if (g.moods.indexOf(answers.mood) !== -1) { pts += 20; why.push("a " + moodWord[answers.mood] + " game"); }
    var w = g.weight, ex = answers.experience;
    var okW = ex === "new" ? w <= 2 : ex === "some" ? w >= 2 && w <= 3 : w >= 3;
    if (okW) { pts += 15; why.push(w <= 2 ? "easy to learn" : w === 3 ? "a step up in depth" : "real depth to master"); }
    else if (ex === "lots" && w === 2) pts += 6;
    return { pct: Math.max(35, Math.min(99, pts)), why: why };
  }
  function finish() {
    var ranked = window.TT_CATALOG.filter(function (g) { return g.players; }).map(function (g) {
      var s = score(g); return { g: g, pct: s.pct, why: s.why };
    }).sort(function (a, b) { return b.pct - a.pct || b.g.rating - a.g.rating; }).slice(0, 3);
    box.querySelector("[data-finder-grid]").innerHTML = ranked.map(function (r) {
      var g = r.g;
      return '<article class="pcard"><div class="pcard-media"><span class="badge badge--felt">' + r.pct + '% match</span><img src="' + R + 'assets/images/' + g.img + '" alt="' + g.name + '" loading="lazy"></div>' +
        '<div class="pcard-body"><p class="pcard-cat">' + TT_CATS[g.cat] + '</p><h3><a href="' + R + 'pages/product-' + g.id + '.html">' + g.name + '</a></h3>' +
        '<p class="muted" style="font-size:.95rem">' + g.blurb + '</p>' +
        (r.why.length ? '<p class="why"><strong>Why it fits:</strong> ' + r.why.join(", ") + '.</p>' : "") +
        '<div class="pcard-foot"><span class="price">' + fmt(g.price) + '</span><button class="btn btn-primary btn-sm" type="button" data-add="' + g.id + '"><i class="bi bi-bag-plus" aria-hidden="true"></i>Add to order</button></div></div></article>';
    }).join("");
    var summary = { "1": "solo play", "2": "two players", "4": "3–4 players", "6": "5 or more players" }[answers.players] +
      ", youngest aged " + answers.age + "+, " + { "30": "under 30 minutes", "60": "30–60 minutes", "120": "over an hour" }[answers.time] + ", " + moodWord[answers.mood] + ".";
    box.querySelector("[data-finder-summary]").textContent = "Based on: " + summary + " Prefer to talk it through? Our advisors reply on WhatsApp.";
    bar.style.width = "100%";
    quiz.hidden = true; results.hidden = false; results.focus();
  }
  show(0, false);
})();
