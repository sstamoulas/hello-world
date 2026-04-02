# COM-13: Build a Single Page Application (SPA) for real-time text analysis.

## Implementation Specification

status: PLAN
round: 1
ticket: COM-13
---

## Objective
Build a self-contained, single-page web application that analyses user-supplied text in real time
and displays live statistics (word count, character count, sentence count, paragraph count,
average word length, and estimated reading time) as the user types. The app must run directly
from the filesystem (`file://`) without requiring a local development server, making it
immediately portable and shareable.

## Stack & Conventions
- **Pure HTML / CSS / Vanilla JS** — no build toolchain, no npm, no bundler.  
- All files are flat at the project root (`index.html`, `style.css`, `analyzer.js`, `app.js`).  
- Scripts are loaded as classic (non-module) `<script src="...">` tags to ensure `file://`
  compatibility (no `import`/`export`, no `<script type="module">`).  
- `analyzer.js` — pure analysis logic (no DOM). Exposes a single global function/object.  
- `app.js` — all DOM wiring, event listeners, and UI update logic. Depends on `analyzer.js`
  being loaded first.  
- `style.css` — responsive layout using CSS custom properties and flexbox/grid. No external
  CSS frameworks or CDN imports.  
- No external runtime dependencies of any kind.

## Files to Create or Modify

- `index.html` — Main HTML shell. Contains the `<textarea>` input, the stats display grid, a
  "Clear" button, and a character-limit progress bar. Loads `style.css`, then `analyzer.js`,
  then `app.js` (order matters). All markup is semantic (`<main>`, `<section>`, `<output>`).

- `style.css` — Full responsive stylesheet. Defines CSS custom properties for colours/spacing,
  a two-column stat-card grid that collapses to single-column on narrow viewports, textarea
  sizing, progress bar animation, and a light/dark colour scheme via
  `@media (prefers-color-scheme: dark)`.

- `analyzer.js` — Pure analysis module (no DOM access). Defines a global `window.Analyzer`
  object with a single method `analyze(text)` that returns a plain object:
  ```
  {
    charCount,        // total characters including spaces
    charNoSpaces,     // characters excluding whitespace
    wordCount,        // words (split on whitespace, filter empty)
    sentenceCount,    // sentences (split on . ! ?)
    paragraphCount,   // non-empty lines/blocks separated by \n\n
    avgWordLength,    // average characters per word (0 when no words)
    readingTime,      // string e.g. "< 1 min" or "2 min read"
    topWords          // array of { word, count } for top 5 words,
                      // excluding common stop-words
  }
  ```
  All logic must be pure functions — no side-effects, no globals mutated.

- `app.js` — DOM controller. On `DOMContentLoaded`:
  1. Grabs references to the `<textarea>` and every stat `<output>` element (matched by
     `data-stat` attribute values that mirror the keys returned by `Analyzer.analyze()`).
  2. Attaches an `input` event listener on the textarea that calls `Analyzer.analyze()` and
     fans the result out to each matching `<output>` element's `textContent`.
  3. Manages the progress bar width as a percentage of a 5,000-character soft limit.
  4. Wires the "Clear" button to reset the textarea and re-run analysis on empty string.
  5. Runs an initial analysis on page load so all counters display `0` / `< 1 min` rather
     than being blank.
  6. Wrapped in an IIFE to avoid polluting the global scope (except for `window.Analyzer`
     which must be global because it is defined in a separate classic script).

- `docs/specs/COM-13.md` — Spec document (already referenced in the tree). Create/populate
  with a brief feature description, the stat definitions, and the stop-word list used by
  `Analyzer`.

## Implementation Notes

### `file://` Protocol Compatibility
Do **not** use `import`/`export` or `<script type="module">`. Load scripts with plain
`<script src="...">` tags at the bottom of `<body>`, in dependency order:
```html
<script src="analyzer.js"></script>
<script src="app.js"></script>
```
Wrap `app.js` content in an IIFE. `analyzer.js` should assign to `window.Analyzer` explicitly.

