# COM-13 Real-Time Text Analyzer

## Feature Summary

COM-13 delivers a fully self-contained single-page text analysis utility that runs directly from `file://` with no server, no build tooling, and no external dependencies. The app provides real-time writing statistics, a debounced keyword frequency table, a visible character-limit indicator, and clipboard export of the current stats.

## File Responsibilities

- `index.html` defines the single-page shell, textarea input, action buttons, live statistics cards, character-limit progress UI, and keyword table markup.
- `style.css` defines the visual theme, responsive grid layout, stats card styling, progress bar states, table presentation, and the clear-action flash animation.
- `analyzer.js` exposes the pure `window.TextAnalyzer` namespace and contains all text-analysis functions with no DOM access.
- `app.js` wires the DOM to `TextAnalyzer`, updates all visible UI state on input, debounces keyword rendering, enforces the character limit, handles clear/copy actions, and initializes the zero state.

## Public API

`analyzer.js` exposes a global `TextAnalyzer` object with these pure functions:

- `TextAnalyzer.countCharacters(text)` returns an object with `{ total, noSpaces }`.
- `TextAnalyzer.countWords(text)` returns the whitespace-delimited word count.
- `TextAnalyzer.countSentences(text)` returns the sentence count using `.`, `!`, and `?` delimiters.
- `TextAnalyzer.countParagraphs(text)` returns the paragraph count using one or more blank lines as separators.
- `TextAnalyzer.estimateReadingTime(wordCount)` returns `{ minutes, seconds }` using a 200 words-per-minute estimate.
- `TextAnalyzer.averageWordLength(text)` returns the average normalized word length rounded to one decimal place.
- `TextAnalyzer.countUniqueWords(text)` returns the case-insensitive unique word count.
- `TextAnalyzer.topKeywords(text, n)` returns up to `n` keyword objects sorted by descending frequency and then alphabetically, excluding built-in stop words.

## Runtime Notes

- `index.html` loads `style.css`, then `analyzer.js`, then `app.js`.
- Both scripts are classic scripts loaded with `defer`; no ES module syntax is used.
- The application is offline-capable and does not fetch any remote resources.

## Acceptance Criteria

1. Opening `index.html` directly in Chrome or Firefox via `file://` loads the app with zero console errors.
2. Typing or pasting text into the textarea updates all of the following stats instantly (on each keystroke): Character Count (total), Character Count (no spaces), Word Count, Sentence Count, Paragraph Count, Estimated Reading Time, Average Word Length, Unique Word Count.
3. The top-10 keyword frequency table updates within 100 ms of the user stopping typing and correctly excludes stop words.
4. At 5,000 characters the progress bar turns red, further input is blocked, and a warning message is displayed.
5. Clicking "Clear" resets the textarea and all stat displays to their zero/initial state and triggers the flash animation.
6. Clicking "Copy Stats" writes a plain-text summary of all current stats to the clipboard; the button label changes briefly to "Copied!" or "Copy failed" as appropriate.
7. The layout is responsive: on viewports ≥ 768 px wide the textarea and stats panel are side-by-side; below 768 px they stack vertically with no horizontal overflow.
8. `analyzer.js` contains zero DOM references; all functions are pure (same input → same output) and accessible via the global `window.TextAnalyzer` namespace.
9. `app.js` contains zero text-analysis logic; it only reads from `TextAnalyzer.*` and writes to the DOM.
10. The spec document `docs/specs/COM-13.md` exists and documents the `TextAnalyzer` public API.
