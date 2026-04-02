# COM-13: Build a Single Page Application (SPA) for real-time text analysis.

## Implementation Specification

status: PLAN
round: 1
ticket: COM-13
---

## Objective
Build a single-page, zero-dependency web application that analyses user-entered text
in real time and displays live statistics (word count, character count, sentence count,
paragraph count, estimated reading time, average word length, and top-5 most-frequent
words). All computation runs client-side with no build step or server required. The
deliverable must open correctly via the `file://` protocol as well as over HTTP.

## Stack & Conventions
- **Pure HTML5 / CSS3 / Vanilla JavaScript (ES5-compatible classic scripts)**
- No framework, no bundler, no npm — plain files opened directly in the browser
- Two JS files with a deliberate separation of concerns:
  - `analyzer.js` — pure analysis functions (no DOM access)
  - `app.js` — DOM wiring, event handling, UI updates
- Both scripts loaded via classic `<script src="...">` tags (NOT `type="module"`) so
  the app works under the `file://` protocol without CORS errors
- `style.css` linked via `<link rel="stylesheet">` in `<head>`
- Responsive layout targeting mobile-first with a single breakpoint at 768 px

## Files to Create or Modify

- `index.html` — Scaffold the full HTML shell: `<textarea>` input, a stats dashboard
  grid of metric cards, a "Top Words" list section, and a toolbar with a Clear button.
  Load `style.css`, then `analyzer.js`, then `app.js` (order matters — app.js depends
  on analyzer.js symbols being in global scope).

- `style.css` — All visual styling: CSS custom properties for the colour palette and
  typography, a responsive two-column card grid (single column on small screens), textarea
  fill styling, metric card styles (label + value layout), top-words list styles, and a
  subtle real-time "pulse" animation on any card whose value just changed.

- `analyzer.js` — Pure analysis module exposed as a plain global object
  `window.Analyzer` (no `export` keyword). Must implement and expose:
  - `charCount(text)` → integer (all characters)
  - `charCountNoSpaces(text)` → integer (excludes whitespace)
  - `wordCount(text)` → integer (split on whitespace, ignore empty tokens)
  - `sentenceCount(text)` → integer (split on `.` `!` `?` sequences, ignore empty)
  - `paragraphCount(text)` → integer (split on one-or-more blank lines)
  - `readingTime(text)` → string e.g. `"< 1 min"` or `"3 min"` (assumes 200 wpm)
  - `avgWordLength(text)` → number rounded to 1 decimal place
  - `topWords(text, n = 5)` → array of `{ word, count }` objects sorted descending,
    excluding common stop-words (a, an, the, and, or, but, in, on, at, to, for, of,
    is, it, as, be, was, are, with, that, this, have, from, by, not)

- `app.js` — DOM controller. On `DOMContentLoaded`:
  1. Grab references to the textarea and every metric card element by `data-metric`
     attribute.
  2. Attach an `input` event listener on the textarea that calls all `Analyzer.*`
     functions and updates the corresponding card values.
  3. Trigger the listener once on load so cards show zeroed state immediately.
  4. Wire the Clear button to empty the textarea and re-trigger analysis.
  5. Apply/remove a CSS class `card--updated` on changed cards (remove after 600 ms via
     `setTimeout`) to drive the pulse animation.

## Implementation Notes

### `file://` Protocol Compatibility
- Do **NOT** use `import` / `export` or `<script type="module">`. Chrome blocks
  cross-file module fetches from `file://` origins with a CORS error.
- Instead, `analyzer.js` assigns its public API to `window.Analyzer = { ... }` so
  `app.js` can call `Analyzer.wordCount(text)` etc. without any module system.
- Wrap `app.js` logic in a `(function () { ... }())` IIFE to avoid polluting global
  scope; `analyzer.js` may do the same internally.

### Script Load Order in `index.html`
```html
<!-- at the bottom of <body>, in this exact order -->
<script src="analyzer.js"></script>
<script src="app.js"></script>
```
`app.js` references `window.Analyzer`, which must be defined first.

### Metric Card HTML Pattern
Each stat card should use a `data-metric` attribute for zero-friction DOM lookup:
```html
<div class="card" data-metric="wordCount">
  <span class="card__value">0</span>
  <span class="card__label">Words</span>
</div>
```
`app.js` can then do:
```js
document.querySelector('[data-metric="wordCount"] .card__value').textContent = count;
```

### Top-Words Section
Render the top-5 list as an ordered `<ol id="top-words">`. Each `<li>` shows the word
and its count. Clear and re-render the entire list on every `input` event. If fewer
than 5 unique non-stop-words exist, show only those that do.

### Edge Cases in `analyzer.js`
- Empty string or whitespace-only input must return `0` / `"< 1 min"` gracefully —
  never `NaN` or `undefined`.
- `wordCount` must not count empty strings that result from multiple consecutive spaces.
- `sentenceCount` should return at least `1` when the text is non-empty and contains no
  terminal punctuation (treat the whole text as one sentence).
- `paragraphCount` should return at least `1` for any non-empty, non-whitespace input.

