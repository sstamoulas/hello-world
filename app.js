(function () {
  "use strict";

  var SOFT_LIMIT = 5000;

  function formatTopWords(topWords) {
    var parts = [];
    var index;

    for (index = 0; index < topWords.length; index += 1) {
      parts.push(topWords[index].word + " (" + String(topWords[index].count) + ")");
    }

    return parts.length ? parts.join(", ") : "No top words yet.";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var textarea = document.getElementById("input-text");
    var clearButton = document.getElementById("clear-button");
    var progressBar = document.getElementById("progress-bar");
    var outputs = document.querySelectorAll("[data-stat]");

    function updateProgress(charCount) {
      var percentage = Math.min((charCount / SOFT_LIMIT) * 100, 100);

      progressBar.style.width = String(percentage) + "%";
      progressBar.classList.toggle("warn", charCount >= 4000 && charCount < SOFT_LIMIT);
      progressBar.classList.toggle("danger", charCount >= SOFT_LIMIT);
    }

    function getDisplayValue(statName, analysis) {
      if (statName === "topWords") {
        return formatTopWords(analysis.topWords);
      }

      return String(analysis[statName]);
    }

    function render(text) {
      var analysis = window.Analyzer.analyze(text);
      var index;
      var output;
      var statName;

      for (index = 0; index < outputs.length; index += 1) {
        output = outputs[index];
        statName = output.getAttribute("data-stat");
        output.textContent = getDisplayValue(statName, analysis);
      }

      updateProgress(analysis.charCount);
    }

    textarea.addEventListener("input", function () {
      render(textarea.value);
    });

    clearButton.addEventListener("click", function () {
      textarea.value = "";
      render("");
      textarea.focus();
    });

    render(textarea.value);
  });
}());
