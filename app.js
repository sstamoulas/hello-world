(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function setCardValue(card, value) {
    var valueNode = card.querySelector(".card__value");
    var nextValue = String(value);
    var previousValue = valueNode.textContent;

    if (previousValue === nextValue) {
      return;
    }

    valueNode.textContent = nextValue;
    card.classList.remove("card--updated");
    if (card._updateTimer) {
      clearTimeout(card._updateTimer);
    }

    void card.offsetWidth;
    card.classList.add("card--updated");
    card._updateTimer = setTimeout(function () {
      card.classList.remove("card--updated");
      card._updateTimer = null;
    }, 600);
  }

  function renderTopWords(listNode, words) {
    var fragment = document.createDocumentFragment();
    var item;
    var text;
    var wordNode;
    var countNode;
    var index;

    listNode.innerHTML = "";

    if (!words.length) {
      item = document.createElement("li");
      item.className = "top-words__empty";
      item.textContent = "No repeated words yet.";
      fragment.appendChild(item);
      listNode.appendChild(fragment);
      return;
    }

    for (index = 0; index < words.length; index += 1) {
      item = document.createElement("li");
      item.className = "top-words__item";

      wordNode = document.createElement("span");
      wordNode.className = "top-words__word";
      wordNode.textContent = words[index].word;

      text = document.createTextNode(" ");

      countNode = document.createElement("span");
      countNode.className = "top-words__count";
      countNode.textContent = "(" + words[index].count + ")";

      item.appendChild(wordNode);
      item.appendChild(text);
      item.appendChild(countNode);
      fragment.appendChild(item);
    }

    listNode.appendChild(fragment);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var textarea = byId("text-input");
    var clearButton = byId("clear-button");
    var topWordsList = byId("top-words");
    var metricCards = {};
    var metricNames = [
      "wordCount",
      "charCount",
      "charCountNoSpaces",
      "sentenceCount",
      "paragraphCount",
      "readingTime",
      "avgWordLength"
    ];
    var index;

    for (index = 0; index < metricNames.length; index += 1) {
      metricCards[metricNames[index]] = document.querySelector('[data-metric="' + metricNames[index] + '"]');
    }

    function updateMetrics() {
      var text = textarea.value;

      setCardValue(metricCards.wordCount, Analyzer.wordCount(text));
      setCardValue(metricCards.charCount, Analyzer.charCount(text));
      setCardValue(metricCards.charCountNoSpaces, Analyzer.charCountNoSpaces(text));
      setCardValue(metricCards.sentenceCount, Analyzer.sentenceCount(text));
      setCardValue(metricCards.paragraphCount, Analyzer.paragraphCount(text));
      setCardValue(metricCards.readingTime, Analyzer.readingTime(text));
      setCardValue(metricCards.avgWordLength, Analyzer.avgWordLength(text).toFixed(1));

      renderTopWords(topWordsList, Analyzer.topWords(text, 5));
    }

    textarea.addEventListener("input", updateMetrics);
    clearButton.addEventListener("click", function () {
      textarea.value = "";
      updateMetrics();
      textarea.focus();
    });

    updateMetrics();
  });
}());
