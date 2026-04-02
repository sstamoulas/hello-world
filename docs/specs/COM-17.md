# COM-17: Keyboard Shortcut for "Clear" Action

## Implementation Specification

status: PLAN
round: 1
ticket: COM-17
---

## Objective
Add a `Cmd/Ctrl + Shift + Delete` keyboard shortcut that triggers the existing "Clear" action in the text-analyzer application. This eliminates the need for users to reach for the mouse during repetitive editing sessions, improving workflow speed without changing any underlying clear logic.

## Stack & Conventions
Vanilla JavaScript browser application — no framework, no bundler, no package manager. Entry point is `index.html`, styles in `style.css`, core text-processing logic in `analyzer.js`, and all UI/event wiring in `app.js`. Scripts are loaded as classic (non-module) `<script src="...">` tags. The app is an offline utility opened directly from the filesystem (`file://` protocol). All JS follows an IIFE wrapper pattern. No `import`/`export` syntax is used anywhere.

## Files to Create or Modify
- `app.js` — Register a `keydown` listener on `document` that detects `(metaKey || ctrlKey) + shiftKey + Delete` and delegates to the existing clear handler. No duplication of clear logic — call the same function or programmatically `.click()` the existing clear button.
- `index.html` — Add a keyboard-shortcut hint label (e.g., `<kbd>⌘/Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Del</kbd>`) as a `<span>` visually adjacent to the existing clear button, so the shortcut is discoverable.
- `style.css` — Add minimal styles for the `<kbd>` hint element: small font size, muted colour, monospace, so it is readable but visually secondary to the button itself.
- `docs/specs/COM-17.md` — New spec document describing the feature (keyboard shortcut, key combination, behaviour).

## Implementation Notes

### Event Listener (Critical Detail)
Register a single `keydown` listener on `document` (not on the textarea) so the shortcut fires regardless of which element has focus:

```javascript
document.addEventListener('keydown', function(event) {
  var isMac  = (event.metaKey  && event.shiftKey && event.key === 'Delete');
  var isOther = (event.ctrlKey && event.shiftKey && event.key === 'Delete');
  if (isMac || isOther) {
    event.preventDefault();   // prevent browser's back-navigation shortcut on some platforms
    clearBtn.click();         // delegate to the existing clear button click handler
  }
});
```

- Use `event.key === 'Delete'` (not `event.keyCode`) — `event.key` is the modern, readable standard and is fully supported in all evergreen browsers.
- Call `event.preventDefault()` to suppress any conflicting browser default behaviour (some browsers map `Ctrl+Shift+Delete` to "Clear browsing data").
- Delegate via `clearBtn.click()` rather than re-implementing the clear logic, so the shortcut stays automatically in sync with any future changes to the clear action.

### Placement Inside the IIFE
All new code must be placed inside the existing IIFE in `app.js`. The `document` `keydown` listener should be registered after the DOM is ready (after `DOMContentLoaded` fires, or inline after the existing event wiring — match the pattern already in use).

### Keyboard Hint Label
In `index.html`, place the hint immediately after the clear button text, inside or beside the `<button>` element. Example:

```html
<button id="clear-btn">Clear
  <span class="shortcut-hint">⌘/Ctrl+Shift+Del</span>
</button>
```

Or as a sibling `<span>` right after the button if the button already has a fixed text node. Keep it semantic — use `<kbd>` tags for individual keys if preferred, wrapped in a `.shortcut-hint` container.

### No Impact on Clipboard Shortcut (COM-18)
The existing COM-18 clipboard feature used no keyboard shortcut, so there is no conflict. The new `keydown` listener must not interfere with other keyboard events already wired in `app.js`.

## Browser & Runtime Compatibility
The app opens via `file://` with no server. The `keydown` / `event.key` API is universally available in all evergreen browsers and requires no special context — no concerns here. Do NOT introduce ES modules or `<script type="module">`. All new JavaScript stays in `app.js` as classic script code.

