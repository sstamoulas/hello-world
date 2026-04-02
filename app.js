import { analyze } from "./analyzer.js";

const textInput = document.getElementById("text-input");
const clearButton = document.getElementById("clear-btn");
const outputs = {
  charCount: document.getElementById("char-count"),
  charCountNoSpaces: document.getElementById("char-count-no-spaces"),
  wordCount: document.getElementById("word-count"),
  sentenceCount: document.getElementById("sentence-count"),
  paragraphCount: document.getElementById("paragraph-count"),
  avgWordLength: document.getElementById("avg-word-length"),
  readingTime: document.getElementById("reading-time"),
  uniqueWordCount: document.getElementById("unique-word-count")
};
const topWordsList = document.getElementById("top-words");
const topWordsSummary = document.getElementById("top-words-summary");

function formatReadingTime(readingTimeSec) {
  if (readingTimeSec === 0) {
    return "0 min";
  }

  if (readingTimeSec < 60) {
    return "< 1 min";
  }

  return `${Math.round(readingTimeSec / 60)} min`;
}

function renderTopWords(topWords) {
  topWordsList.replaceChildren();

  if (!topWords.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "Top non-stopword frequencies will appear here.";
    topWordsList.append(emptyItem);
    topWordsSummary.textContent = "No words yet";
    return;
  }

  const highestCount = topWords[0].count;
  const items = topWords.map(({ word, count }) => {
    const listItem = document.createElement("li");
    listItem.className = "top-word-item";

    const row = document.createElement("div");
    row.className = "top-word-row";

    const label = document.createElement("span");
    label.className = "top-word-label";
    label.textContent = word;

    const badge = document.createElement("span");
    badge.className = "top-word-count";
    badge.textContent = count;

    const track = document.createElement("div");
    track.className = "bar-track";

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = `${(count / highestCount) * 100}%`;

    row.append(label, badge);
    track.append(bar);
    listItem.append(row, track);

    return listItem;
  });

  topWordsList.append(...items);
  topWordsSummary.textContent = `${topWords.length} tracked`;
}

function updateView() {
  const result = analyze(textInput.value);

  outputs.charCount.textContent = result.charCount;
  outputs.charCountNoSpaces.textContent = result.charCountNoSpaces;
  outputs.wordCount.textContent = result.wordCount;
  outputs.sentenceCount.textContent = result.sentenceCount;
  outputs.paragraphCount.textContent = result.paragraphCount;
  outputs.avgWordLength.textContent = result.avgWordLength.toFixed(1);
  outputs.readingTime.textContent = formatReadingTime(result.readingTimeSec);
  outputs.uniqueWordCount.textContent = result.uniqueWordCount;

  renderTopWords(result.topWords);
}

textInput.addEventListener("input", updateView);
clearButton.addEventListener("click", () => {
  textInput.value = "";
  textInput.dispatchEvent(new Event("input"));
});

updateView();
