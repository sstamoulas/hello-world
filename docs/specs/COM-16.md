# COM-16: Add Flesch-Kincaid Readability Scoring

## Implementation Specification

status: PLAN
round: 1
ticket: COM-16
---

## Objective
Add a live readability indicator to the offline text analyzer using the Flesch Reading Ease and Flesch-Kincaid Grade Level formulas. The feature must run entirely in-browser with no external libraries and provide both numeric scores and a plain-language difficulty label.

## Stack & Conventions
Vanilla JavaScript browser application with `index.html`, `style.css`, `analyzer.js`, and `app.js` loaded as classic scripts. The app runs directly from `file://`, so the implementation must avoid modules and modern-only syntax that would reduce browser compatibility.

## Files to Create or Modify
- `analyzer.js` — add syllable counting and extend the returned stats object with readability metrics.
- `app.js` — render the readability summary inside the existing stats update flow.
- `index.html` — add a live region container for the readability output.
- `style.css` — style the readability block and define five score-band classes.
- `docs/specs/COM-16.md` — document the formulas, heuristic, bands, and empty-state behaviour.

## Formulas

### Flesch Reading Ease

```text
206.835 − (1.015 × words/sentences) − (84.6 × syllables/words)
```

- Clamp the display value to the range `0` to `100`.
- Return `null` when `wordCount === 0` or `sentenceCount === 0`.

### Flesch-Kincaid Grade Level

```text
0.39 × (words/sentences) + 11.8 × (syllables/words) − 15.59
```

- Clamp the display value to the range `0` to `18`.
- Return `null` when `wordCount === 0` or `sentenceCount === 0`.

## Syllable Counting Heuristic
Use a lightweight JavaScript heuristic for maximum `file://` compatibility:

1. Convert the word to lowercase.
2. Strip non-letter characters with `/[^a-z]/g`.
3. Return `0` for an empty normalized token.
4. Return `1` for words with three or fewer letters.
5. Remove a trailing silent `e` with `/e$/`.
6. Count vowel groups with `/[aeiouy]+/g`.
7. Return at least `1` syllable for any non-empty word.

This heuristic is intentionally approximate, but it is fast, dependency-free, and adequate for banded readability guidance.

## Score Bands

| FRE Score | Label            | CSS Class         |
|-----------|------------------|-------------------|
| 90-100    | Very Easy        | `fre-very-easy`   |
| 70-89     | Easy             | `fre-easy`        |
| 60-69     | Standard         | `fre-standard`    |
| 30-59     | Difficult        | `fre-difficult`   |
| 0-29      | Very Difficult   | `fre-hard`        |

## Rendering Behaviour
- When readability data is available, render a single line in the stats area in the form:

```text
Readability: 68.4 | Grade Level: 8 | Standard
```

- Round Flesch Reading Ease to one decimal place.
- Round Flesch-Kincaid Grade Level to the nearest whole number for display.
- Apply the matching `fre-*` CSS class to the readability container.

## Fallback Behaviour
- If there are zero words or zero sentences, both readability scores must be `null`.
- In the empty state, the readability container should be blank and hidden.
- The feature stores no data in `localStorage` or any other persistent storage.

## Constraints
- No external readability libraries or CDN scripts.
- No ES modules or regex lookbehind assertions.
- Reuse the existing word token list from `analyzer.js`; do not duplicate word-count logic.
- Preserve all existing features and event listeners.
