# COM-13: Build a Single Page Application (SPA) for real-time text analysis.

## Implementation Specification

status: PLAN
round: 1
ticket: COM-13
---

## Objective
Build a fully self-contained, single-page Real-Time Text Analyzer web application that
provides live statistics as the user types into a textarea. The app must work when opened
directly from the filesystem (`file://` protocol) with no build step and no server
required. All statistics update on every keystroke with zero latency.

## Stack & Conventions
- **Pure HTML5 / CSS3 / Vanilla JavaScript** — no frameworks, no build tooling, no
  package manager.
- **Four-file structure** dictated by the ticket: `index.html`, `style.css`,
  `analyzer.js`, `app.js`.
- Both JS files are loaded as **classic `<script>` tags** (not ES modules) to guarantee
  `file://` compatibility.
- `analyzer.js` is loaded *before* `app.js` so its exported functions are available as
  globals on `window`.
- CSS uses custom properties (`--var`) for theming and `CSS Grid` / `Flexbox` for
  responsive layout.
- No external fonts, icon libraries, or CDN dependencies — the app must be fully
  self-contained.

## Files to Create or Modify

- `index.html` — Create. The application shell. Contains the `<textarea>` input, a
  stats dashboard grid, and a keyword-frequency table. Loads `style.css`, then
  `analyzer.js`, then `app.js` as classic scripts. Includes a `<meta
  name="viewport">` tag for responsive behaviour.

- `style.css` — Create. Full responsive stylesheet. Defines CSS custom properties for
  colours and spacing. Implements a two-column desktop layout (textarea left, stats
  panel right) that collapses to a single column on narrow viewports (`max-width:
  768px`). Styles the stats cards, the keyword frequency table, a visible character
  limit progress bar, and a "cleared" flash animation.

- `analyzer.js` — Create. Pure analysis module — **no DOM access**. Exposes all
  functions as properties on a global `TextAnalyzer` object (namespace pattern). Must
  implement and export the following functions:
  - `countCharacters(text)` → `{ total, noSpaces }`
  - `countWords(text)` → integer (split on whitespace, ignore empty tokens)
  - `countSentences(text)` → integer (split on `.`, `!`, `?`, filter empty)
  - `countParagraphs(text)` → integer (split on `\n\n+`, filter empty)
  - `estimateReadingTime(wordCount)` → `{ minutes, seconds }` (assumes 200 wpm)
  - `averageWordLength(text)` → float rounded to 1 decimal place
  - `countUniqueWords(text)` → integer (case-insensitive)
  - `topKeywords(text, n = 10)` → array of `{ word, count }` objects sorted
    descending, excluding a built-in stop-word list (the, a, an, is, it, in, of,
    to, and, or, but, for, with, that, this, etc.)

- `app.js` — Create. DOM controller. Wires the `<textarea>` `input` event to
  `TextAnalyzer.*` calls and updates the dashboard. Must also implement:
  - Debounce logic for the keyword table (100 ms) to avoid thrashing on rapid input.
  - A character-limit warning (configurable constant `MAX_CHARS = 5000`) that turns
    the progress bar red and disables additional input at the limit.
  - A "Clear" button handler that resets the textarea and all stats to their zero
    state with a brief CSS flash animation.
  - A "Copy Stats" button that writes a plain-text summary of all current stats to
    the clipboard via `navigator.clipboard.writeText`.
  - On `DOMContentLoaded`, initialise all stat displays to `0` / `0 sec` so the
    dashboard is never empty.

- `docs/specs/COM-13.md` — Create. The spec document for this ticket (written as part
  of pipeline finalisation). Should document the feature, file responsibilities, and
  the public API of `TextAnalyzer`.

## Implementation Notes

### File loading order
```html
<link rel="stylesheet" href="style.css">
<!-- analyzer first — defines window.TextAnalyzer -->
<script src="analyzer.js"></script>
<!-- app second — consumes window.TextAnalyzer -->
<script src="app.js"></script>
```
Both scripts must be placed at the bottom of `<body>` (before `</body>`) OR use the
`defer` attribute on both tags. Using `defer` is preferred as it keeps the `<head>`
clean and preserves execution order.

### Namespace pattern for analyzer.js
```js
// analyzer.js
var TextAnalyzer = (function () {
  var STOP_WORDS = new Set([/* ... */]);

  function countWords(text) { /* ... */ }
  // ... other functions

  return {
    countCharacters,
    countWords,
    countSentences,
    countParagraphs,
    estimateReadingTime,
    averageWordLength,
    countUniqueWords,
    topKeywords,
  };
}());
```
This keeps everything off the global scope except the single `TextAnalyzer` object.

### IIFE wrapper for app.js
```js
// app.js
(function () {
  'use strict';
  // all DOM wiring here
}());
```

### Stat card HTML pattern
Each metric should be a `<div class="stat-card">` with a `<span class="stat-value"
id="stat-words">0</span>` and a `<span class="stat-label">Words</span>`. This makes
targeted DOM updates cheap (`getElementById` + `textContent`).

### Keyword table
Render the top-10 keyword table as a `<table>` inside a `<div
id="keyword-section">`. On each debounced update, clear `tbody` innerHTML and
re-render rows. Show an empty-state message ("Start typing to see keywords…") when
the word count is zero.

