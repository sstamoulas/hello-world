# COM-13: Build a Single Page Application (SPA) for real-time text analysis.

## Implementation Specification

status: PLAN
round: 1
ticket: COM-13
---

## Objective
Build a self-contained, single-page Real-Time Text Analyzer web utility using vanilla
HTML, CSS, and JavaScript. The application accepts user-typed text and immediately
(on every keystroke) computes and displays a rich set of statistics — character count,
word count, sentence count, paragraph count, estimated reading time, average word
length, and the top 5 most-frequent words. No build toolchain, no framework, no
external dependencies.

## Stack & Conventions
- **Language / Runtime:** Vanilla HTML5, CSS3, plain ES5-compatible JavaScript
- **Delivery model:** Static files only — no server, no bundler, no `package.json`.
  All files are loaded directly from the filesystem or any plain HTTP server.
- **JS architecture:** Two classic (non-module) `<script>` tags in dependency order:
  `analyzer.js` first (pure analysis functions, no DOM), then `app.js` (DOM wiring).
  Both files share the global `window` scope — no `import`/`export` statements so the
  app works correctly over the `file://` protocol.
- **CSS:** Single external stylesheet (`style.css`). Use CSS custom properties for the
  colour palette. Mobile-first, responsive via a two-column grid that collapses to
  single-column on narrow viewports.
- **Spec doc:** `docs/specs/COM-13.md` is written as part of this ticket per the
  pipeline convention (`SPEC_DOC_PATH = docs/specs`).

## Files to Create or Modify

- `index.html` — Create. Main shell: `<textarea>` input, a stats grid container, a
  top-words list container. Loads `style.css` in `<head>`, loads `analyzer.js` then
  `app.js` before `</body>`. All `<script>` tags must be classic (no `type="module"`).

- `style.css` — Create. Full responsive stylesheet:
  - CSS custom properties for colours, spacing, font-size.
  - A sticky header with the app title.
  - Two-column grid layout: textarea on the left, stats panel on the right.
    Below 640 px the grid collapses to a single column (textarea on top, stats below).
  - Stat cards: each stat displayed in a labelled card (label + large numeric value).
  - Top-words section: a ranked ordered list beneath the stat cards.
  - Smooth CSS transitions on stat value changes (opacity flash or colour fade).
  - Accessible focus styles on the textarea.

- `analyzer.js` — Create. Pure analysis module; exposes functions on `window.Analyzer`:
  - `Analyzer.charCount(text)` → integer (total characters including whitespace)
  - `Analyzer.charCountNoSpaces(text)` → integer (characters excluding all whitespace)
  - `Analyzer.wordCount(text)` → integer (split on whitespace, filter empty tokens)
  - `Analyzer.sentenceCount(text)` → integer (split on `.` `!` `?` sequences, filter empty)
  - `Analyzer.paragraphCount(text)` → integer (split on one or more blank lines, filter empty)
  - `Analyzer.readingTime(text)` → string e.g. `"< 1 min"` or `"3 min"` (assume 200 wpm)
  - `Analyzer.avgWordLength(text)` → number rounded to 1 decimal place
  - `Analyzer.topWords(text, n)` → array of `{ word, count }` objects, top-n by frequency,
    case-insensitive, strip punctuation, exclude a small stop-word list
    (`["the","a","an","and","or","but","in","on","at","to","for","of","with","is","it","as"]`).
  - `Analyzer.analyze(text)` → convenience wrapper that returns a plain object with all
    the above stats in one call: `{ charCount, charCountNoSpaces, wordCount,
    sentenceCount, paragraphCount, readingTime, avgWordLength, topWords }`.

- `app.js` — Create. DOM wiring and rendering:
  - On `DOMContentLoaded`, grab the `<textarea>` and all stat display elements by
    `data-stat` attribute.
  - Attach an `input` event listener to the `<textarea>`.
  - On every `input` event call `Analyzer.analyze(textarea.value)` and update every
    stat element's `textContent`.
  - Render the top-words list into a `<ol id="top-words">` element by clearing and
    re-populating `<li>` children on each update.
  - Trigger an initial render call on load so the stats show `0` / `"< 1 min"` etc.
    rather than blank.
  - No external libraries. No `import`/`export`.

- `docs/specs/COM-13.md` — Create. Spec document following the pipeline convention.
  Must include: ticket key, objective summary, file inventory, and the acceptance
  criteria verbatim from this plan.

## Implementation Notes

### `file://` Protocol Compatibility
The app has **no build step and no local server requirement**. It must open correctly
by double-clicking `index.html` in a file manager (Chrome/Firefox over `file://`).
Therefore:
- **Do NOT use `<script type="module">`** — Chrome blocks cross-file ES module fetches
  from `file://` origins with a CORS error.
- Load JS files as **classic scripts** in dependency order:
  ```html
  <script src="analyzer.js"></script>
  <script src="app.js"></script>
  ```
- `analyzer.js` must attach its public API to `window.Analyzer = { ... }` so `app.js`
  can reference `Analyzer` without any import statement.
- Wrap `app.js` in a self-invoking function `(function(){ ... }())` to avoid polluting
  the global scope.

### Stat Card HTML Pattern
Use `data-stat` attributes to let `app.js` select each display element without
hard-coding IDs for every stat:
```html
<div class="stat-card">
  <span class="stat-label">Words</span>
  <span class="stat-value" data-stat="wordCount">0</span>
</div>
```
`app.js` can then do:
```js
document.querySelectorAll('[data-stat]').forEach(function(el) {
  el.textContent = stats[el.dataset.stat];
});
```

