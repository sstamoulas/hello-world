(function () {
  'use strict';

  var MAX_CHARS = 5000;
  var KEYWORD_DEBOUNCE_MS = 100;
  var CLEAR_FLASH_MS = 500;
  var COPY_STATUS_MS = 1600;

  function debounce(fn, delay) {
    var timerId = null;
    function debounced() {
      var args = arguments;
      var context = this;

      clearTimeout(timerId);
      timerId = setTimeout(function () {
        timerId = null;
        fn.apply(context, args);
      }, delay);
    }

    debounced.cancel = function () {
      clearTimeout(timerId);
      timerId = null;
    };

    return debounced;
  }

  function formatReadingTime(readingTime) {
    if (readingTime.minutes === 0) {
      return String(readingTime.seconds) + " sec";
    }

    if (readingTime.seconds === 0) {
      return String(readingTime.minutes) + " min";
    }

    return String(readingTime.minutes) + " min " + String(readingTime.seconds) + " sec";
  }

  function createKeywordRow(keyword) {
    var row = document.createElement("tr");
    var wordCell = document.createElement("td");
    var countCell = document.createElement("td");

    wordCell.textContent = keyword.word;
    countCell.textContent = String(keyword.count);

    row.appendChild(wordCell);
    row.appendChild(countCell);

    return row;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var textInput = document.getElementById("text-input");
    var clearButton = document.getElementById("clear-button");
    var copyButton = document.getElementById("copy-stats-button");
    var copyStatus = document.getElementById("copy-status");
    var progressLabel = document.getElementById("char-progress-label");
    var progressBar = document.getElementById("char-progress-bar");
    var warningMessage = document.getElementById("char-warning");
    var keywordTableBody = document.getElementById("keyword-table-body");
    var keywordEmptyState = document.getElementById("keyword-empty-state");
    var keywordTable = keywordTableBody.parentNode;
    var statMap = {
      characters: document.getElementById("stat-characters"),
      charactersNoSpaces: document.getElementById("stat-characters-no-spaces"),
      words: document.getElementById("stat-words"),
      sentences: document.getElementById("stat-sentences"),
      paragraphs: document.getElementById("stat-paragraphs"),
      readingTime: document.getElementById("stat-reading-time"),
      averageWordLength: document.getElementById("stat-average-word-length"),
      uniqueWords: document.getElementById("stat-unique-words")
    };
    var copyStatusTimer = null;
    var copyButtonTimer = null;
    var clearFlashTimer = null;
    var lastRenderedStats = null;

    function setCopyStatus(message, className) {
      if (copyStatusTimer) {
        clearTimeout(copyStatusTimer);
      }

      copyStatus.textContent = message;
      copyStatus.className = "status-message status-message--align-right";

      if (className) {
        copyStatus.classList.add(className);
      }

      copyStatusTimer = setTimeout(function () {
        copyStatus.textContent = "";
        copyStatus.className = "status-message status-message--align-right";
      }, COPY_STATUS_MS);
    }

    function setWarningState(isLimitReached) {
      progressBar.classList.toggle("is-limit", isLimitReached);
      warningMessage.className = "status-message";

      if (isLimitReached) {
        warningMessage.textContent = "Character limit reached. Additional input is blocked at 5000 characters.";
        warningMessage.classList.add("is-warning");
      } else {
        warningMessage.textContent = "";
      }
    }

    function renderKeywords(text) {
      var keywords = TextAnalyzer.topKeywords(text, 10);
      var fragment = document.createDocumentFragment();
      var index;

      keywordTableBody.innerHTML = "";

      if (!keywords.length) {
        keywordTable.classList.add("is-hidden");
        keywordEmptyState.classList.remove("is-hidden");
        keywordEmptyState.textContent = "Start typing to see keywords…";
        return;
      }

      for (index = 0; index < keywords.length; index += 1) {
        fragment.appendChild(createKeywordRow(keywords[index]));
      }

      keywordTableBody.appendChild(fragment);
      keywordTable.classList.remove("is-hidden");
      keywordEmptyState.classList.add("is-hidden");
    }

    var renderKeywordsDebounced = debounce(function (text) {
      renderKeywords(text);
    }, KEYWORD_DEBOUNCE_MS);

    function resetCopyButtonLabel() {
      if (copyButtonTimer) {
        clearTimeout(copyButtonTimer);
      }

      copyButtonTimer = setTimeout(function () {
        copyButton.textContent = "Copy Stats";
      }, COPY_STATUS_MS);
    }

    function collectStats(text) {
      var characterCounts = TextAnalyzer.countCharacters(text);
      var wordCount = TextAnalyzer.countWords(text);

      return {
        characters: characterCounts.total,
        charactersNoSpaces: characterCounts.noSpaces,
        words: wordCount,
        sentences: TextAnalyzer.countSentences(text),
        paragraphs: TextAnalyzer.countParagraphs(text),
        readingTime: TextAnalyzer.estimateReadingTime(wordCount),
        averageWordLength: TextAnalyzer.averageWordLength(text),
        uniqueWords: TextAnalyzer.countUniqueWords(text)
      };
    }

    function renderStats(stats) {
      statMap.characters.textContent = String(stats.characters);
      statMap.charactersNoSpaces.textContent = String(stats.charactersNoSpaces);
      statMap.words.textContent = String(stats.words);
      statMap.sentences.textContent = String(stats.sentences);
      statMap.paragraphs.textContent = String(stats.paragraphs);
      statMap.readingTime.textContent = formatReadingTime(stats.readingTime);
      statMap.averageWordLength.textContent = stats.averageWordLength.toFixed(1);
      statMap.uniqueWords.textContent = String(stats.uniqueWords);
      lastRenderedStats = stats;
    }

    function updateProgress(characterCount) {
      var progress = Math.min(characterCount / MAX_CHARS, 1);
      var isLimitReached = characterCount >= MAX_CHARS;

      progressLabel.textContent = String(characterCount) + " / " + String(MAX_CHARS);
      progressBar.style.width = String(progress * 100) + "%";
      setWarningState(isLimitReached);
    }

    function refresh(text) {
      var stats = collectStats(text);

      renderStats(stats);
      updateProgress(stats.characters);
      renderKeywordsDebounced(text);
    }

    function enforceMaxLength() {
      if (textInput.value.length > MAX_CHARS) {
        textInput.value = textInput.value.slice(0, MAX_CHARS);
      }
    }

    textInput.addEventListener("input", function () {
      enforceMaxLength();
      refresh(textInput.value);
    });

    clearButton.addEventListener("click", function () {
      textInput.value = "";
      renderKeywordsDebounced.cancel();
      refresh("");
      renderKeywords("");
      textInput.classList.remove("is-cleared");
      void textInput.offsetWidth;
      textInput.classList.add("is-cleared");
      textInput.focus();

      if (clearFlashTimer) {
        clearTimeout(clearFlashTimer);
      }

      clearFlashTimer = setTimeout(function () {
        textInput.classList.remove("is-cleared");
      }, CLEAR_FLASH_MS);
    });

    copyButton.addEventListener("click", function () {
      var stats = lastRenderedStats || collectStats(textInput.value);
      var summary = [
        "Characters: " + stats.characters,
        "Characters (No Spaces): " + stats.charactersNoSpaces,
        "Words: " + stats.words,
        "Sentences: " + stats.sentences,
        "Paragraphs: " + stats.paragraphs,
        "Estimated Reading Time: " + formatReadingTime(stats.readingTime),
        "Average Word Length: " + stats.averageWordLength.toFixed(1),
        "Unique Words: " + stats.uniqueWords
      ].join("\n");

      try {
        navigator.clipboard.writeText(summary).then(function () {
          copyButton.textContent = "Copied!";
          setCopyStatus("Copied to clipboard.", "is-success");
          resetCopyButtonLabel();
        }, function () {
          copyButton.textContent = "Copy failed";
          setCopyStatus("Clipboard access failed.", "is-error");
          resetCopyButtonLabel();
        });
      } catch (error) {
        copyButton.textContent = "Copy failed";
        setCopyStatus("Clipboard access failed.", "is-error");
        resetCopyButtonLabel();
      }
    });

    renderStats({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: { minutes: 0, seconds: 0 },
      averageWordLength: 0,
      uniqueWords: 0
    });
    updateProgress(0);
    renderKeywords("");
  });
}());
