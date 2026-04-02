(function (root) {
  "use strict";

  var STOP_WORDS = {
    a: true,
    an: true,
    the: true,
    is: true,
    in: true,
    of: true,
    to: true,
    and: true,
    or: true,
    but: true,
    it: true,
    that: true
  };

  function normalizeText(text) {
    if (text === null || typeof text === "undefined") {
      return "";
    }

    return String(text);
  }

  function getTrimmedText(text) {
    return normalizeText(text).replace(/^\s+|\s+$/g, "");
  }

  function getRawWords(text) {
    var trimmedText = getTrimmedText(text);

    if (!trimmedText) {
      return [];
    }

    return trimmedText.split(/\s+/);
  }

  function normalizeWord(word) {
    return String(word || "")
      .toLowerCase()
      .replace(/^[^a-z0-9']+|[^a-z0-9']+$/gi, "");
  }

  function getNormalizedWords(words) {
    var normalizedWords = [];
    var index;
    var normalizedWord;

    for (index = 0; index < words.length; index += 1) {
      normalizedWord = normalizeWord(words[index]);

      if (normalizedWord) {
        normalizedWords.push(normalizedWord);
      }
    }

    return normalizedWords;
  }

  function getSentenceCount(text) {
    var trimmedText = getTrimmedText(text);
    var matches;

    if (!trimmedText) {
      return 0;
    }

    matches = trimmedText.match(/[.!?]+(?=\s|$)/g);

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

    for (index = 0; index < words.length; index += 1) {
      if (!seen[words[index]]) {
        seen[words[index]] = true;
        count += 1;
      }
    }

    return count;
  }

  function getLongestWord(words) {
    var longestWord = "";
    var index;

    for (index = 0; index < words.length; index += 1) {
      if (words[index].length > longestWord.length) {
        longestWord = words[index];
      }
    }

    return longestWord;
  }

  function getTopWords(words) {
    var counts = {};
    var entries = [];
    var index;
    var word;

    for (index = 0; index < words.length; index += 1) {
      word = words[index];

      if (STOP_WORDS[word]) {
        continue;
      }

      if (!counts[word]) {
        counts[word] = 0;
      }

      counts[word] += 1;
    }

    for (word in counts) {
      if (Object.prototype.hasOwnProperty.call(counts, word)) {
        entries.push({
          word: word,
          count: counts[word]
        });
      }
    }

    entries.sort(function (left, right) {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.word.localeCompare(right.word);
    });

    return entries.slice(0, 5);
  }

  function roundToOneDecimal(value) {
    return Math.round(value * 10) / 10;
  }

  function analyze(text) {
    var value = normalizeText(text);
    var rawWords = getRawWords(value);
    var words = getNormalizedWords(rawWords);
    var wordCount = rawWords.length;
    var sentenceCount = getSentenceCount(value);

    return {
      charCount: value.length,
      charCountNoSpaces: value.replace(/\s/g, "").length,
      wordCount: wordCount,
      uniqueWordCount: getUniqueWordCount(words),
      sentenceCount: sentenceCount,
      paragraphCount: getParagraphCount(value),
      avgWordsPerSentence: sentenceCount ? roundToOneDecimal(wordCount / sentenceCount) : 0,
      readingTimeSec: Math.ceil((wordCount / 200) * 60),
      speakingTimeSec: Math.ceil((wordCount / 130) * 60),
      longestWord: getLongestWord(words),
      topWords: getTopWords(words)
    };
  }

  root.TextAnalyzer = {
    analyze: analyze
  };
}(typeof window !== "undefined" ? window : this));
