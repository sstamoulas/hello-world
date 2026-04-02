(function () {
  var STOP_WORDS = {
    a: true,
    an: true,
    the: true,
    and: true,
    or: true,
    but: true,
    in: true,
    on: true,
    at: true,
    to: true,
    for: true,
    of: true,
    is: true,
    it: true,
    as: true,
    be: true,
    was: true,
    are: true,
    with: true,
    that: true,
    this: true,
    have: true,
    from: true,
    by: true,
    not: true
  };

  function trim(text) {
    return String(text || "").replace(/^\s+|\s+$/g, "");
  }

  function getWords(text) {
    var value = trim(text);

    if (!value) {
      return [];
    }

    return value.split(/\s+/);
  }

  function getNormalizedWords(text) {
    var matches = String(text || "").toLowerCase().match(/[a-z0-9']+/g);
    return matches || [];
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
    return getWords(text).length;
  }

  function sentenceCount(text) {
    var value = trim(text);
    var sentences;

    if (!value) {
      return 0;
    }

    sentences = value.split(/[.!?]+/).filter(function (sentence) {
      return trim(sentence).length > 0;
    });

    return sentences.length || 1;
  }

  function paragraphCount(text) {
    var value = trim(text);
    var paragraphs;

    if (!value) {
      return 0;
    }

    paragraphs = value.split(/\n\s*\n+/).filter(function (paragraph) {
      return trim(paragraph).length > 0;
    });

    return paragraphs.length || 1;
  }

  function readingTime(text) {
    var words = wordCount(text);
    var minutes;

    if (words < 200) {
      return "< 1 min";
    }

    minutes = Math.ceil(words / 200);
    return String(minutes) + " min";
  }

  function avgWordLength(text) {
    var words = getNormalizedWords(text);
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
    var words = getNormalizedWords(text);
    var counts = {};
    var order = [];
    var index;
    var word;
    var pairs = [];

    for (index = 0; index < words.length; index += 1) {
      word = words[index];

      if (STOP_WORDS[word]) {
        continue;
      }

      if (!counts[word]) {
        counts[word] = 0;
        order.push(word);
      }

      counts[word] += 1;
    }

    for (index = 0; index < order.length; index += 1) {
      word = order[index];
      pairs.push({
        word: word,
        count: counts[word]
      });
    }

    pairs.sort(function (left, right) {
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

    return pairs.slice(0, limit);
  }

  window.Analyzer = {
    charCount: charCount,
    charCountNoSpaces: charCountNoSpaces,
    wordCount: wordCount,
    sentenceCount: sentenceCount,
    paragraphCount: paragraphCount,
    readingTime: readingTime,
    avgWordLength: avgWordLength,
    topWords: topWords
  };
}());
