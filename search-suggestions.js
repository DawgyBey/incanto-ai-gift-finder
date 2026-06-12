/**
 * ============================================================================
 * INCANTO — js/search-suggestions.js
 * ============================================================================
 * Purpose:
 *   Homepage hero search: shows example queries in a dropdown for “smart” UX.
 * ============================================================================
 */
(function () {
  const EXAMPLES = [
    "Gift for 18 year old gamer under Rs. 6,600",
    "Anniversary gift for girlfriend",
    "Gift for tech lover who travels",
    "Birthday gift for a bookworm",
    "Housewarming gift under Rs. 10,560",
  ];

  document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("hero-search-input");
    const box = document.getElementById("hero-search-suggest");
    if (!input || !box) return;

    function render(filter) {
      const q = (filter || "").toLowerCase();
      const items = EXAMPLES.filter(function (ex) {
        return !q || ex.toLowerCase().includes(q);
      });
      box.innerHTML = "";
      items.forEach(function (text) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = text;
        b.addEventListener("click", function () {
          input.value = text;
          box.classList.remove("is-open");
        });
        box.appendChild(b);
      });
      box.classList.toggle("is-open", items.length > 0 && document.activeElement === input);
    }

    input.addEventListener("focus", function () {
      render(input.value);
    });
    input.addEventListener("input", function () {
      render(input.value);
    });
    input.addEventListener("blur", function () {
      window.setTimeout(function () {
        box.classList.remove("is-open");
      }, 120);
    });
  });
})();
