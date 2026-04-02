# COM-17: Add Clear Keyboard Shortcut

## Implementation Specification

status: PLAN
round: 1
ticket: COM-17
---

## Objective
Add a `Cmd/Ctrl + Shift + Delete` keyboard shortcut that triggers the existing "Clear" action in the text-analyzer application. This removes mouse travel during repetitive editing without changing any underlying clear logic.

## Stack & Conventions
Vanilla JavaScript browser application — no framework, no bundler, no package manager. Entry point is `index.html`, styles in `style.css`, core text-processing logic in `analyzer.js`, and all UI/event wiring in `app.js`. Scripts are loaded as classic (non-module) `<script src="...">` tags. The app is an offline utility opened directly from the filesystem (`file://` protocol). All JavaScript follows an IIFE wrapper pattern.

## Files to Create or Modify
- `app.js` — Register a document-level `keydown` listener that detects `(metaKey || ctrlKey) + shiftKey + Delete` and delegates to the existing clear action via the clear button.
- `index.html` — Add a visible keyboard-shortcut hint adjacent to the existing Clear button.
- `style.css` — Add minimal muted styles for the shortcut hint and its `<kbd>` tokens.
- `docs/specs/COM-17.md` — Document the feature and expected behaviour.

## Implementation Notes

### Keyboard Shortcut Handling
Register a single `keydown` listener on `document` after the existing DOM references are available. The handler should check for `event.key === "Delete"` combined with `event.shiftKey` and either `event.metaKey` or `event.ctrlKey`.

```javascript
document.addEventListener("keydown", function (event) {
  var isShortcutPressed = event.shiftKey && event.key === "Delete" && (event.metaKey || event.ctrlKey);

  if (!isShortcutPressed) {
    return;
  }

  event.preventDefault();
  clearButton.click();
});
```

- Use `event.key`, not `event.keyCode`.
- Call `event.preventDefault()` to suppress conflicting browser shortcuts such as the clear-browsing-data dialog.
- Delegate through `clearButton.click()` so the keyboard path stays aligned with the existing click handler.

### UI Discoverability
Expose the shortcut beside the Clear button using semantic `<kbd>` elements inside a `.shortcut-hint` wrapper. The hint should remain visually secondary to the button label.

## Browser & Runtime Compatibility
The app runs directly from `file://`, so all new JavaScript must stay in `app.js` as classic script code. The `keydown` event and `event.key` are supported in all target evergreen browsers and require no additional runtime support.

## Constraints
- Do NOT modify `analyzer.js`.
- Do NOT duplicate the clear logic; delegate to the existing clear button or its handler.
- Do NOT add external dependencies, CDN assets, or npm packages.
- Do NOT use `event.keyCode`.
- Do NOT use ES modules or `<script type="module">`.
- Preserve all existing event listeners and current application behaviour.

## Acceptance Criteria
1. Pressing `Cmd+Shift+Delete` on macOS clears the textarea and resets all stats exactly like clicking Clear.
2. Pressing `Ctrl+Shift+Delete` on Windows/Linux does the same.
3. The shortcut handler calls `event.preventDefault()`.
4. The shortcut works regardless of focused element.
5. A visible shortcut hint appears adjacent to the Clear button.
6. Triggering the shortcut on already-empty input is a no-op with no errors.
7. The shortcut does not interfere with the Copy to Clipboard behaviour or any other existing interaction.
8. All existing functionality continues to work unchanged.
9. No new external scripts, stylesheets, or dependencies are added.
10. This spec file exists in `docs/specs/COM-17.md`.
