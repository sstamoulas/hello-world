# COM-13

## Ticket Key
COM-13

## Objective Summary
Build a self-contained, single-page Real-Time Text Analyzer web utility using vanilla
HTML, CSS, and JavaScript. The application accepts user-typed text and immediately
(on every keystroke) computes and displays a rich set of statistics: character count,
character count excluding whitespace, word count, sentence count, paragraph count,
estimated reading time, average word length, and the top 5 most-frequent words.

## File Inventory
- `index.html` — Main shell with textarea input, stats grid container, top-words list
  container, and classic script tags for `analyzer.js` then `app.js`.
- `style.css` — Responsive stylesheet with CSS custom properties, sticky header,
  two-column layout, stat cards, top-words section, transitions, and accessible
  textarea focus styles.
- `analyzer.js` — Pure analysis functions exposed on `window.Analyzer`, including the
  `analyze` convenience wrapper.
- `app.js` — DOM wiring that updates stats and the ranked top-words list on every
  textarea input event.
- `docs/specs/COM-13.md` — Ticket specification document for COM-13.

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