### Real-Time Analysis Performance
The `input` event fires on every keystroke. Keep `analyze()` O(n) on text length. Avoid
`setTimeout` debouncing for the stats themselves — the dataset is small (5 k chars soft limit)
and synchronous execution is imperceptible.

### Stat Definitions
| Stat | Definition |
|---|---|
| `charCount` | `text.length` |
| `charNoSpaces` | `text.replace(/\s/g, '').length` |
| `wordCount` | `text.trim().split(/\s+/).filter(Boolean).length` |
| `sentenceCount` | Count matches of `/[^.!?]*[.!?]+/g` (0 for empty text) |
| `paragraphCount` | `text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length` |
| `avgWordLength` | sum of word lengths / wordCount, toFixed(1), or `0.0` |
| `readingTime` | wordCount / 200 wpm; `"< 1 min"` when result < 1 |
| `topWords` | lowercase, strip punctuation, exclude stop-words, sort desc by freq, take 5 |

### Stop-Word List (for `topWords`)
Use a concise built-in list of ~30 common English stop-words inside `analyzer.js`:
`["a","an","the","and","or","but","in","on","at","to","for","of","with","is","are","was",
"were","be","been","being","have","has","had","do","does","did","will","would","could",
"should","i","you","he","she","it","we","they","this","that"]`

### HTML Data-Binding Convention
Each stat display element in `index.html` must carry a `data-stat` attribute whose value
exactly matches the key in the object returned by `Analyzer.analyze()`. `app.js` uses
`document.querySelectorAll('[data-stat]')` and iterates, so adding a new stat only requires
adding one element to the HTML and one key to the returned object — no other JS changes.

### Progress Bar
A `<div class="progress-bar">` inside a `<div class="progress-track">`. Width is set via
`element.style.width = pct + '%'`. Colour transitions from green → amber → red using CSS
transitions on `width` and conditional classes (`warn` at 80 %, `danger` at 100 %).

### Responsive Layout
Stat cards use `display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`.
The textarea should be `width: 100%; min-height: 200px; resize: vertical`.

## Browser & Runtime Compatibility

- **`file://` protocol**: All JavaScript is split across two classic (non-module) script files.
  No `import`/`export`. No dynamic `fetch()`. No CDN URLs. The app must open and function
  correctly when double-clicked from Finder/Explorer.
- **ES modules over HTTP**: Not used. Classic scripts only.
- **Inline scripts**: Avoided in favour of external `.js` files for maintainability, but both
  files are loaded as classic non-module scripts — safe for `file://`.
- **Target browsers**: Any evergreen browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+).
  No IE11 support required. ES2019 syntax (e.g. `Array.prototype.flat`, optional chaining
  avoided for simplicity) is acceptable.

## Constraints
- Do **NOT** introduce any npm packages, bundlers, or build steps.
- Do **NOT** use `<script type="module">` or any `import`/`export` syntax.
- Do **NOT** fetch any external URLs (fonts, icons, CDN libraries) — the app must work
  fully offline.
- Do **NOT** use `localStorage`, `sessionStorage`, or cookies — no persistence required.
- Preserve the exact flat file structure listed in the ticket. Do not add subdirectories
  other than the already-specified `docs/specs/`.
- `analyzer.js` must remain free of DOM references so it is independently unit-testable.

## Acceptance Criteria
1. Opening `index.html` directly via `file://` in Chrome, Firefox, and Safari shows the
   full UI with no console errors.
2. Typing into the textarea immediately (no button press) updates all stat cards: character
   count, characters without spaces, word count, sentence count, paragraph count, average
   word length, and reading time.
3. All stat cards show `0` (or `< 1 min` for reading time) when the textarea is empty on
   first load and after clicking "Clear".
4. The progress bar fills proportionally as text length approaches 5,000 characters; it
   turns amber at ≥ 4,000 characters and red at 5,000 + characters.
5. The "Top 5 Words" section displays the five most-frequent non-stop-words with their
   counts, or fewer entries when fewer than five unique non-stop-words exist.
