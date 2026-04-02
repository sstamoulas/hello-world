# COM-15: Add Word-Count "Soft Limit" Threshold

## Implementation Specification

status: PLAN
round: 1
ticket: COM-15
---

## Objective
Add an optional, user-configurable word-count goal ("soft limit") to the text-analyzer application, mirroring the existing character soft-limit feature. When the user enters a target word count (e.g., 500), the UI displays a live progress indicator showing how many words have been written toward that goal, and highlights when the goal is reached or exceeded. The setting is optional — leaving it blank disables the indicator entirely.

## Stack & Conventions
Vanilla JavaScript browser application — no framework, no bundler, no package manager. Entry point is `index.html`, styles in `style.css`, core text-processing logic in `analyzer.js`, and all UI/event wiring in `app.js`. Scripts are loaded as classic (non-module) `<script src="...">` tags. The app is an offline utility opened directly via the `file://` protocol; no local server. All JS follows an IIFE pattern with a single `DOMContentLoaded` listener in `app.js`. Prior features (character soft limit, copy-to-clipboard, keyboard shortcut for clear) establish the patterns to follow.

## Files to Create or Modify
- `index.html` — Add a word-count goal input field in the existing settings/config area (adjacent to the character soft-limit input), plus a word-count progress indicator element in the stats/output area.
- `app.js` — Add logic to read the word-count goal input, compare it to the live word count, update the progress indicator on every `input` event, persist the goal value to `localStorage`, and restore it on page load.
- `style.css` — Add styles for the word-count goal input group, the progress indicator, the "on-track" state, and the "goal reached" / "over-goal" state (distinct visual treatment).
- `docs/specs/COM-15.md` — New spec document describing the feature's behaviour, storage key, and UI states.

## Implementation Notes

### Input Field
Add a labelled number input for the word-count goal next to (or directly below) the existing character soft-limit input. Suggested markup:

```html
<div class="setting-group" id="word-goal-group">
  <label for="word-goal-input">Word count goal</label>
  <input
    type="number"
    id="word-goal-input"
    min="1"
    placeholder="e.g. 500"
    aria-label="Word count goal"
  />
</div>
```

- Use `type="number"` with `min="1"` — negative or zero values are meaningless.
- Leave `value` empty by default; a blank/zero value means "no goal set" and hides the indicator.

### Progress Indicator Element
Add a dedicated `<div id="word-goal-indicator">` (or `<p>`) in the stats output area. Its content is updated dynamically by `app.js`. When no goal is set, apply `display: none` (or toggle a `.hidden` class). When a goal is active, render text such as:

```
"Aiming for 500 words — 312 / 500 (62%)"
```

or when the goal is reached:

```
"✓ Word goal reached! 523 / 500 words"
```

### app.js Logic
All changes must be inside the existing IIFE / `DOMContentLoaded` block. Add:

1. **`updateWordGoalIndicator()`** — reads `wordGoalInput.value` and the current word count (read from wherever the live word count is already tracked or computed in `app.js`). If the goal is blank or ≤ 0, hide the indicator and return. Otherwise, compute:
   - `pct = Math.min(100, Math.round((currentWordCount / goal) * 100))`
   - Set indicator text to the appropriate string (in-progress vs. reached).
   - Toggle a `.goal-reached` CSS class on the indicator when `currentWordCount >= goal`.

2. **Hook into the existing `input` event** — call `updateWordGoalIndicator()` each time text changes (piggyback on the existing `textarea` `input` listener, or add a separate call at the end of the existing handler — do NOT register a duplicate listener on the textarea).

3. **Wire the goal input** — register an `input` event listener on `wordGoalInput` that:
   - Validates the value (clamp to ≥ 1 or blank).
   - Persists the value to `localStorage` under the key `"wordCountGoal"`.
   - Calls `updateWordGoalIndicator()` immediately so the indicator updates without needing to retype text.

4. **Restore on load** — after `DOMContentLoaded`, read `localStorage.getItem("wordCountGoal")` and pre-populate `wordGoalInput.value` if a non-null, positive value exists. Then call `updateWordGoalIndicator()` to render the current state.

