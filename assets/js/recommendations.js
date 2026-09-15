/* ==========================================================================
   RECOMMENDATIONS.JS — 5-step "Game Finder" quiz. Scores a small demo catalog
   against the answers and renders matches with a computed match percentage.
   ========================================================================== */
(function () {
  "use strict";
  var wizard = document.querySelector("[data-finder-wizard]");
  if (!wizard) return;

  var steps = Array.prototype.slice.call(wizard.querySelectorAll("[data-step]"));
  var progressBar = document.querySelector("[data-finder-progress]");
  var progressLabel = document.querySelector("[data-finder-progress-label]");
  var current = 0;
  var answers = {};

  var catalog = [
    { name: "Cascadia", cat: "Strategy", players: "1-4", age: "10+", time: "30-60", difficulty: "Easy", mood: ["strategic", "relaxed", "creative"], price: "₹2,999", img: "ph-cascadia", photo: "Carcassonne.jpg", blurb: "Tile-laying and habitat building where every wildlife token you place quietly nudges your score upward." },
    { name: "Wingspan", cat: "Strategy", players: "1-5", age: "10+", time: "40-70", difficulty: "Medium", mood: ["strategic", "relaxed"], price: "₹3,499", img: "ph-wingspan", photo: "wingspans.jpg", blurb: "An engine-building card game about attracting birds to your wildlife reserves — gorgeous and endlessly replayable." },
    { name: "Azul", cat: "Family", players: "2-4", age: "8+", time: "30-45", difficulty: "Easy", mood: ["relaxed", "creative", "competitive"], price: "₹2,499", img: "ph-azul", photo: "azul.jpg", blurb: "Drafting glazed tiles to build the most elegant palace wall — simple to learn, hard to put down." },
    { name: "Ticket to Ride", cat: "Family", players: "2-5", age: "8+", time: "45-60", difficulty: "Easy", mood: ["competitive", "social"], price: "₹2,799", img: "ph-ticket", photo: "Route-building.jpg", blurb: "Claim train routes across the map before your friends beat you to the same connections." },
    { name: "Codenames", cat: "Party", players: "4-8", age: "14+", time: "15-30", difficulty: "Easy", mood: ["social", "creative", "competitive"], price: "₹1,299", img: "ph-codenames", photo: "card-games.jpg", blurb: "One-word clues, two rival teams, and constant arguing over who the spymaster meant." },
    { name: "Carcassonne", cat: "Strategy", players: "2-5", age: "8+", time: "35-45", difficulty: "Easy", mood: ["relaxed", "strategic"], price: "₹2,199", img: "ph-carcassonne", photo: "Carcassonne.jpg", blurb: "Lay tiles to grow a medieval landscape of cities, roads and cloisters as you go." },
    { name: "Gloomhaven: Jaws of the Lion", cat: "RPG", players: "1-4", age: "14+", time: "60-120", difficulty: "Hard", mood: ["strategic", "social"], price: "₹5,999", img: "ph-rpg", photo: "blog8.jpg", blurb: "A legacy dungeon-crawl campaign with tactical combat and a story that evolves with every session." },
    { name: "Just One", cat: "Party", players: "3-7", age: "8+", time: "15-30", difficulty: "Easy", mood: ["social", "creative"], price: "₹1,499", img: "ph-party", photo: "blog4.jpg", blurb: "Everyone writes a one-word clue at once — duplicates get scrapped, so the guesser is on their own." }
  ];

  function playersMatch(catPlayers, answer) {
    if (answer === "1") return catPlayers.indexOf("1-") === 0;
    if (answer === "2") return catPlayers.split("-")[0] <= "2" && catPlayers.split("-")[1] >= "2";
    if (answer === "3-4") return catPlayers.split("-")[1] >= "3";
    if (answer === "5+") return parseInt(catPlayers.split("-")[1], 10) >= 5;
    return true;
  }
  function timeMatch(catTime, answer) {
    var max = parseInt(catTime.split("-")[1], 10);
    if (answer === "under30") return max <= 30;
    if (answer === "30-60") return max > 30 && max <= 60;
    if (answer === "60-120") return max > 60 && max <= 120;
    if (answer === "long") return max > 120 || max >= 90;
    return true;
  }

  function score(game) {
    var pts = 0, total = 0;
    total += 3; if (answers.players && playersMatch(game.players, answers.players)) pts += 3;
    total += 2; if (answers.age === "all" || !answers.age || game.age <= answers.age || answers.age === "adults") pts += 2;
    total += 2; if (answers.time && timeMatch(game.time, answers.time)) pts += 2;
    total += 3; if (answers.mood && game.mood.indexOf(answers.mood) !== -1) pts += 3;
    total += 2; if (answers.difficulty && game.difficulty.toLowerCase() === answers.difficulty) pts += 2;
    return Math.round((pts / total) * 100);
  }

  function goToStep(index) {
    steps.forEach(function (s, i) { s.hidden = i !== index; });
    current = index;
    var pct = Math.round((index / (steps.length - 1)) * 100);
    if (progressBar) progressBar.style.width = pct + "%";
    if (progressLabel) progressLabel.textContent = "Step " + (index + 1) + " of " + steps.length;
    wizard.querySelector(".finder-nav")?.scrollIntoView({ block: "nearest" });
  }

  wizard.addEventListener("click", function (e) {
    var choice = e.target.closest("[data-answer]");
    if (choice) {
      var group = choice.closest("[data-step]");
      group.querySelectorAll("[data-answer]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      choice.setAttribute("aria-pressed", "true");
      answers[choice.dataset.field] = choice.dataset.answer;
    }
    if (e.target.closest("[data-step-next]")) {
      if (current < steps.length - 1) goToStep(current + 1);
      else renderResults();
    }
    if (e.target.closest("[data-step-prev]")) {
      if (current > 0) goToStep(current - 1);
    }
    if (e.target.closest("[data-finder-restart]")) {
      answers = {};
      wizard.querySelectorAll("[data-answer]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      document.querySelector("[data-finder-results]").hidden = true;
      wizard.hidden = false;
      goToStep(0);
    }
  });

  function renderResults() {
    var results = catalog.map(function (g) { return Object.assign({}, g, { match: score(g) }); })
      .sort(function (a, b) { return b.match - a.match; })
      .slice(0, 3);

    var resultsWrap = document.querySelector("[data-finder-results]");
    var resultsGrid = document.querySelector("[data-finder-results-grid]");
    resultsGrid.innerHTML = results.map(function (g) {
      return '' +
        '<div class="col-12 col-md-4">' +
        '<div class="panel h-100 p-3 reveal is-visible">' +
        '<div class="ph ' + g.img + ' has-photo" style="aspect-ratio:4/3;"><img class="ph-photo" src="../assets/images/' + g.photo + '" alt="' + g.name + ' board game" loading="lazy"></div>' +
        '<div class="d-flex justify-content-between align-items-start mt-3">' +
        '<div><p class="card-cat mb-1">' + g.cat + '</p><h3 class="card-title mb-0">' + g.name + '</h3></div>' +
        '<div class="match-score">' + g.match + '<span>% match</span></div>' +
        '</div>' +
        '<p class="text-muted-token small mt-2 mb-3">' + g.blurb + '</p>' +
        '<p class="small mb-3"><strong>Why it fits:</strong> matches your ' + (answers.mood || "chosen") + ' mood, ' + (answers.time === "under30" ? "quick" : "flexible") + ' playtime and group size.</p>' +
        '<div class="d-flex justify-content-between align-items-center">' +
        '<span class="card-price">' + g.price + '</span>' +
        '<button class="btn btn-primary btn-sm" data-add-to-cart>Add to Cart</button>' +
        '</div></div></div>';
    }).join("");

    wizard.hidden = true;
    resultsWrap.hidden = false;
    resultsWrap.setAttribute("tabindex", "-1");
    resultsWrap.focus();
  }

  goToStep(0);
})();