6. The layout is usable on a 375 px wide viewport (mobile) — stat cards reflow to a single
   column and no horizontal scrollbar appears.
7. `Analyzer.analyze("")` returns `{ charCount: 0, charNoSpaces: 0, wordCount: 0,
   sentenceCount: 0, paragraphCount: 0, avgWordLength: "0.0", readingTime: "< 1 min",
   topWords: [] }` — verifiable by pasting the call in DevTools console.
8. `Analyzer.analyze("Hello world. Foo bar.")` returns `wordCount: 4`,
   `sentenceCount: 2`, `paragraphCount: 1`.
9. No external network requests are made (verifiable via DevTools Network tab with
   "offline" throttling enabled).
10. `analyzer.js` contains zero references to `document`, `window` (except the final
    `window.Analyzer = ...` assignment), or any DOM API.
```

---

## Review & Approval


All ten acceptance criteria are satisfied and every constraint from the plan is respected.

**AC1 (file:// compatibility):** Both `<script src="analyzer.js">` and `<script src="app.js">` are loaded as classic non-module scripts. No `import`/`export`, no `<script type="module">` appears anywhere. Load order is correct (analyzer.js before app.js).

**AC2 (real-time updates):** `app.js` attaches an `input` event listener that calls `render(textarea.value)` synchronously on every keystroke with no debounce delay, satisfying the immediate-update requirement.

**AC3 (empty state shows 0 / < 1 min):** `render(textarea.value)` is called on `DOMContentLoaded` with an empty string, and the Clear button calls `render("")`. `Analyzer.analyze("")` returns `{ charCount: 0, charNoSpaces: 0, wordCount: 0, sentenceCount: 0, paragraphCount: 0, avgWordLength: "0.0", readingTime: "< 1 min", topWords: [] }` — each `<output>` element's `textContent` is set from this object.

**AC4 (progress bar thresholds):** `updateProgress` sets `warn` when `charCount >= 4000 && charCount < 5000` (80 % threshold) and `danger` when `charCount >= 5000`. CSS transitions handle the colour change. Width is capped at 100 % via `Math.min`.

**AC5 (top 5 words):** `getTopWords` normalises each word with `normalizeTopWord`, filters against the full 38-word stop-word set, counts frequencies, sorts descending, and slices to 5 entries.

**AC6 (375 px mobile layout):** `@media (max-width: 767px)` collapses `.layout` to `grid-template-columns: 1fr` and `.stats-grid` to `grid-template-columns: 1fr`, preventing any horizontal overflow.

**AC7 (Analyzer.analyze("") contract):** Verified: `getWords("")` returns `[]`; `getSentenceCount` and `getParagraphCount` both short-circuit on empty trim; `getAverageWordLength([])` returns `"0.0"`; `getReadingTime(0)` returns `"< 1 min"`; `getTopWords([])` returns `[]`.

**AC8 (Analyzer.analyze("Hello world. Foo bar.") contract):** `getWords` splits on whitespace → 4 tokens ✓; `/[^.!?]*[.!?]+/g` matches `"Hello world."` and `" Foo bar."` → sentenceCount 2 ✓; no double newline → paragraphCount 1 ✓.

**AC9 (no external requests):** No CDN links, no `fetch`, no dynamic script injection anywhere in the diff.

**AC10 (analyzer.js DOM-free):** The file contains only string operations and regex. The sole `window` reference is the final `window.Analyzer = { analyze: analyze }` assignment.

**Constraints:** No npm/bundler, no `type="module"`, no external URLs, no Web Storage APIs, flat file structure preserved (only `docs/specs/` subdirectory added), `app.js` is IIFE-wrapped, `analyzer.js` is DOM-free.
```

---

## References

- JIRA: [COM-13](https://everestlogix.atlassian.net/browse/COM-13)
- Branch: `feature/COM-13-build-a-single-page-application-spa-for-`
- Rounds to approval: 1

---
*Generated by ai-orchestrator on 2026-04-02T18:47:54Z*
