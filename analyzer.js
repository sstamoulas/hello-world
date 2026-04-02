var TextAnalyzer = (function () {
  var STOP_WORDS = new Set([
    "the",
    "a",
    "an",
    "is",
    "it",
    "in",
    "of",
    "to",
    "and",
    "or",
    "but",
    "for",
    "with",
    "that",
    "this",
    "on",
    "at",
    "by",
    "from",
    "be",
    "are",
    "was",
    "were",
    "as",
    "if",
    "then",
    "than",
    "so",
    "not",
    "into",
    "about",
    "over",
    "under",
    "again",
    "etc"
  ]);

  function normalizeText(text) {
    return String(text || "");
  }

  function trimText(text) {
    return normalizeText(text).replace(/^\s+|\s+$/g, "");
  }

  function tokenizeWords(text) {
    var matches = normalizeText(text).toLowerCase().match(/[a-z0-9']+/g);

    return matches || [];
  }

  function countCharacters(text) {
    var value = normalizeText(text);

    return {
      total: value.length,
      noSpaces: value.replace(/\s/g, "").length
    };
  }

  function countWords(text) {
    var value = trimText(text);

    if (!value) {
      return 0;
    }

    return value.split(/\s+/).length;
  }

  function countSentences(text) {
    var segments = trimText(text).split(/[.!?]+/);
    var count = 0;
    var index;

    if (!trimText(text)) {
      return 0;
    }

    for (index = 0; index < segments.length; index += 1) {
      if (trimText(segments[index])) {
        count += 1;
      }
    }

    return count;
  }

  function countParagraphs(text) {
    var segments = trimText(text).split(/\n\s*\n+/);
    var count = 0;
    var index;

    if (!trimText(text)) {
      return 0;
    }

    for (index = 0; index < segments.length; index += 1) {
      if (trimText(segments[index])) {
        count += 1;
      }
    }

    return count;
  }

  function estimateReadingTime(wordCount) {
    var totalSeconds = Math.round((Number(wordCount) || 0) * 60 / 200);

    return {
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60
    };
  }

  function averageWordLength(text) {
    var words = tokenizeWords(text);
    var totalLength = 0;
    var index;

    if (!words.length) {
      return 0;
    }

    for (index = 0; index < words.length; index += 1) {
      totalLength += words[index].length;
    }

    return Math.round((totalLength / words.length) * 10) / 10;
  }

  function countUniqueWords(text) {
    return new Set(tokenizeWords(text)).size;
  }

  function topKeywords(text, n) {
    var limit = typeof n === "number" ? n : 10;
    var words = tokenizeWords(text);
    var counts = {};
    var results = [];
    var keys;
    var index;
    var word;

    for (index = 0; index < words.length; index += 1) {
      word = words[index];

      if (STOP_WORDS.has(word)) {
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

  return {
    countCharacters: countCharacters,
    countWords: countWords,
    countSentences: countSentences,
    countParagraphs: countParagraphs,
    estimateReadingTime: estimateReadingTime,
    averageWordLength: averageWordLength,
    countUniqueWords: countUniqueWords,
    topKeywords: topKeywords
  };
}());
