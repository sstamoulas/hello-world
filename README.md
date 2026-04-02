# hello-world

Hi Stamatios, 

       This is just a test to update and commit a change to the readme file

## Real-Time Text Analyzer

This repository now includes a fully client-side Single Page Application for live text analysis. It runs entirely offline with vanilla HTML, CSS, and JavaScript, and updates all metrics on every keystroke without reloading the page.

### Features

- Live character count, including whitespace
- Live character count excluding whitespace
- Live word, sentence, and paragraph totals
- Average word length with one decimal place
- Reading time estimate based on 200 words per minute
- Unique word count
- Top-word frequency chart excluding common English stopwords
- Clear button to reset the editor and all computed stats instantly
- Responsive layout for desktop and mobile screens

### Run Locally

Open `index.html` directly in any modern browser. No server, build step, package manager, or internet connection is required.

### Computed Statistics

- `Characters`: total number of characters in the text, including spaces and punctuation
- `No Spaces`: total number of characters after removing all whitespace
- `Words`: whitespace-delimited token count
- `Sentences`: text segments separated by `.`, `!`, or `?`
- `Paragraphs`: blocks of text separated by blank lines
- `Avg Word Length`: average length of normalized words, shown to one decimal place
- `Reading Time`: displays `< 1 min` for short text and rounded whole minutes for longer text
- `Unique Words`: count of case-insensitive distinct words
- `Top Words`: the ten most frequent non-stopwords sorted from highest to lowest frequency
