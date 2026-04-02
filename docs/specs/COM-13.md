# COM-13 Real-Time Text Analyzer

## Feature Overview

COM-13 adds a self-contained single-page text analysis utility that runs directly from `index.html` with no server, build tooling, or external dependencies. Users type into a single textarea and the page updates seven visible metrics immediately on each keystroke.

The page is designed to open correctly from a local filesystem path. The JavaScript is split into two classic scripts: `analyzer.js` defines `window.TextAnalyzer`, and `app.js` reads from that global to update the DOM.

## File Responsibilities

`index.html`
- Defines the page shell, textarea, and stat cards.
- Loads `style.css`, then `analyzer.js`, then `app.js`.
- Uses `data-stat` attributes on stat values so the UI can update them generically.

`style.css`
- Defines the visual theme with custom properties on `:root`.
- Uses CSS Grid for the main two-column layout and the stat card grid.
- Switches to a single-column layout at `768px` and below.
- Applies a dimmed presentation to the stats panel when the body has the `.empty` class.

`analyzer.js`
- Exposes `window.TextAnalyzer.analyze(text)`.
- Contains no DOM access.
- Computes all text metrics with string operations and regular expressions only.

`app.js`
- Waits for `DOMContentLoaded`.
- Subscribes to the textarea `input` event.
- Calls `window.TextAnalyzer.analyze(value)` on every change.
- Updates all stat cards in one loop using their `data-stat` values.
- Formats reading time for display and toggles `body.empty` for blank input.

## Returned Analysis Shape

`window.TextAnalyzer.analyze(text)` returns an object with:

- `charCount`: total characters, including spaces and newlines.
- `charCountNoSpaces`: total characters after removing all whitespace.
- `wordCount`: whitespace-delimited token count.
- `sentenceCount`: number of sentence-ending punctuation groups using `.`, `!`, or `?` when followed by whitespace or end-of-input.
- `paragraphCount`: number of non-empty blocks separated by one or more blank lines.
- `uniqueWordCount`: count of distinct words after lowercasing and trimming leading or trailing punctuation.
- `avgWordLength`: average normalized word length rounded to one decimal place.
- `readingTimeSeconds`: `Math.ceil((wordCount / 238) * 60)`.

## Implemented Edge Cases

- Empty string returns `0` for every numeric metric.
- Whitespace-only input returns `0` for all numeric metrics and displays `< 1 min` for reading time.
- Consecutive spaces and line breaks are treated as delimiters, not extra words.
- Words containing apostrophes, such as `don't`, remain a single normalized word.
- Leading and trailing punctuation is removed before uniqueness and average-length calculations.
- Paragraph counting ignores empty blocks created by repeated blank lines.

## Display Rules

- Reading time displays as `< 1 min` for `0` through `59` seconds.
- Reading time displays as `1 min` for exactly `60` seconds.
- Reading time displays as `1 min {s} sec` for `61` through `119` seconds.
- Reading time displays as `{m} min` when the remaining seconds are `0`.
- Reading time displays as `{m} min {s} sec` when the remaining seconds are greater than `0`.

## Verified Example

Calling `window.TextAnalyzer.analyze("Hello world. How are you?")` returns:

```js
{
  charCount: 25,
  charCountNoSpaces: 21,
  wordCount: 5,
  sentenceCount: 2,
  paragraphCount: 1,
  uniqueWordCount: 5,
  avgWordLength: 3.8,
  readingTimeSeconds: 2
}
```

## Known Limits

- Sentence counting is punctuation-based and does not attempt full natural-language parsing.
- Word normalization is optimized for standard Latin letters, digits, and apostrophes.
- Average word length is calculated from normalized words, so surrounding punctuation does not contribute to the average.
