(function () {
  var STOP_WORDS = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "is",
    "it",
    "as"
  ];

  function trim(text) {
    return String(text || "").replace(/^\s+|\s+$/g, "");
  }

  function tokenizeWords(text) {
    var value = trim(text);

    if (!value) {
      return [];
    }

    return value.split(/\s+/);
  }

  function normalizedWords(text) {
    var matches = String(text || "").toLowerCase().match(/[a-z0-9']+/g);
    return matches || [];
  }

  function isStopWord(word) {
    var index;

    for (index = 0; index < STOP_WORDS.length; index += 1) {
      if (STOP_WORDS[index] === word) {
        return true;
      }
    }

    return false;
  }

  function roundToOneDecimal(value) {
    return Math.round(value * 10) / 10;
  }

  function charCount(text) {
    return String(text || "").length;
  }

  function charCountNoSpaces(text) {
    return String(text || "").replace(/\s/g, "").length;
  }

  function wordCount(text) {
    return tokenizeWords(text).length;
  }

  function sentenceCount(text) {
    var value = trim(text);
    var sentences;
    var index;
    var total = 0;

    if (!value) {
      return 0;
    }

    sentences = value.split(/[.!?]+/);

    for (index = 0; index < sentences.length; index += 1) {
      if (trim(sentences[index])) {
        total += 1;
      }
    }

    return total;
  }

  function paragraphCount(text) {
    var value = trim(text);
    var paragraphs;
    var index;
    var total = 0;

    if (!value) {
      return 0;
    }

    paragraphs = value.split(/\n\s*\n+/);

    for (index = 0; index < paragraphs.length; index += 1) {
      if (trim(paragraphs[index])) {
        total += 1;
      }
    }

    return total;
  }

  function readingTime(text) {
    var words = wordCount(text);
    var minutes = Math.ceil(words / 200);

    if (words === 0) {
      return "< 1 min";
    }

    if (minutes < 1) {
      return "< 1 min";
    }

    return String(minutes) + " min";
  }

  function avgWordLength(text) {
    var words = normalizedWords(text);
    var total = 0;
    var index;

    if (!words.length) {
      return 0;
    }

    for (index = 0; index < words.length; index += 1) {
      total += words[index].length;
    }

    return roundToOneDecimal(total / words.length);
  }

  function topWords(text, n) {
    var limit = typeof n === "number" ? n : 5;
    var words = normalizedWords(text);
    var counts = {};
    var results = [];
    var keys;
    var index;
    var word;

    for (index = 0; index < words.length; index += 1) {
      word = words[index];

      if (isStopWord(word)) {
        continue;
      }

      if (!counts[word]) {
        counts[word] = 0;
      }

      counts[word] += 1;
    }

    keys = Object.keys(counts);

    for (index = 0; index < keys.length; index += 1) {
      results.push({
        word: keys[index],
        count: counts[keys[index]]
      });
    }

    results.sort(function (left, right) {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      if (left.word < right.word) {
        return -1;
      }

      if (left.word > right.word) {
        return 1;
      }

      return 0;
    });

    return results.slice(0, limit);
  }

  function analyze(text) {
    return {
      charCount: charCount(text),
      charCountNoSpaces: charCountNoSpaces(text),
      wordCount: wordCount(text),
      sentenceCount: sentenceCount(text),
      paragraphCount: paragraphCount(text),
      readingTime: readingTime(text),
      avgWordLength: avgWordLength(text),
      topWords: topWords(text, 5)
    };
  }

  window.Analyzer = {
    charCount: charCount,
    charCountNoSpaces: charCountNoSpaces,
    wordCount: wordCount,
    sentenceCount: sentenceCount,
    paragraphCount: paragraphCount,
    readingTime: readingTime,
    avgWordLength: avgWordLength,
    topWords: topWords,
    analyze: analyze
  };
}());
