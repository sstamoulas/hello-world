(function (root) {
  function normalizeText(text) {
    if (text === null || typeof text === "undefined") {
      return "";
    }

    return String(text);
  }

  function getTrimmedText(text) {
    return normalizeText(text).replace(/^\s+|\s+$/g, "");
  }

  function getWords(text) {
    var trimmedText = getTrimmedText(text);

    if (!trimmedText) {
      return [];
    }

    return trimmedText.split(/\s+/);
  }

  function getNormalizedWord(word) {
    return word.toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/gi, "");
  }

  function getSentenceCount(text) {
    var value = normalizeText(text);
    var matches = value.match(/[.!?]+(?=\s|$)/g);

    return matches ? matches.length : 0;
  }

  function getParagraphCount(text) {
    var trimmedText = getTrimmedText(text);
    var parts;
    var count = 0;
    var index;

    if (!trimmedText) {
      return 0;
    }

    parts = trimmedText.split(/\n\s*\n+/);

    for (index = 0; index < parts.length; index += 1) {
      if (getTrimmedText(parts[index])) {
        count += 1;
      }
    }

    return count;
  }

  function getUniqueWordCount(words) {
    var seen = {};
    var count = 0;
    var index;
    var normalizedWord;

    for (index = 0; index < words.length; index += 1) {
      normalizedWord = getNormalizedWord(words[index]);

      if (!normalizedWord || seen[normalizedWord]) {
        continue;
      }

      seen[normalizedWord] = true;
      count += 1;
    }

    return count;
  }

  function getAverageWordLength(words) {
    var totalLength = 0;
    var countedWords = 0;
    var index;
    var normalizedWord;

    if (!words.length) {
      return 0;
    }

    for (index = 0; index < words.length; index += 1) {
      normalizedWord = getNormalizedWord(words[index]);

      if (!normalizedWord) {
        continue;
      }

      totalLength += normalizedWord.length;
      countedWords += 1;
    }

    if (!countedWords) {
      return 0;
    }

    return Math.round((totalLength / countedWords) * 10) / 10;
  }

  function analyze(text) {
    var value = normalizeText(text);
    var words = getWords(value);

    return {
      charCount: value.length,
      charCountNoSpaces: value.replace(/\s/g, "").length,
      wordCount: words.length,
      sentenceCount: getSentenceCount(value),
      paragraphCount: getParagraphCount(value),
      uniqueWordCount: getUniqueWordCount(words),
      avgWordLength: getAverageWordLength(words),
      readingTimeSeconds: Math.ceil((words.length / 238) * 60)
    };
  }

  root.TextAnalyzer = {
    analyze: analyze
  };
}(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this)));