## Constraints
- Do NOT modify `analyzer.js` — keyboard shortcuts are a UI/app-layer concern only.
- Do NOT duplicate the clear logic — delegate to the existing clear button or its handler function.
- Do NOT introduce any new external dependencies, CDN links, or npm packages.
- Do NOT use `event.keyCode` (deprecated) — use `event.key`.
- Do NOT use ES modules or `<script type="module">`.
- Preserve all existing event listeners and application behaviour in `app.js`.
- The shortcut must NOT fire when a browser-native input shortcut (e.g., typing normally) is in progress — `event.shiftKey + event.metaKey/ctrlKey` qualification ensures this.

## Acceptance Criteria
1. Pressing `Cmd+Shift+Delete` (macOS) while the app is open clears the input textarea and resets the stats output — identical to clicking the Clear button.
2. Pressing `Ctrl+Shift+Delete` (Windows/Linux) produces the same result as criterion 1.
3. `event.preventDefault()` is called so the browser's "Clear browsing data" dialog (Chrome on Windows) does not open.
4. The keyboard shortcut fires regardless of which element currently has focus (input textarea, body, result area, etc.).
5. A visible keyboard shortcut hint (e.g., `⌘/Ctrl+Shift+Del`) appears adjacent to the Clear button in the UI, making the shortcut discoverable without reading docs.
6. The shortcut has no effect when the input is already empty (graceful no-op, no errors thrown).
7. The shortcut does not interfere with the Copy to Clipboard button behaviour (COM-18) or any other existing keyboard interaction.
8. All existing functionality (text input, analysis trigger, results display, copy to clipboard) continues to work unchanged.
9. No new external scripts, stylesheets, or dependencies are added to the project.
10. A `docs/specs/COM-17.md` spec file is created documenting the feature.
```

---

## Review & Approval


All acceptance criteria are satisfied by the implementation:

1. **AC1 & AC2** — `app.js` registers a `document` `keydown` listener checking `event.shiftKey && event.key === "Delete" && (event.metaKey || event.ctrlKey)`, covering both macOS (`metaKey`) and Windows/Linux (`ctrlKey`). Delegates to `clearButton.click()` which invokes the existing clear handler — no logic duplication.

2. **AC3** — `event.preventDefault()` is called unconditionally when the shortcut is detected, suppressing the browser's "Clear browsing data" dialog.

3. **AC4** — The listener is registered on `document` (not on the textarea or any specific element), so it fires regardless of focused element.

4. **AC5** — `index.html` adds a `.shortcut-hint` `<span>` with semantic `<kbd>` elements (`⌘/Ctrl`, `Shift`, `Del`) visually adjacent to the Clear button inside a `.clear-action` wrapper. The `aria-label` further aids accessibility.

5. **AC6** — Delegating to `clearButton.click()` means the handler runs `textarea.value = ""; render("");` even when already empty — `render("")` on empty input is a graceful no-op per the existing logic.

6. **AC7 & AC8** — The new `keydown` listener uses a unique key combination (`Shift+Meta/Ctrl+Delete`) that does not overlap with any clipboard shortcut or other existing interaction. All prior listeners remain untouched.

7. **AC9** — No external scripts, CDN links, or npm packages were introduced.

8. **AC10** — `docs/specs/COM-17.md` is created and documents the feature, constraints, and acceptance criteria.

**Constraints verified:** `analyzer.js` not modified; `event.keyCode` not used; no ES modules or `<script type="module">`; IIFE pattern preserved (listener placed inside the existing `DOMContentLoaded` flow); no dependency additions.

**Browser compatibility:** The app uses classic `<script>` tags (no `type="module"`), `event.key` is universally supported in evergreen browsers, and the `file://` constraint is fully respected.

**Smoke test:** PASS.

---

## References

- JIRA: [COM-17](https://everestlogix.atlassian.net/browse/COM-17)
- Branch: `feature/COM-17-keyboard-shortcut-for-clear-action`
- Rounds to approval: 1

---
*Generated by ai-orchestrator on 2026-04-02T20:38:30Z*
