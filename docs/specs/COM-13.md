# COM-13: Real-Time Text Analyzer

## Overview

Real-Time Text Analyzer is a fully static single-page application built with HTML, CSS, and plain
JavaScript. It opens directly from `file://`, performs all analysis synchronously in the browser,
and separates concerns between `analyzer.js` for pure text computation and `app.js` for DOM
updates.

## Runtime Decisions

- `index.html` is the only entry point and loads `style.css`, `analyzer.js`, and `app.js`.
- Both JavaScript files are loaded as classic scripts to preserve `file://` compatibility.
- `analyzer.js` exposes one global API: `window.TextAnalyzer.analyze(text)`.
- `app.js` runs inside an IIFE, waits for `DOMContentLoaded`, and debounces textarea input by
  150 ms before rendering updated stats.
- No network requests, external dependencies, async APIs, or persistent storage are used.

## Stat Definitions

`TextAnalyzer.analyze(text)` returns an object with these keys:

| Key | Definition |
| --- | --- |
| `charCount` | Total characters including spaces, punctuation, and newlines |
| `charCountNoSpaces` | Character count after removing all whitespace |
| `wordCount` | Number of whitespace-delimited tokens |
| `uniqueWordCount` | Count of distinct normalized lowercase words |
| `sentenceCount` | Number of sentence endings matching `.` `!` or `?` followed by whitespace or end of string |
| `paragraphCount` | Number of non-empty blocks separated by one or more blank lines |
| `avgWordsPerSentence` | `wordCount / sentenceCount`, rounded to one decimal place, or `0` if there are no sentences |
| `readingTimeSec` | `Math.ceil((wordCount / 200) * 60)` |
| `speakingTimeSec` | `Math.ceil((wordCount / 130) * 60)` |
| `longestWord` | Longest normalized word; ties keep the first occurrence |
| `topWords` | Top five `{ word, count }` entries by descending frequency after stop-word removal |

## Normalization Rules

- Input is coerced to a string before analysis.
- Word counting splits on whitespace and filters empty input by trimming first.
- Word normalization lowercases each token and strips leading and trailing non-alphanumeric
  characters while preserving apostrophes inside words.
- Empty or whitespace-only input returns zero for numeric stats, an empty string for
  `longestWord`, and an empty array for `topWords`.

## Stop-Word List

The `topWords` metric excludes the following words:

- `a`
- `an`
- `the`
- `is`
- `in`
- `of`
- `to`
- `and`
- `or`
- `but`
- `it`
- `that`

## UI Behavior

- Each stat card in `index.html` uses a `data-stat` attribute that matches an analyzer result key.
- `app.js` updates `.stat-value` content by iterating all `.stat-card` elements generically.
- `readingTimeSec` and `speakingTimeSec` are formatted as `0s`, `45s`, or `2m 15s`.
- `topWords` renders inline as `word ×count, word ×count`.
- When `wordCount === 0`, every stat card displays `—` to create a consistent empty state.
- Cards receive an `is-active` class when their value is non-zero or otherwise meaningful.

## Acceptance Criteria

1. Opening `index.html` directly from `file://` in modern browsers loads the app without module or
   network errors.
2. Typing into the textarea updates all cards through a debounced render cycle within 200 ms.
3. `analyzer.js` contains no DOM references and computes results solely from the provided text.
4. `wordCount` returns `0` for `""`, `1` for `"hello"`, and `3` for `"foo bar baz"`.
5. `sentenceCount` returns `2` for `"Hello world. How are you?"`.
6. `readingTimeSec` returns `60` for a 200-word passage.
7. `topWords` omits the stop-word list, is frequency-sorted descending, and returns at most five
   entries.
8. Empty textarea state displays `—` in every card.
9. The layout collapses to one column at `375px` without horizontal overflow.
10. The layout remains side by side at `1280px`.