### Responsive Layout
- Cards grid: `display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))`
  so it naturally reflows from 1 to many columns as viewport grows.
- Textarea: minimum height 200 px, grows to fill available space using
  `flex: 1` inside a column flex container; `resize: vertical` allowed.

### Colour Palette (CSS custom properties)
```css
:root {
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-accent: #38bdf8;
  --color-text: #e2e8f0;
  --color-muted: #94a3b8;
}
```
Dark theme by default; no light/dark toggle required.

## Browser & Runtime Compatibility
- **`file://` protocol**: All JavaScript is split across exactly two classic `<script>`
  files with no ES module syntax. No `import`/`export` anywhere. This is a hard
  requirement.
- **Target browsers**: last 2 versions of Chrome, Firefox, Safari, Edge. No IE11
  support needed.
- **No polyfills required**: Only APIs used are `addEventListener`, `querySelector`,
  `querySelectorAll`, `textContent`, `setTimeout` — universally supported.

## Constraints
- Do NOT use any external libraries, CDN scripts, or frameworks
- Do NOT use `<script type="module">` or ES module `import`/`export` syntax
- Do NOT add a build system, `package.json`, or any tooling configuration files
- Do NOT modify `README.md` (out of scope for this ticket)
- `analyzer.js` must remain a pure-logic file with **zero DOM access** — no
  `document`, `window` (except the final `window.Analyzer = …` assignment), or
  `console` calls in the shipped code
- All stats must update synchronously on every keystroke — no debouncing, no async

## Acceptance Criteria
1. Opening `index.html` directly via `file://` in Chrome/Firefox shows the full UI
   with no console errors (especially no CORS / module errors).
2. Typing into the textarea immediately updates all metric cards without any page
   reload or button press.
3. **Word count** correctly returns `4` for the input `"  Hello,   world! How are  "`.
4. **Character count** equals the full `.length` of the raw input string.
5. **Character count (no spaces)** excludes all whitespace characters.
6. **Sentence count** returns `3` for `"Hello. How are you? Fine!"` and `1` for
   `"No punctuation here"`.
7. **Paragraph count** returns `2` for a string containing one blank line separating
   two blocks of text.
8. **Reading time** displays `"< 1 min"` for inputs under 200 words and `"2 min"` for
   an input of exactly 400 words.
9. **Top Words** list shows at most 5 entries, excludes the defined stop-words, and is
   ordered from most to least frequent.
10. **Average word length** displays `"0.0"` for empty input and a correct 1-decimal
    value for non-empty input.
11. Clicking **Clear** empties the textarea and resets all metric cards to their zero
    state.
12. The layout is usable on a 375 px wide viewport (no horizontal scroll, no
    overlapping elements).
13. `analyzer.js` contains no references to `document` or any DOM API (verified by
    code inspection).
```

---

## Review & Approval


All acceptance criteria are met and all constraints are respected. Here is a summary of what was verified:

**`file://` compatibility (AC 1):** `<script type="module">` and all `import`/`export` syntax have been removed. `analyzer.js` exposes `window.Analyzer` via a classic IIFE, loaded before `app.js` in the correct order. No CORS/module errors will occur.

**Real-time updates (AC 2):** `app.js` attaches an `input` listener on the textarea and calls all `Analyzer.*` functions synchronously on every keystroke.

**Word count (AC 3):** `getWords` trims then splits on `\s+`, so `"  Hello,   world! How are  "` correctly yields `["Hello,", "world!", "How", "are"]` → 4.

**Character counts (AC 4, 5):** `charCount` returns raw `.length`; `charCountNoSpaces` strips all `/\s/` characters first.

**Sentence count (AC 6):** Splits on `/[.!?]+/`, filters empty tokens, and returns `sentences.length || 1` for non-empty text with no terminal punctuation.

**Paragraph count (AC 7):** Splits on `/\n\s*\n+/`, filters blank chunks, returns at least `1` for non-empty input.

**Reading time (AC 8):** `words < 200` → `"< 1 min"`; `Math.ceil(400/200) = 2` → `"2 min"`.

**Top Words (AC 9):** Excludes all plan-specified stop-words, sorts descending by count, slices to 5.

**Average word length (AC 10):** Returns numeric `0` for empty input; `app.js` calls `.toFixed(1)` → `"0.0"`.

**Clear button (AC 11):** Sets `textarea.value = ""` then calls `updateMetrics()`, resetting all cards.

**Responsive layout (AC 12):** `repeat(auto-fill, minmax(140px, 1fr))` grid reflows naturally; mobile media query removes horizontal layout at < 768 px.

**No DOM in `analyzer.js` (AC 13):** The file contains zero references to `document`; only the final `window.Analyzer = { … }` assignment touches `window`.

---

## References

- JIRA: [COM-13](https://everestlogix.atlassian.net/browse/COM-13)
- Branch: `feature/COM-13-build-a-single-page-application-spa-for-`
- Rounds to approval: 1

---
*Generated by ai-orchestrator on 2026-04-02T11:56:44Z*
