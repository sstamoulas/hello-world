(function () {
  "use strict";

  var SOFT_LIMIT = 5000;
  var THEME_STORAGE_KEY = "theme";
  var THEME_CLASS_MAP = {
    dark: "",
    light: "light-mode",
    "high-contrast": "high-contrast"
  };
  var THEME_LABEL_MAP = {
    dark: "Dark Mode",
    light: "Light Mode",
    "high-contrast": "High Contrast"
  };

  function getStoredTheme() {
    var theme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";

    return Object.prototype.hasOwnProperty.call(THEME_CLASS_MAP, theme) ? theme : "dark";
  }

  function applyTheme(themeName) {
    var root = document.documentElement;
    var body = document.body;
    var themeClass = THEME_CLASS_MAP[themeName];
    var className;

    for (className in THEME_CLASS_MAP) {
      if (Object.prototype.hasOwnProperty.call(THEME_CLASS_MAP, className) && THEME_CLASS_MAP[className]) {
        root.classList.remove(THEME_CLASS_MAP[className]);
        body.classList.remove(THEME_CLASS_MAP[className]);
      }
    }

    if (themeClass) {
      root.classList.add(themeClass);
      body.classList.add(themeClass);
    }
  }

  function getNextTheme(themeName) {
    if (themeName === "dark") {
      return "light";
    }

    if (themeName === "light") {
      return "high-contrast";
    }

    return "dark";
  }

  function updateThemeToggle(button, themeName) {
    var label = THEME_LABEL_MAP[themeName];

    button.textContent = label;
    button.setAttribute("aria-label", "Current theme: " + label + ". Activate to switch theme.");
  }

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
    var themeToggle = document.getElementById("theme-toggle");
    var outputs = document.querySelectorAll("[data-stat]");
    var currentTheme = getStoredTheme();

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

    applyTheme(currentTheme);
    updateThemeToggle(themeToggle, currentTheme);

    themeToggle.addEventListener("click", function () {
      currentTheme = getNextTheme(currentTheme);
      applyTheme(currentTheme);
      localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
      updateThemeToggle(themeToggle, currentTheme);
    });

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
