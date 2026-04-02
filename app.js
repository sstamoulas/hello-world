(function () {
  function flashValue(element) {
    if (element._flashTimer) {
      clearTimeout(element._flashTimer);
    }

    element.classList.remove("is-updating");
    void element.offsetWidth;
    element.classList.add("is-updating");

    element._flashTimer = setTimeout(function () {
      element.classList.remove("is-updating");
      element._flashTimer = null;
    }, 300);
  }

  function renderTopWords(list, words) {
    var fragment = document.createDocumentFragment();
    var item;
    var count;
    var index;

    list.innerHTML = "";

    if (!words.length) {
      item = document.createElement("li");
      item.className = "top-words__empty";
      item.textContent = "No significant words yet.";
      fragment.appendChild(item);
      list.appendChild(fragment);
      return;
    }

    for (index = 0; index < words.length; index += 1) {
      item = document.createElement("li");
      item.className = "top-words__item";
      item.appendChild(document.createTextNode(words[index].word + " "));

      count = document.createElement("span");
      count.className = "top-words__count";
      count.textContent = "(" + words[index].count + ")";
      item.appendChild(count);
      fragment.appendChild(item);
    }

    list.appendChild(fragment);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var textarea = document.getElementById("text-input");
    var topWordsList = document.getElementById("top-words");
    var statElements = document.querySelectorAll("[data-stat]");

    function update() {
      var stats = Analyzer.analyze(textarea.value);
      var index;
      var element;
      var key;
      var nextValue;

      for (index = 0; index < statElements.length; index += 1) {
        element = statElements[index];
        key = element.getAttribute("data-stat");
        nextValue = stats[key];

        if (key === "avgWordLength") {
          nextValue = nextValue.toFixed(1);
        }

        nextValue = String(nextValue);

        if (element.textContent !== nextValue) {
          element.textContent = nextValue;
          flashValue(element);
        }
      }

      renderTopWords(topWordsList, stats.topWords);
    }

    textarea.addEventListener("input", update);
    update();
  });
}());
