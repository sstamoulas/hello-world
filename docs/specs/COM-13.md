# COM-13

## Feature Summary

Real-Time Text Analyzer is a single-page, offline-friendly web application that evaluates
user-supplied text as it is typed. The page runs directly from `file://`, uses only classic
script tags, and splits responsibilities between a pure `analyzer.js` engine and a DOM-focused
`app.js` controller.

## Stat Definitions

| Stat | Key | Definition |
| --- | --- | --- |
| Characters | `charCount` | `text.length` |
| Characters No Spaces | `charNoSpaces` | `text.replace(/\s/g, "").length` |
| Words | `wordCount` | `text.trim().split(/\s+/).filter(Boolean).length` |
| Sentences | `sentenceCount` | Count matches of `/[^.!?]*[.!?]+/g` |
| Paragraphs | `paragraphCount` | `text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length` |
| Average Word Length | `avgWordLength` | Sum of word lengths divided by `wordCount`, formatted with `toFixed(1)` |
| Reading Time | `readingTime` | Based on 200 words per minute, formatted as `"< 1 min"` or `"N min read"` |
| Top 5 Words | `topWords` | Lowercase words with punctuation stripped, excluding stop-words, sorted by frequency descending and limited to 5 |

## Stop-Word List

The analyzer excludes the following built-in stop-words from `topWords`:

`a`, `an`, `the`, `and`, `or`, `but`, `in`, `on`, `at`, `to`, `for`, `of`, `with`, `is`,
`are`, `was`, `were`, `be`, `been`, `being`, `have`, `has`, `had`, `do`, `does`, `did`,
`will`, `would`, `could`, `should`, `i`, `you`, `he`, `she`, `it`, `we`, `they`, `this`,
`that`

## UI Notes

- The page includes a textarea, a clear button, a responsive stat grid, and a character-limit
  progress bar with warning states at 80% and 100% of 5,000 characters.
- All stat outputs are bound with `data-stat` attributes that match the keys returned by
  `Analyzer.analyze()`.
- Empty-state values initialize to `0`, `0.0`, `< 1 min`, and an empty top-words list.
