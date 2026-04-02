(function () {
  "use strict";

  function formatReadingTime(seconds) {
    var minutes;
    var remainingSeconds;

    if (!seconds || seconds < 60) {
      return "< 1 min";
    }

    if (seconds === 60) {
      return "1 min";
    }

    if (seconds < 120) {
      return "1 min " + String(seconds - 60) + " sec";
    }

    minutes = Math.floor(seconds / 60);
    remainingSeconds = seconds % 60;

    if (remainingSeconds > 0) {
      return String(minutes) + " min " + String(remainingSeconds) + " sec";
    }

    return String(minutes) + " min";
  }

  function formatStatValue(key, value) {
    if (key === "readingTimeSeconds") {
      return formatReadingTime(value);
    }

    return String(value);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var textarea = document.getElementById("input-text");
    var statElements = document.querySelectorAll("[data-stat]");

    function render() {
      var value = textarea.value;
      var analysis = window.TextAnalyzer.analyze(value);
      var isEmpty = !value.replace(/\s/g, "");
      var index;
      var statElement;
      var statKey;

      for (index = 0; index < statElements.length; index += 1) {
        statElement = statElements[index];
        statKey = statElement.getAttribute("data-stat");
        statElement.innerText = formatStatValue(statKey, analysis[statKey]);
      }

      document.body.classList.toggle("empty", isEmpty);
    }

    textarea.addEventListener("input", render);
    textarea.value = "";
    render();
  });
}());
