/**
 * ============================================================================
 * INCANTO — js/categories-page.js
 * ============================================================================
 * Purpose:
 *   Category chips filter the visible product subset on categories.html.
 * ============================================================================
 */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const chips = Array.from(document.querySelectorAll("[data-category-chip]"));
    const cards = Array.from(document.querySelectorAll("[data-category-card]"));
    if (!chips.length || !cards.length) return;

    function apply(cat) {
      cards.forEach(function (card) {
        const c = card.getAttribute("data-category-card");
        const show = cat === "All" || c === cat;
        card.style.display = show ? "" : "none";
      });
      chips.forEach(function (chip) {
        chip.classList.toggle("is-active", chip.getAttribute("data-category-chip") === cat);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        apply(chip.getAttribute("data-category-chip") || "All");
      });
    });

    apply("All");
  });
})();
