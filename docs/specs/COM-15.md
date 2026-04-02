# COM-15: Optional Word Count Goal

## Objective
Add an optional word-count goal to the offline text analyzer so users can set a target such as
`500` words and see live progress toward that goal as they type. Leaving the setting blank keeps
the feature disabled and hides the indicator entirely.

## Scope
- Add a number input labelled `Word count goal` to the editor settings area.
- Persist the goal in `localStorage` using the key `wordCountGoal`.
- Restore the saved value on page load.
- Show a live progress indicator in the results panel when a valid goal is active.
- Reuse the existing `Analyzer.analyze()` result consumed by `app.js`; do not change
  `analyzer.js`.

## Behaviour
### Goal Input
- The input uses `type="number"` with `min="1"`.
- Blank input disables the feature.
- Values less than `1` are treated as disabled.
- Valid positive integers are stored immediately in `localStorage`.

### Indicator States
- Hidden:
  The goal input is blank or resolves to `0` / invalid.
- In progress:
  Display `Aiming for {goal} words — {current} / {goal} ({percent}%)`.
- Goal reached:
  When `current >= goal`, display `✓ Word goal reached! {current} / {goal} words`.

## Rendering Rules
- The indicator updates whenever:
  - the textarea content changes
  - the word goal input changes
  - the Clear action runs
- Percentage is computed as:

```js
Math.min(100, Math.round((currentWordCount / goal) * 100))
```

- Clearing the editor resets the live progress to `0 / {goal}` but does not remove the saved
  goal or empty the goal input.

## Storage
- Key: `wordCountGoal`
- Stored value: string form of the positive integer currently in the input

## Constraints
- No new dependencies.
- No ES modules.
- No changes to `analyzer.js`.
- Existing character soft-limit, copy-to-clipboard, theme toggle, and keyboard clear behaviour
  remain unchanged.
