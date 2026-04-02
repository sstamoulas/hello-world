(function () {
  "use strict";

  var SOFT_LIMIT = 5000;
  var THEME_STORAGE_KEY = "theme";
  var WORD_GOAL_STORAGE_KEY = "wordCountGoal";
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

  function getOutputText(element) {
    if (!element) {
      return "";
    }

    if (typeof element.value === "string") {
      return element.value;
    }

    return element.textContent || "";
  }

  function getReadabilityBand(score) {
    if (score >= 90) {
      return {
        label: "Very Easy",
        className: "fre-very-easy"
      };
    }

    if (score >= 70) {
      return {
        label: "Easy",
        className: "fre-easy"
      };
    }

    if (score >= 60) {
      return {
        label: "Standard",
        className: "fre-standard"
      };
    }

    if (score >= 30) {
      return {
        label: "Difficult",
        className: "fre-difficult"
      };
    }

    return {
      label: "Very Difficult",
      className: "fre-hard"
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    var textarea = document.getElementById("input-text");
    var clearButton = document.getElementById("clear-button");
    var copyButton = document.getElementById("copy-btn");
    var progressBar = document.getElementById("progress-bar");
    var themeToggle = document.getElementById("theme-toggle");
    var wordGoalInput = document.getElementById("word-goal-input");
    var wordGoalIndicator = document.getElementById("word-goal-indicator");
    var wordCountOutput = document.querySelector('[data-stat="wordCount"]');
    var outputs = document.querySelectorAll("[data-stat]");
    var topWordsOutput = document.querySelector('[data-stat="topWords"]');
    var readabilityOutput = document.getElementById("readability-score");
    var currentTheme = getStoredTheme();
    var copyResetTimer = null;

    function getCurrentWordCount() {
      return Number(getOutputText(wordCountOutput)) || 0;
    }

    function getWordGoalValue() {
      var goal = Number(wordGoalInput.value);

      if (!goal || goal < 1) {
        return 0;
      }

      return Math.floor(goal);
    }

    function updateWordGoalIndicator(currentWordCount) {
      var goal = getWordGoalValue();
      var wordCount = typeof currentWordCount === "number" ? currentWordCount : getCurrentWordCount();
      var percentage;

      if (!goal) {
        wordGoalIndicator.hidden = true;
        wordGoalIndicator.textContent = "";
        wordGoalIndicator.classList.remove("goal-active");
        wordGoalIndicator.classList.remove("goal-reached");
        return;
      }

      percentage = Math.min(100, Math.round((wordCount / goal) * 100));

      wordGoalIndicator.hidden = false;
      wordGoalIndicator.classList.add("goal-active");
      wordGoalIndicator.classList.toggle("goal-reached", wordCount >= goal);

      if (wordCount >= goal) {
        wordGoalIndicator.textContent = "\u2713 Word goal reached! " + String(wordCount) + " / " + String(goal) + " words";
        return;
      }

      wordGoalIndicator.textContent = "Aiming for " + String(goal) + " words \u2014 " + String(wordCount) + " / " + String(goal) + " (" + String(percentage) + "%)";
    }

    function clearCopyResetTimer() {
      if (copyResetTimer) {
        window.clearTimeout(copyResetTimer);
        copyResetTimer = null;
      }
    }

    function setCopyButtonIdleState() {
      var hasText = textarea.value.trim().length > 0;

      clearCopyResetTimer();
      copyButton.textContent = "Copy to Clipboard";
      copyButton.classList.remove("is-success");
      copyButton.classList.remove("is-error");
      copyButton.disabled = !hasText;

      if (hasText) {
        copyButton.removeAttribute("title");
      } else {
        copyButton.title = "Run analysis first";
      }
    }

    function setCopyButtonFeedback(label, className, disableButton) {
      clearCopyResetTimer();
      copyButton.textContent = label;
      copyButton.classList.toggle("is-success", className === "is-success");
      copyButton.classList.toggle("is-error", className === "is-error");
      copyButton.disabled = disableButton;

      copyResetTimer = window.setTimeout(function () {
        setCopyButtonIdleState();
      }, 2000);
    }

    function getCopyText() {
      var lines = [
        "Characters: " + getOutputText(document.querySelector('[data-stat="charCount"]')),
        "Characters No Spaces: " + getOutputText(document.querySelector('[data-stat="charNoSpaces"]')),
        "Words: " + getOutputText(document.querySelector('[data-stat="wordCount"]')),
        "Sentences: " + getOutputText(document.querySelector('[data-stat="sentenceCount"]')),
        "Paragraphs: " + getOutputText(document.querySelector('[data-stat="paragraphCount"]')),
        "Average Word Length: " + getOutputText(document.querySelector('[data-stat="avgWordLength"]')),
        "Reading Time: " + getOutputText(document.querySelector('[data-stat="readingTime"]')),
        "Top 5 Words: " + getOutputText(topWordsOutput)
      ];
      var readabilityText = getOutputText(readabilityOutput);

      if (readabilityText) {
        lines.push(readabilityText);
      }

      return lines.join("\n");
    }

    function fallbackCopy(text) {
      var copyArea = document.createElement("textarea");

      copyArea.value = text;
      copyArea.setAttribute("readonly", "readonly");
      copyArea.style.position = "fixed";
      copyArea.style.top = "-9999px";
      copyArea.style.left = "-9999px";
      document.body.appendChild(copyArea);
      copyArea.focus();
      copyArea.select();

      try {
        if (document.execCommand("copy")) {
          setCopyButtonFeedback("\u2713 Copied!", "is-success", true);
          return;
        }
      } catch (error) {
        // Fall through to the shared error state below.
      } finally {
        document.body.removeChild(copyArea);
      }

      setCopyButtonFeedback("Copy failed", "is-error", false);
    }

    function copyToClipboard() {
      var text = getCopyText();

      if (!text.trim()) {
        setCopyButtonIdleState();
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          setCopyButtonFeedback("\u2713 Copied!", "is-success", true);
        }).catch(function () {
          fallbackCopy(text);
        });

        return;
      }

      fallbackCopy(text);
    }

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

    function renderReadability(analysis) {
      var band;
      var scoreText;
      var gradeText;

      if (analysis.fleschReadingEase === null) {
        readabilityOutput.textContent = "";
        readabilityOutput.className = "";
        readabilityOutput.hidden = true;
        return;
      }

      band = getReadabilityBand(analysis.fleschReadingEase);
      scoreText = analysis.fleschReadingEase.toFixed(1);
      gradeText = String(Math.round(analysis.fleschKincaidGrade));

      readabilityOutput.textContent = "Readability: " + scoreText + " | Grade Level: " + gradeText + " | " + band.label;
      readabilityOutput.className = band.className;
      readabilityOutput.hidden = false;
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

      renderReadability(analysis);
      updateProgress(analysis.charCount);
      updateWordGoalIndicator(analysis.wordCount);
      setCopyButtonIdleState();
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

    wordGoalInput.addEventListener("input", function () {
      var goal = Math.floor(Number(wordGoalInput.value));

      if (!goal || goal < 1) {
        wordGoalInput.value = "";
        localStorage.removeItem(WORD_GOAL_STORAGE_KEY);
      } else {
        wordGoalInput.value = String(goal);
        localStorage.setItem(WORD_GOAL_STORAGE_KEY, wordGoalInput.value);
      }

      updateWordGoalIndicator();
    });

    document.addEventListener("keydown", function (event) {
      var isShortcutPressed = event.shiftKey && event.key === "Delete" && (event.metaKey || event.ctrlKey);

      if (!isShortcutPressed) {
        return;
      }

      event.preventDefault();
      clearButton.click();
    });

    clearButton.addEventListener("click", function () {
      textarea.value = "";
      render("");
      textarea.focus();
    });

    copyButton.addEventListener("click", function () {
      copyToClipboard();
    });

    (function restoreWordGoal() {
      var storedWordGoal = Number(localStorage.getItem(WORD_GOAL_STORAGE_KEY));

      if (storedWordGoal && storedWordGoal > 0) {
        wordGoalInput.value = String(Math.floor(storedWordGoal));
      }
    }());

    render(textarea.value);
  });
}());
