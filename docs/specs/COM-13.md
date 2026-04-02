# COM-13: Build a Single Page Application (SPA) for real-time text analysis.

## Implementation Specification

status: PLAN
round: 1
ticket: COM-13
---

## Objective
Build a self-contained, single-page Real-Time Text Analyzer web utility. The
application accepts free-form text input and instantly computes and displays a
set of live statistics (character count, word count, sentence count, paragraph
count, estimated reading time, unique word count, and average word length) with
no page reloads and no server required. The entire app must open correctly
directly from the filesystem via the `file://` protocol.

## Stack & Conventions
- **Language:** Vanilla JavaScript (ES5-compatible, no transpiler, no bundler)
- **Markup:** Semantic HTML5
- **Styling:** Plain CSS3 (custom properties for theming, flexbox/grid for layout)
- **Module strategy:** Classic `<script>` tags only — NO `import`/`export`, NO
  `<script type="module">`. `analyzer.js` is loaded first and attaches its API
  to the global `window` object (or a plain global namespace object). `app.js`
  is loaded second and reads from that global. This avoids the CORS error
  Chrome raises for cross-file ES module fetches on `file://` origins.
- **No external dependencies** — no jQuery, no lodash, no CDN links. Fully
  offline-capable.
- **No build step** — open index.html directly; it works.

## Files to Create or Modify

- `index.html` — Create. The application shell. Contains:
  - A `<textarea>` (id `input-text`) for user input, with a placeholder.
  - A stats dashboard `<section>` containing individual stat cards (one per
    metric). Each card has a data attribute like `data-stat="wordCount"` and a
    `<span class="stat-value">` that app.js will update.
  - Two `<script>` tags at the bottom of `<body>`: `analyzer.js` first, then
    `app.js`. Both are classic (no `type="module"`).
  - A `<link>` to `style.css` in `<head>`.

- `style.css` — Create. Responsive stylesheet:
  - CSS custom properties (variables) for colours, spacing, and font sizes
    defined on `:root`.
  - Two-column layout on wide viewports (textarea left, stats panel right) using
    CSS Grid. Single-column stacked layout on viewports ≤ 768 px via a
    `@media` query.
  - Stat cards displayed in a responsive grid (`grid-template-columns:
    repeat(auto-fill, minmax(140px, 1fr))`).
  - Smooth value transition on stat cards (CSS `transition` on `.stat-value`)
    so updates feel live, not jarring.
  - Clean, minimal visual design: neutral background, white cards, subtle
    box-shadow, readable sans-serif font stack.
  - A `.empty` state class on `<body>` (applied by app.js when textarea is
    blank) that dims/greys out the stats panel.

- `analyzer.js` — Create. Pure analysis module, **no DOM access**. Exposes a
  single global namespace object `window.TextAnalyzer` with one method:

  ```
  window.TextAnalyzer = {
    analyze(text) → AnalysisResult
  }
  ```

  `AnalysisResult` is a plain object with these keys:
  | Key | Type | Definition |
  |---|---|---|
  | `charCount` | number | Total characters including spaces and newlines |
  | `charCountNoSpaces` | number | Characters excluding all whitespace |
  | `wordCount` | number | Whitespace-delimited tokens; 0 for empty/whitespace-only input |
  | `sentenceCount` | number | Segments ending in `.` `!` or `?`; minimum 0 |
  | `paragraphCount` | number | Non-empty blocks separated by one or more blank lines; minimum 0 |
  | `uniqueWordCount` | number | Case-insensitive distinct words (strip punctuation before comparing) |
  | `avgWordLength` | number | Mean character length of all words, rounded to 1 decimal place; 0 if no words |
  | `readingTimeSeconds` | number | `Math.ceil((wordCount / 238) * 60)` — 238 WPM average |

  All computation must be done with pure string operations and regular
  expressions. No side effects.

- `app.js` — Create. DOM wiring layer. Responsibilities:
  - On `DOMContentLoaded`, attach an `input` event listener to `#input-text`.
  - On every `input` event (fires on every keystroke):
    1. Read `textarea.value`.
    2. Call `window.TextAnalyzer.analyze(value)`.
    3. For each stat card in the dashboard, find it by `data-stat` attribute and
       update its `.stat-value` inner text. Format `readingTimeSeconds` as a
       human-readable string (e.g. `"< 1 min"`, `"1 min"`, `"2 min 30 sec"`).
    4. Toggle the `.empty` class on `document.body` based on whether the input
       is blank/whitespace-only.
  - On page load with an empty textarea, show `0` / `"< 1 min"` defaults in all
    stat cards (call `analyze("")` immediately).
  - Wrap everything in an IIFE to avoid polluting the global scope beyond
    `window.TextAnalyzer`.

- `docs/specs/COM-13.md` — Create. Spec document written after implementation
  describing the feature, its stat definitions, and any known edge cases. This
  is generated as part of the pipeline's finalize step and should be authored
  to match the final implemented behaviour.

## Implementation Notes

### `file://` Protocol Compatibility (Critical)
The deliverable MUST work when `index.html` is opened directly from the
filesystem (double-click). This means:
- **No ES modules.** Do not use `<script type="module">`, `import`, or `export`.
  Chrome blocks cross-file module imports on `file://` with a CORS error.
- **Load order matters.** `analyzer.js` must appear before `app.js` in the HTML
  so that `window.TextAnalyzer` is defined by the time `app.js` runs.
- **No fetch/XHR calls** for local resources. Everything must be inline or
  loaded via standard `<script src>` / `<link href>` tags.