### Browser & Runtime Compatibility (`file://` protocol)
- **Do NOT use ES modules** (`import`/`export` or `<script type="module">`). Chrome
  and Firefox block cross-origin module fetches from `file://` paths.
- Both `analyzer.js` and `app.js` are **classic scripts** — no `type="module"`.
- No `fetch()` calls, no `XMLHttpRequest` — all data is in-memory.
- `navigator.clipboard` is available in modern browsers; wrap the "Copy Stats" call
  in a `try/catch` and fall back to a visible "Copied!" / "Copy failed" status
  message in the UI.
- No external font or icon CDN links — use system font stack:
  `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.

## Constraints
- Do NOT introduce any npm packages, build tools, or bundlers.
- Do NOT use ES module syntax (`import`/`export`/`type="module"`).
- Do NOT fetch any remote resources (fonts, scripts, stylesheets) — the app must work
  fully offline.
- Do NOT modify any files outside the four application files and the spec doc.
- Preserve the exact four-file structure specified in the ticket:
  `index.html`, `style.css`, `analyzer.js`, `app.js`.

## Acceptance Criteria
1. Opening `index.html` directly in Chrome or Firefox via `file://` loads the app with
   zero console errors.
2. Typing or pasting text into the textarea updates **all** of the following stats
   instantly (on each keystroke): Character Count (total), Character Count (no
   spaces), Word Count, Sentence Count, Paragraph Count, Estimated Reading Time,
   Average Word Length, Unique Word Count.
3. The top-10 keyword frequency table updates within 100 ms of the user stopping
   typing and correctly excludes stop words.
4. At 5,000 characters the progress bar turns red, further input is blocked, and a
   warning message is displayed.
5. Clicking "Clear" resets the textarea and all stat displays to their zero/initial
   state and triggers the flash animation on the textarea.
6. Clicking "Copy Stats" writes a plain-text summary of all current stats to the
   clipboard; the button label changes briefly to "Copied!" or "Copy failed" as
   appropriate.
7. The layout is responsive: on viewports ≥ 768 px wide the textarea and stats panel
   are side-by-side; below 768 px they stack vertically with no horizontal overflow.
8. `analyzer.js` contains zero DOM references; all functions are pure (same input →
   same output) and accessible via the global `window.TextAnalyzer` namespace.
9. `app.js` contains zero text-analysis logic; it only reads from `TextAnalyzer.*`
   and writes to the DOM.
10. The spec document `docs/specs/COM-13.md` exists and documents the `TextAnalyzer`
    public API.
```

---

## Review & Approval


All ten acceptance criteria are satisfied and every constraint from the plan is respected.

**AC1 (file:// compatibility):** Both scripts are loaded as classic `<script defer>` tags (no `type="module"`) in `<head>`, preserving execution order. `analyzer.js` exposes `window.TextAnalyzer` via an IIFE namespace pattern; `app.js` is wrapped in its own IIFE with `'use strict'`. No ES module syntax anywhere.

**AC2 (live stats on every keystroke):** `textInput.addEventListener("input", ...)` calls `refresh()` → `collectStats()` → all eight `TextAnalyzer.*` functions synchronously. All eight required stats (characters total, characters no-spaces, words, sentences, paragraphs, reading time, average word length, unique words) are mapped to DOM elements by ID and updated on every input event.

**AC3 (keyword table ≤ 100 ms debounce):** `renderKeywordsDebounced` is built with `debounce(fn, 100)`. `TextAnalyzer.topKeywords` uses `STOP_WORDS` as a `Set` for O(1) exclusion. Default `n = 10` matches the plan.

**AC4 (5 000-char limit):** `MAX_CHARS = 5000`. `enforceMaxLength()` slices the value; the `maxlength="5000"` attribute blocks browser-level paste overflow. `progress-bar.is-limit` turns the bar red; `setWarningState(true)` renders the warning message.

**AC5 (Clear button):** Resets `textInput.value`, calls `refresh("")` and `renderKeywords("")` for immediate zero-state, fires the `is-cleared` CSS animation, and restores focus.

**AC6 (Copy Stats):** `navigator.clipboard.writeText()` wrapped in `try/catch` with `.then`/rejection handlers. Button label changes to `"Copied!"` or `"Copy failed"` for `COPY_STATUS_MS` duration.

**AC7 (responsive ≥ 768 px):** `@media (min-width: 768px)` applies the two-column grid; below 768 px the layout stacks vertically with `display: block` overrides for `.panel__header` and `.editor-footer`. No horizontal overflow rules violated.

**AC8 (pure analyzer.js):** `analyzer.js` has zero DOM references; all eight exported functions are deterministic pure functions accessible as `window.TextAnalyzer.*`.

**AC9 (app.js no analysis logic):** `app.js` contains only DOM wiring, formatting helpers (`formatReadingTime`), and delegation to `TextAnalyzer.*`. No text-analysis computation is performed directly.

**AC10 (spec doc):** `docs/specs/COM-13.md` documents the feature, file responsibilities, the complete `TextAnalyzer` public API with signatures and return types, runtime notes, and all ten acceptance criteria verbatim.

---

## References

- JIRA: [COM-13](https://everestlogix.atlassian.net/browse/COM-13)
- Branch: `feature/COM-13-build-a-single-page-application-spa-for-`
- Rounds to approval: 1

---
*Generated by ai-orchestrator on 2026-04-02T12:47:16Z*