### Reading-Time Logic
```js
var words = Analyzer.wordCount(text);
var mins = Math.ceil(words / 200);
return words === 0 ? '< 1 min' : (mins < 1 ? '< 1 min' : mins + ' min');
```

### Top-Words Stop List
Keep the stop-word list small and inline inside `analyzer.js` as a plain array literal.
Do not fetch it from an external file.

### No External Fonts / Icons
Do not reference Google Fonts, Font Awesome, or any CDN resource. Use
`font-family: system-ui, sans-serif` so the app is fully offline-capable.

## Constraints
- Do NOT introduce a `package.json`, bundler, or any npm dependency.
- Do NOT use `<script type="module">` or ES module `import`/`export` syntax.
- Do NOT modify `README.md` — it documents the orchestrator pipeline, not the target app.
- Do NOT modify any files in `bin/`, `config/`, `scripts/`, `prompts/`, or `run/`.
- Preserve the existing `.gitignore` and `.env.example` exactly as-is.
- All JavaScript must be ES5-compatible (no arrow functions, no `const`/`let`, no
  template literals, no destructuring) to maximise browser compatibility without a
  transpiler. *Exception:* `const`/`let` are acceptable if the target environment is
  known to be a modern evergreen browser; ES5 is the safe floor.

## Acceptance Criteria
1. Opening `index.html` directly from the filesystem in Chrome and Firefox (via
   `file://`) loads the page without any console errors.
2. Typing into the textarea updates all stat values **without any user action** other
   than typing (no button press required).
3. The following stats are displayed and update in real-time:
   - Total character count (with spaces)
   - Character count (no spaces)
   - Word count
   - Sentence count
   - Paragraph count
   - Estimated reading time (e.g. `"< 1 min"`, `"2 min"`)
   - Average word length (1 decimal place)
4. A ranked list of the **top 5 most-frequent non-stop words** is displayed and updates
   in real-time, showing both the word and its count.
5. When the textarea is empty (on initial load and after clearing), all numeric stats
   display `0` and reading time displays `"< 1 min"`.
6. The layout is **responsive**: on viewports ≥ 640 px the textarea and stats panel
   are side-by-side; below 640 px they stack vertically (textarea above, stats below).
7. `analyzer.js` exposes `window.Analyzer` with all eight public functions
   (`charCount`, `charCountNoSpaces`, `wordCount`, `sentenceCount`, `paragraphCount`,
   `readingTime`, `avgWordLength`, `topWords`) plus the convenience `analyze` wrapper.
8. `app.js` contains no `import`/`export` statements and no `<script type="module">`
   is present anywhere in `index.html`.
9. No network requests are made at any point — the app is fully self-contained and
   offline-capable (verified via DevTools Network tab showing zero requests after
   initial file load).
10. `docs/specs/COM-13.md` exists and documents the ticket objective, file inventory,
    and these acceptance criteria.
```

---

## Review & Approval


All ten acceptance criteria are satisfied and all constraints are respected.

**AC1 (file:// compatibility):** No `<script type="module">` is present. `analyzer.js` is wrapped in an IIFE and exposes `window.Analyzer = { … }`. `app.js` is also wrapped in an IIFE. The script loading order (`analyzer.js` before `app.js`) is preserved from the existing `index.html`, which the diff confirms was not changed in that section.

**AC2 (real-time updates):** `app.js` attaches an `input` listener to the textarea and calls `Analyzer.analyze(textarea.value)` synchronously on every keystroke. No debouncing or async path.

**AC3 (all seven stats):** All seven `data-stat` attributes (`charCount`, `charCountNoSpaces`, `wordCount`, `sentenceCount`, `paragraphCount`, `readingTime`, `avgWordLength`) are present in the new `index.html` markup. `app.js` iterates `querySelectorAll("[data-stat]")` and updates each one from `stats[key]`, with a correct `toFixed(1)` call for `avgWordLength`.

**AC4 (top-5 words):** `topWords(text, 5)` is called inside `Analyzer.analyze()`. `renderTopWords` clears and repopulates the `<ol id="top-words">` with `word + count` on every update.

**AC5 (empty state):** `update()` is called immediately on `DOMContentLoaded`. All `Analyzer.*` functions return `0` / `"< 1 min"` for empty input; no `NaN` or `undefined` paths exist.

**AC6 (responsive layout):** The CSS uses `@media (min-width: 640px)` to apply the two-column `.layout` grid and defaults to single-column below that threshold. This matches the plan's 640 px breakpoint exactly.

**AC7 (window.Analyzer API):** All eight named functions plus the `analyze` convenience wrapper are exposed on `window.Analyzer` in `analyzer.js`. The stop-word list matches the plan's exact 16-word array.

**AC8 (no ES modules):** `app.js` contains no `import`/`export` and is wrapped in a classic IIFE. No `type="module"` attribute appears anywhere in the HTML diff.

**AC9 (offline / no network requests):** `font-family: system-ui, sans-serif` is used; no CDN or external resource references exist anywhere in the diff.

**AC10 (spec doc):** `docs/specs/COM-13.md` is updated with the ticket key, objective summary, file inventory, and all ten acceptance criteria verbatim from the plan.

---

## References

- JIRA: [COM-13](https://everestlogix.atlassian.net/browse/COM-13)
- Branch: `feature/COM-13-build-a-single-page-application-spa-for-`
- Rounds to approval: 1

---
*Generated by ai-orchestrator on 2026-04-02T12:04:59Z*
