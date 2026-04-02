# COM-13: Build a Single Page Application (SPA) for real-time text analysis.

## Implementation Specification

status: PLAN
round: 1
ticket: COM-13
---

## Objective
Build a fully self-contained, single-page web application called **Real-Time Text Analyzer** that
accepts free-form text input and instantly displays live statistics about it (word count, character
count, sentence count, reading time, etc.). All computation lives in a dedicated `analyzer.js`
module loaded as a classic script; `app.js` owns the DOM and event wiring. The app must open
directly from the filesystem (`file://`) with no build step or local server required.

## Stack & Conventions
- **Language / runtime:** Vanilla HTML5 + CSS3 + plain JavaScript (ES6, no bundler, no framework)
- **Delivery:** Static files only — `index.html` is the entry point, `style.css` handles all
  presentation, `analyzer.js` is a pure-logic library, `app.js` is the UI controller
- **Module strategy:** Classic `<script>` tags (NOT `<script type="module">`). `analyzer.js` is
  loaded first and exposes a single global object `TextAnalyzer`; `app.js` consumes it. This
  guarantees `file://` compatibility (no cross-origin CORS block from ES module fetches).
- **No external dependencies** — zero CDN links, zero npm packages.

## Files to Create or Modify

- `index.html` — **Create.** The single HTML page. Contains: a branded header, a full-width
  `<textarea id="input-text">` for user input, and a stats dashboard `<section id="stats">` that
  renders all computed metrics as labelled cards. Load `style.css` in `<head>`, then load
  `analyzer.js` followed by `app.js` at the bottom of `<body>` (in that order, classic scripts).

- `style.css` — **Create.** Full responsive stylesheet. Key rules:
  - CSS custom properties (variables) for colour palette, spacing, and font sizes.
  - Flexbox/Grid layout: textarea on the left (or top on mobile), stats cards on the right (or
    below on mobile). Single-column below `768px`.
  - Stats cards: each card is a `<div class="stat-card">` with a `<span class="stat-value">` and
    a `<span class="stat-label">`. Cards visually highlight on non-zero values.
  - Smooth transition on value changes (CSS `transition` on `stat-value`).
  - Accessible focus ring on the textarea.
  - Dark-mode support via `@media (prefers-color-scheme: dark)`.

- `analyzer.js` — **Create.** Pure computation, no DOM access. Exposes one global:
  ```js
  window.TextAnalyzer = {
    analyze(text) { /* returns stats object */ }
  };
  ```
  `analyze(text)` returns an object with **all** of the following keys:
  | Key | Description |
  |-----|-------------|
  | `charCount` | Total characters including spaces |
  | `charCountNoSpaces` | Characters excluding whitespace |
  | `wordCount` | Words (split on whitespace, filter empty) |
  | `uniqueWordCount` | Distinct lowercase words |
  | `sentenceCount` | Sentences (split on `.!?` followed by space or end) |
  | `paragraphCount` | Non-empty paragraphs (split on `\n\n+`) |
  | `avgWordsPerSentence` | `wordCount / sentenceCount`, rounded to 1 decimal; `0` if no sentences |
  | `readingTimeSec` | `Math.ceil((wordCount / 200) * 60)` — reading at 200 wpm |
  | `speakingTimeSec` | `Math.ceil((wordCount / 130) * 60)` — speaking at 130 wpm |
  | `longestWord` | The single longest word (ties: first occurrence) |
  | `topWords` | Array of `{ word, count }` — top 5 most frequent words, ignoring stop-words (a, an, the, is, in, of, to, and, or, but, it, that) |

  All values must be derived deterministically from the raw `text` string alone. No state, no
  side effects.

- `app.js` — **Create.** DOM controller. Wrap everything in an IIFE to avoid global pollution.
  - On `DOMContentLoaded`, bind an `input` event listener on `#input-text`.
  - Debounce the handler by **150 ms** (simple `setTimeout`/`clearTimeout` pattern).
  - On each firing: call `TextAnalyzer.analyze(textarea.value)`, then update every stat card's
    `.stat-value` inner text with the formatted result.
  - Format helpers (inline, not exported):
    - `formatTime(sec)` → `"0s"` / `"45s"` / `"2m 15s"` etc.
  - Render `topWords` as a compact inline list inside its card: `"the ×12, a ×8, …"`.
  - On empty input (wordCount === 0), reset all cards to `"—"` (em dash) rather than `"0"`, for a
    cleaner empty state.
  - Trigger an initial analysis on page load so the empty-state `"—"` values show immediately.

- `docs/specs/COM-13.md` — **Create.** Spec document capturing the feature decisions, stat
  definitions, and acceptance criteria. Written in Markdown. This is documentation only — it does
  not affect runtime behaviour.

## Implementation Notes

### `file://` Protocol Compatibility
> **Critical constraint.** The app must work when `index.html` is double-clicked in Finder/Explorer.
> Chrome blocks cross-origin `import` fetches on `file://`, so ES modules are forbidden.
> Load order: `analyzer.js` before `app.js`. Both are classic `<script src="...">` tags.
> `TextAnalyzer` lives on `window` so `app.js` can reference it without imports.

### Debounce in `app.js`
Use a simple closure-based debounce — no library:
```js
let debounceTimer;
textarea.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(render, 150);
});
```

### Stop-word list in `analyzer.js`
Hard-code a small constant array of ~12 common English stop-words used to filter `topWords`.
Do not fetch any external resource.

