(function () {
  "use strict";

  function formatTime(seconds) {
    var minutes;
    var remainingSeconds;

    if (!seconds) {
      return "0s";
    }

    if (seconds < 60) {
      return String(seconds) + "s";
    }

    minutes = Math.floor(seconds / 60);
    remainingSeconds = seconds % 60;

    if (!remainingSeconds) {
      return String(minutes) + "m";
    }

    return String(minutes) + "m " + String(remainingSeconds) + "s";
  }

  function formatTopWords(topWords) {
    var parts = [];
    var index;

    for (index = 0; index < topWords.length; index += 1) {
      parts.push(topWords[index].word + " ×" + String(topWords[index].count));
    }

    return parts.join(", ");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var textarea = document.getElementById("input-text");
    var statCards = document.querySelectorAll(".stat-card");
    var debounceTimer;

    function getDisplayValue(statName, analysis, isEmpty) {
      var value = analysis[statName];

      if (isEmpty) {
        return "—";
      }

      if (statName === "readingTimeSec" || statName === "speakingTimeSec") {
        return formatTime(value);
      }

      if (statName === "topWords") {
        return value.length ? formatTopWords(value) : "—";
      }

      if (statName === "longestWord") {
        return value || "—";
      }

      return String(value);
    }

    function isActiveValue(statName, analysis) {
      var value = analysis[statName];

      if (statName === "topWords") {
        return value.length > 0;
      }

      if (statName === "longestWord") {
        return Boolean(value);
      }

      return value !== 0;
    }

    function render() {
      var analysis = window.TextAnalyzer.analyze(textarea.value);
      var isEmpty = analysis.wordCount === 0;
      var index;
      var card;
      var valueElement;
      var statName;

      for (index = 0; index < statCards.length; index += 1) {
        card = statCards[index];
        valueElement = card.querySelector(".stat-value");
        statName = card.getAttribute("data-stat");

        valueElement.innerText = getDisplayValue(statName, analysis, isEmpty);
        card.classList.toggle("is-active", !isEmpty && isActiveValue(statName, analysis));
      }
    }

    textarea.addEventListener("input", function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(render, 150);
    });

    render();
  });
}());
