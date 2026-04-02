(function () {
  "use strict";

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
    with: true,
    is: true,
    are: true,
    was: true,
    were: true,
    be: true,
    been: true,
    being: true,
    have: true,
    has: true,
    had: true,
    do: true,
    does: true,
    did: true,
    will: true,
    would: true,
    could: true,
    should: true,
    i: true,
    you: true,
    he: true,
    she: true,
    it: true,
    we: true,
    they: true,
    this: true,
    that: true
  };

  function normalizeText(text) {
    if (text === null || typeof text === "undefined") {
      return "";
    }

    return String(text);
  }

  function getWords(text) {
    var trimmed = text.trim();

    if (!trimmed) {
      return [];
    }

    return trimmed.split(/\s+/).filter(Boolean);
  }

  function getSentenceCount(text) {
    var matches;

    if (!text.trim()) {
      return 0;
    }

    matches = text.match(/[^.!?]*[.!?]+/g);

    return matches ? matches.length : 0;
  }

  function getParagraphCount(text) {
    if (!text.trim()) {
      return 0;
    }

    return text.split(/\n\s*\n/).filter(function (paragraph) {
      return paragraph.trim().length > 0;
    }).length;
  }

  function countSyllables(word) {
    var normalizedWord = word.toLowerCase().replace(/[^a-z]/g, "");
    var matches;

    if (!normalizedWord.length) {
      return 0;
    }

    if (normalizedWord.length <= 3) {
      return 1;
    }

    normalizedWord = normalizedWord.replace(/e$/, "");
    matches = normalizedWord.match(/[aeiouy]+/g);

    return Math.max(1, matches ? matches.length : 1);
  }

  function getSyllableCount(words) {
    var total = 0;
    var index;

    for (index = 0; index < words.length; index += 1) {
      total += countSyllables(words[index]);
    }

    return total;
  }

  function clampScore(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getFleschReadingEase(wordCount, sentenceCount, syllableCount) {
    var score;

    if (wordCount === 0 || sentenceCount === 0) {
      return null;
    }

    score = 206.835 - (1.015 * (wordCount / sentenceCount)) - (84.6 * (syllableCount / wordCount));

    return clampScore(score, 0, 100);
  }

  function getFleschKincaidGrade(wordCount, sentenceCount, syllableCount) {
    var grade;

    if (wordCount === 0 || sentenceCount === 0) {
      return null;
    }

    grade = (0.39 * (wordCount / sentenceCount)) + (11.8 * (syllableCount / wordCount)) - 15.59;

    return clampScore(grade, 0, 18);
  }

  function getAverageWordLength(words) {
    var total = 0;
    var index;

    if (!words.length) {
      return "0.0";
    }

    for (index = 0; index < words.length; index += 1) {
      total += words[index].length;
    }

    return (total / words.length).toFixed(1);
  }

  function getReadingTime(wordCount) {
    var minutes;

    if (wordCount < 200) {
      return "< 1 min";
    }

    minutes = Math.ceil(wordCount / 200);

    return String(minutes) + " min read";
  }

  function normalizeTopWord(word) {
    return word.toLowerCase().replace(/[^a-z0-9']/g, "");
  }

  function getTopWords(words) {
    var counts = {};
    var entries = [];
    var index;
    var word;

    for (index = 0; index < words.length; index += 1) {
      word = normalizeTopWord(words[index]);

      if (!word || STOP_WORDS[word]) {
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

  function analyze(text) {
    var value = normalizeText(text);
    var words = getWords(value);
    var sentenceCount = getSentenceCount(value);
    var syllableCount = getSyllableCount(words);

    return {
      charCount: value.length,
      charNoSpaces: value.replace(/\s/g, "").length,
      wordCount: words.length,
      sentenceCount: sentenceCount,
      paragraphCount: getParagraphCount(value),
      avgWordLength: getAverageWordLength(words),
      readingTime: getReadingTime(words.length),
      topWords: getTopWords(words),
      syllableCount: syllableCount,
      fleschReadingEase: getFleschReadingEase(words.length, sentenceCount, syllableCount),
      fleschKincaidGrade: getFleschKincaidGrade(words.length, sentenceCount, syllableCount)
    };
  }

  window.Analyzer = {
    analyze: analyze
  };
}());