### Word Tokenisation Edge Cases
- Empty string → all counts are 0.
- Whitespace-only string → wordCount 0, paragraphCount 0.
- Multiple consecutive spaces/newlines → treated as single delimiters.
- Words with apostrophes (e.g. `"don't"`) → count as one word.
- Leading/trailing punctuation stripped before uniqueness comparison.

### Reading Time Display (in app.js)
```
seconds = 0          → "< 1 min"
seconds < 60         → "< 1 min"
seconds === 60       → "1 min"
seconds in (60,120)  → "1 min {s} sec"   (where s = seconds - 60)
seconds >= 120       → "{m} min"          (where m = Math.floor(seconds/60))
                        or "{m} min {s} sec" if remainder > 0
```

### Stat Card HTML Pattern (in index.html)
Each stat card should follow this pattern so app.js can target them generically:
```html
<div class="stat-card">
  <span class="stat-label">Words</span>
  <span class="stat-value" data-stat="wordCount">0</span>
</div>
```
app.js queries all `[data-stat]` elements and updates them in a single loop.

### Responsive Layout Breakpoint
- ≥ 769 px: Two-column grid. Textarea takes ~55% width, stats panel ~45%.
- ≤ 768 px: Single column. Textarea on top, stats grid below.

## Constraints
- Do NOT use any JavaScript framework or library (no React, Vue, jQuery, etc.)
- Do NOT use `<script type="module">` or ES module `import`/`export` syntax
- Do NOT add a build system, package.json, or bundler
- Do NOT make any network requests
- Do NOT modify `README.md` — it documents the orchestrator pipeline, not this app
- `analyzer.js` must contain ZERO DOM references — it must be independently
  testable by pasting into a Node.js REPL

## Acceptance Criteria
1. Opening `index.html` directly via `file://` in Chrome, Firefox, and Safari
   shows the full UI with no console errors.
2. Typing into the textarea updates all stat cards on every keystroke with no
   perceptible lag.
3. `TextAnalyzer.analyze("Hello world. How are you?")` returns exactly:
   `{ charCount: 25, charCountNoSpaces: 21, wordCount: 5, sentenceCount: 2,
   paragraphCount: 1, uniqueWordCount: 5, avgWordLength: 3.8,
   readingTimeSeconds: 2 }` (verify in browser console or Node REPL).
4. An empty or whitespace-only textarea shows `0` for all numeric stats and
   `"< 1 min"` for reading time, and the stats panel is visually dimmed.
5. The layout is two-column on a 1280 px viewport and single-column on a 375 px
   viewport (iPhone SE width), with no horizontal scrollbar in either case.
6. All seven stat metrics are visible simultaneously without scrolling on a
   1280×800 desktop viewport.
7. `docs/specs/COM-13.md` exists and accurately documents the stat definitions
   and edge-case handling implemented.
8. There are no `import`, `export`, or `type="module"` strings anywhere in the
   codebase.
```

---

## Review & Approval


All acceptance criteria are satisfied and every constraint from the plan is respected.

**AC1 (file:// compatibility):** Both `<script src="analyzer.js">` and `<script src="app.js">` are placed at the bottom of `<body>` as classic scripts with no `type="module"`. No `import`, `export`, or module syntax appears anywhere in the codebase (AC8 also satisfied). Chrome's CORS block on cross-file ES module fetches is fully avoided.

**AC2 (live updates on every keystroke):** `app.js` attaches an `input` event listener to `#input-text` and calls `window.TextAnalyzer.analyze(value)` synchronously on every event. All `[data-stat]` elements are updated in a single loop via `querySelectorAll`.

**AC3 (exact analysis result):** Manually traced `analyze("Hello world. How are you?")`:
- `charCount`: 25 ✓; `charCountNoSpaces`: 21 ✓
- `wordCount`: `["Hello","world.","How","are","you?"].length` = 5 ✓
- `sentenceCount`: regex `/[.!?]+(?=\s|$)/g` matches `"."` (before space) and `"?"` (at end) = 2 ✓
- `paragraphCount`: single non-empty block = 1 ✓
- `uniqueWordCount`: normalized words `hello, world, how, are, you` — all distinct = 5 ✓
- `avgWordLength`: `(5+5+3+3+3)/5 = 19/5 = 3.8` ✓
- `readingTimeSeconds`: `Math.ceil((5/238)*60)` = `Math.ceil(1.26…)` = 2 ✓

**AC4 (empty state):** `analyze("")` returns all zeros; `readingTimeSeconds = 0` hits `!seconds` branch in `formatReadingTime` → `"< 1 min"`. `body.empty` is toggled on and `body.empty .stats-panel { opacity: 0.62 }` dims the panel.

**AC5 (responsive layout):** `.layout` has `grid-template-columns: minmax(0, 55%) minmax(0, 45%)` at wide viewports; `@media (max-width: 768px)` switches to `grid-template-columns: 1fr`. No horizontal overflow risk.

**AC6 (all metrics visible at 1280×800):** Eight stat cards in a `repeat(auto-fill, minmax(140px, 1fr))` grid inside the 45% right panel — all visible without scrolling at desktop widths.

**AC7 (spec doc):** `docs/specs/COM-13.md` accurately documents the `analyze()` return shape, all eight field definitions, edge cases (empty input, whitespace-only, apostrophes, consecutive delimiters), reading-time display rules, and the verified example output.

**Constraints:** No framework, no bundler, no `type="module"`, no network requests, `analyzer.js` contains zero DOM references (verified — only string ops and regex), `app.js` is IIFE-wrapped, `README.md` untouched.
```

---

## References

- JIRA: [COM-13](https://everestlogix.atlassian.net/browse/COM-13)
- Branch: `feature/COM-13-build-a-single-page-application-spa-for-`
- Rounds to approval: 1

---
*Generated by ai-orchestrator on 2026-04-02T18:04:08Z*