5. **Clear integration** — when the Clear button is triggered (existing handler), reset the word count to 0 and call `updateWordGoalIndicator()` so the indicator reflects the cleared state (do NOT clear the saved goal from `localStorage` — the user's goal preference should survive a clear).

### Word Count Source
Do NOT reimplement word-count logic. Read the word count from the same place the rest of `app.js` already reads it (e.g., a variable like `stats.wordCount`, a DOM element's `textContent`, or a return value from `analyzer.js`). Match the existing pattern precisely.

### localStorage Key Convention
Inspect the existing character soft-limit implementation for its `localStorage` key name. Follow the same naming convention (e.g., if the char limit uses `"charSoftLimit"`, use `"wordCountGoal"`).

## Browser & Runtime Compatibility
The app is opened via `file://` with no local server.
- **Do NOT use ES modules** — no `import`/`export`, no `<script type="module">`.
- `localStorage` is available on `file://` in Chrome and Firefox (same-origin per path on most desktop browsers) — this is the same strategy already used by the character soft-limit feature, so it is safe to reuse.
- `type="number"` inputs and `min` attributes are universally supported in evergreen browsers.
- All new JS belongs in `app.js` as classic script code inside the existing IIFE.

## Constraints
- Do NOT modify `analyzer.js` — word-count computation is already handled there; `app.js` should consume the result, not recompute it.
- Do NOT change the existing character soft-limit feature — the two features are independent and must not interfere.
- Do NOT introduce any new external dependencies, CDN links, or npm packages.
- Do NOT use ES modules or `<script type="module">`.
- Do NOT clear the word-count goal from `localStorage` when the Clear button is pressed — only reset the in-session word count display.
- Preserve all existing event listeners and application behaviour in `app.js`.
- Do NOT duplicate the word-count calculation — reuse whatever the app already computes.

## Acceptance Criteria
1. A "Word count goal" number input is present in the settings/config area of the UI, visually consistent with the existing character soft-limit input.
2. Leaving the input blank (or setting it to 0) hides the word-count goal indicator entirely — no empty or broken UI is shown.
3. Entering a positive integer (e.g., 500) immediately shows the indicator: `"Aiming for 500 words — X / 500 (Y%)"` where X is the current live word count.
4. The indicator updates in real time as text is typed into the textarea without any page reload.
5. When the current word count equals or exceeds the goal, the indicator changes to a "goal reached" state (distinct text and/or CSS class, e.g., `"✓ Word goal reached! X / 500 words"`).
6. The goal value persists in `localStorage` and is restored (pre-populated in the input and reflected in the indicator) on page reload.
7. Pressing the Clear button resets the word-count progress display to 0 / goal but does NOT clear the saved goal value from `localStorage` or empty the goal input.
8. The word-count goal feature operates independently of the character soft-limit — changing one does not affect the other.
9. No new external scripts, stylesheets, or dependencies are added to the project.
10. `analyzer.js` is not modified.
11. All existing functionality (text input, analysis, character soft-limit, copy to clipboard, keyboard clear shortcut) continues to work unchanged.
12. A `docs/specs/COM-15.md` spec file is created documenting the feature, the `localStorage` key used, and the UI states.
```

---

## Review & Approval


All 12 acceptance criteria are satisfied and every constraint from the plan is respected.

**Verified criteria:**

- **AC1** — `#word-goal-input` is present in `index.html` inside a `.setting-group` / `.settings-row`, visually consistent with the moved character-limit note.
- **AC2** — `updateWordGoalIndicator` gates on `getWordGoalValue() === 0` and sets `hidden = true`, removing any visible indicator when blank or ≤ 0.
- **AC3** — "Aiming for N words — X / N (Y%)" text is rendered correctly; `Math.min(100, …)` clamp is applied.
- **AC4** — `updateWordGoalIndicator(analysis.wordCount)` is called inside the existing `render()` function, so every textarea keystroke triggers a live update without a duplicate listener.
- **AC5** — `wordCount >= goal` branch emits "✓ Word goal reached! X / N words" and toggles `.goal-reached`; distinct CSS (`rgba(45,138,93,0.16)` background + `color-progress` border) provides the required visual treatment.
- **AC6** — `WORD_GOAL_STORAGE_KEY = "wordCountGoal"` matches the naming convention; `restoreWordGoal()` IIFE runs before the initial `render()` call, so the restored value is reflected immediately on load.
- **AC7** — Clear triggers `render("")` → `analysis.wordCount = 0` → indicator shows "0 / goal (0%)"; `localStorage` key is not removed by the clear path — only by the goal-input handler when the value is invalid.
- **AC8** — Character soft-limit code is untouched; the two features share no state.
- **AC9 / AC10** — No new dependencies added; `analyzer.js` diff is absent.
- **AC11** — Existing listeners, keyboard shortcut, copy button, theme toggle, and progress bar are all preserved.
- **AC12** — `docs/specs/COM-15.md` created with storage key, UI states, rendering rules, and constraints documented.

No ES modules, no `type="module"`, no `import`/`export` — safe for `file://` use. Browser smoke test passed (headless Chromium).

---

## References

- JIRA: [COM-15](https://everestlogix.atlassian.net/browse/COM-15)
- Branch: `feature/COM-15-add-word-count-soft-limit-threshold`
- Rounds to approval: 1

---
*Generated by ai-orchestrator on 2026-04-02T20:44:32Z*
