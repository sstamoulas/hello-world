# COM-18: Add "Copy to Clipboard" Functionality

## Implementation Specification

status: PLAN
round: 1
ticket: COM-18
---

## Objective
Add a "Copy to Clipboard" button to the application's output/results area so that users of this offline utility can easily export their processed text without needing to manually select and copy it. Because the app runs from the `file://` protocol with no local server, the implementation must use a robust clipboard strategy that works in that environment.

## Stack & Conventions
Vanilla JavaScript browser application — no framework, no bundler, no package manager. The stack consists of a single `index.html` entry point, a `style.css` stylesheet, and two classic (non-module) JavaScript files: `analyzer.js` (core text processing logic) and `app.js` (UI/event wiring). All scripts are loaded via standard `<script src="...">` tags. This is an offline utility intended to be opened directly from the filesystem (`file://` protocol).

## Files to Create or Modify
- `index.html` — Add a "Copy to Clipboard" `<button>` element inside or immediately below the output/results container.
- `app.js` — Implement the `copyToClipboard()` handler function and wire it to the new button's `click` event. Include both the modern `navigator.clipboard.writeText()` path and the legacy `document.execCommand('copy')` fallback.
- `style.css` — Add styles for the copy button in its default, hover, active, and post-copy "Copied!" confirmation states.

## Implementation Notes

### Clipboard Strategy (Critical — `file://` compatibility)
`navigator.clipboard` is a Promises-based API that requires either a secure context (HTTPS) or `localhost`. When the app is opened via `file://`, the browser may classify it as a non-secure context and deny access to `navigator.clipboard`. A two-path approach is required:

```javascript
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onCopySuccess).catch(function() {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
    onCopySuccess();
  } catch (err) {
    onCopyError();
  } finally {
    document.body.removeChild(textarea);
  }
}
```

Wrap all JS in the existing IIFE pattern (or match whatever pattern `app.js` already uses) — do **not** introduce `import`/`export` or `<script type="module">`.

### What Gets Copied
The button must copy the **current text output rendered in the results/output area** — i.e., the text that `analyzer.js` has produced and that `app.js` has rendered to the DOM. Read that value from the output element's `textContent` (or `value` if it is a `<textarea>`) at the moment the button is clicked, not from a cached variable.

### Visual Feedback
On successful copy, temporarily change the button label to "✓ Copied!" and disable the button for ~2 seconds, then revert to "Copy to Clipboard". On failure, change the label to "Copy failed" briefly before reverting.

```javascript
function onCopySuccess() {
  copyBtn.textContent = '✓ Copied!';
  copyBtn.disabled = true;
  setTimeout(function() {
    copyBtn.textContent = 'Copy to Clipboard';
    copyBtn.disabled = false;
  }, 2000);
}

function onCopyError() {
  copyBtn.textContent = 'Copy failed';
  setTimeout(function() {
    copyBtn.textContent = 'Copy to Clipboard';
  }, 2000);
}
```

### Button Placement
Place the button directly below or adjacent to the output container — not inside the input/editor area. Use an `id="copy-btn"` attribute for reliable JS selection.

### Guard Against Empty Output
If the output area is empty (no analysis has been run yet), the button should either be hidden or disabled with a `title="Run analysis first"` tooltip to prevent confusing UX.

## Browser & Runtime Compatibility
This application is opened via `file://` protocol with no local server. Therefore:
- **Do NOT use ES modules** (`import`/`export` or `<script type="module">`). Chrome and Firefox block cross-origin module fetches on `file://`.
- **Do NOT rely solely on `navigator.clipboard`** — it may be unavailable on `file://`. The `document.execCommand('copy')` fallback via a transient off-screen `<textarea>` is required.
- All new JavaScript must live in `app.js` as classic script code, consistent with the existing codebase.

## Constraints
- Do NOT modify `analyzer.js` — clipboard functionality is UI/app-layer concern only.
- Do NOT introduce any new external dependencies, CDN links, or `npm` packages.
- Do NOT change the existing layout of the input area or alter how analysis results are currently rendered.
- Do NOT use ES modules or `<script type="module">`.
- Preserve all existing event listeners and application behaviour in `app.js`.

## Acceptance Criteria
1. A "Copy to Clipboard" button is visible in the UI below or adjacent to the analysis output area.
2. Clicking the button after running an analysis copies the full output text to the system clipboard.
3. The button label temporarily changes to "✓ Copied!" for ~2 seconds after a successful copy, then reverts.
4. The clipboard copy works when the `index.html` file is opened directly from the filesystem via `file://` (tested in Chrome and/or Firefox without a local server).
5. If `navigator.clipboard` is unavailable, the `document.execCommand('copy')` fallback is invoked automatically and succeeds.
6. The button is either hidden or disabled (with a tooltip) when no analysis output is present.
7. Clicking the button does not alter, clear, or re-trigger the analysis — it is a read-only operation on the existing output.
8. No new external scripts, stylesheets, or dependencies are added to the project.
9. All existing functionality (text input, analysis trigger, results display) continues to work unchanged.
```

---

## Review & Approval


All nine acceptance criteria are satisfied and all constraints respected.

**AC-by-AC verification:**

1. **Button visible in UI** — `#copy-btn` is added in `index.html` inside `.results-actions` immediately below the stats section. ✓
2. **Copies full output on click** — `getCopyText()` assembles a labelled multi-line string from every `[data-stat]` element and passes it to `copyToClipboard()`. ✓
3. **"✓ Copied!" feedback for ~2 s** — `setCopyButtonFeedback("✓ Copied!", "is-success", true)` sets the label and disables the button; `window.setTimeout` → `setCopyButtonIdleState()` reverts after 2000 ms. ✓
4. **Works under `file://`** — Two-path strategy: `navigator.clipboard.writeText()` first, with `.catch()` falling through to `fallbackCopy()`; no `<script type="module">` anywhere. ✓
5. **`execCommand` fallback** — `fallbackCopy()` creates an off-screen `<textarea>`, calls `document.execCommand("copy")`, removes the element in `finally`, and triggers the appropriate feedback state. ✓
6. **Disabled when empty** — Button initialises as `disabled` with `title="Run analysis first"` in HTML; `setCopyButtonIdleState()` re-evaluates `textarea.value.trim().length > 0` after every `render()` call. ✓
7. **Read-only operation** — `copyToClipboard()` only reads DOM state; no analysis re-trigger, no output mutation. ✓
8. **No new external dependencies** — Only `app.js`, `index.html`, and `style.css` are touched; no CDN or `<script src>` additions. ✓
9. **Existing functionality unchanged** — All pre-existing event listeners (`input`, `click` on clear/theme, `render`) are untouched. ✓

**Constraints:** `analyzer.js` is not modified; no ES modules introduced; IIFE wrapper preserved; layout of input area and results rendering untouched.

**Noted deviation** (assembling a formatted summary from multiple `[data-stat]` fields rather than reading a single output element) is architecturally sound given the multi-field UI and produces more useful clipboard content than raw concatenated DOM text would.

---

## References

- JIRA: [COM-18](https://everestlogix.atlassian.net/browse/COM-18)
- Branch: `feature/COM-18-add-copy-to-clipboard-functionality`
- Rounds to approval: 1

---
*Generated by ai-orchestrator on 2026-04-02T19:35:33Z*