### Stat card HTML pattern
Each stat card in `index.html` should carry a `data-stat` attribute matching the key returned
by `analyze()`, so `app.js` can query them generically:
```html
<div class="stat-card" data-stat="wordCount">
  <span class="stat-value">—</span>
  <span class="stat-label">Words</span>
</div>
```
`app.js` iterates `document.querySelectorAll('.stat-card')` and updates each by its `data-stat`.
The `topWords` and time cards need special formatting — handle them by `data-stat` name.

### Responsive layout target
- ≥ 768 px: two-column grid. Textarea takes ~55% width; stats panel takes ~45%.
- < 768 px: single column, textarea first, stats cards below in a 2-up grid.

## Browser & Runtime Compatibility

- **`file://` protocol**: Required to work. No `<script type="module">`, no cross-file `import`.
  Both JS files are loaded as classic scripts. `analyzer.js` attaches to `window.TextAnalyzer`.
- **ES6 features**: Arrow functions, `const`/`let`, template literals, `Array` methods
  (`filter`, `map`, `reduce`) — all safe in any browser from 2017 onward; no transpilation needed.
- **No external network requests** at any point (no CDN fonts, no analytics, no API calls).

## Constraints
- Do NOT use any JavaScript framework (React, Vue, Svelte, etc.)
- Do NOT use `<script type="module">` or `import`/`export` syntax
- Do NOT add any CDN or external resource links
- Do NOT use `localStorage`, `fetch`, or any async API — analysis is synchronous
- Preserve the exact five-file structure: `index.html`, `style.css`, `analyzer.js`, `app.js`,
  `docs/specs/COM-13.md` — no additional files

## Acceptance Criteria
1. Opening `index.html` directly via `file://` in Chrome, Firefox, and Safari shows the app with
   no console errors.
2. Typing in the textarea causes all stat cards to update within 200 ms without any page reload.
3. `analyzer.js` is free of DOM references; it can be `require()`-d in Node.js (after removing the
   `window.TextAnalyzer =` assignment) and all functions return deterministically correct values.
4. `wordCount` returns `0` for an empty string, `1` for `"hello"`, and `3` for `"foo bar baz"`.
5. `sentenceCount` returns `2` for `"Hello world. How are you?"`.
6. `readingTimeSec` for a 200-word passage returns exactly `60`.
7. `topWords` excludes every word in the stop-word list and returns at most 5 entries sorted
   descending by frequency.
8. When the textarea is empty, every stat card displays `"—"` (not `"0"` or blank).
9. At viewport width 375 px the layout is a single column with no horizontal overflow.
10. At viewport width 1280 px the textarea and stats panel are displayed side by side.
11. `docs/specs/COM-13.md` exists and documents all stat definitions and the stop-word list used.
```

---

## Review & Approval


All acceptance criteria are satisfied and every constraint from the plan is respected.

**AC1 (file:// compatibility):** Both `<script src="analyzer.js">` and `<script src="app.js">` are placed at the bottom of `<body>` as classic scripts with no `type="module"`. No `import`, `export`, or ES-module syntax appears anywhere in the codebase. Load order is correct: `analyzer.js` before `app.js`.

**AC2 (debounced updates within 200 ms):** `app.js` uses a `clearTimeout`/`setTimeout` closure-based debounce at exactly 150 ms before calling `render()`, satisfying the ≤200 ms requirement.

**AC3 (no DOM references in analyzer.js):** `analyzer.js` contains only string operations and regular expressions. It attaches to `window` via the IIFE parameter but contains zero DOM references and is independently runnable in Node.js.

**AC4 (wordCount):** `getRawWords("")` returns `[]` (length 0) ✓; `"hello"` splits to `["hello"]` (length 1) ✓; `"foo bar baz"` splits to length 3 ✓. `wordCount` is correctly assigned from `rawWords.length`.

**AC5 (sentenceCount):** For `"Hello world. How are you?"`, regex `/[.!?]+(?=\s|$)/g` matches `"."` (before space) and `"?"` (at end of string) = 2 ✓.

**AC6 (readingTimeSec for 200-word passage):** `Math.ceil((200 / 200) * 60)` = `Math.ceil(60)` = 60 ✓.

**AC7 (topWords):** Stop-words are hard-coded as a lookup object. `getTopWords` filters them, sorts descending by frequency (with tie-break by locale), and slices to 5 ✓.

**AC8 (empty state):** `isEmpty = analysis.wordCount === 0`; `getDisplayValue` returns `"—"` as its first branch when `isEmpty` is true, covering every card including `topWords` and `longestWord` ✓.

**AC9 (375 px single-column):** `@media (max-width: 767px)` switches `.layout` to `grid-template-columns: 1fr` and sets `.stats-grid` to a 2-up grid. Both `html` and `body` have `overflow-x: hidden` to prevent horizontal overflow ✓.

**AC10 (1280 px side-by-side):** Default `.layout` rule `grid-template-columns: minmax(0, 55%) minmax(0, 45%)` applies above 767 px ✓.

**AC11 (docs/specs/COM-13.md):** File exists and documents all stat definitions, normalization rules, the complete 12-word stop-word list, UI behaviour, and acceptance criteria ✓.

**Constraints:** No framework, no bundler, no `type="module"`, no CDN links, no network requests, no async APIs, no `localStorage`. Exactly five files modified. `app.js` is IIFE-wrapped. `analyzer.js` is DOM-free.

---

## References

- JIRA: [COM-13](https://everestlogix.atlassian.net/browse/COM-13)
- Branch: `feature/COM-13-build-a-single-page-application-spa-for-`
- Rounds to approval: 1

---
*Generated by ai-orchestrator on 2026-04-02T18:11:30Z*
