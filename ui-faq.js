/**
 * ============================================================================
 * INCANTO — js/ui-faq.js
 * ============================================================================
 * Purpose:
 *   Accessible-ish accordion: one item open at a time (optional behavior).
 *   Toggles .is-open on .faq-item and sets max-height via content scrollHeight.
 *
 * Customize:
 *   - Set allowMultiple = true to keep multiple answers expanded
 * ============================================================================
 */
(function () {
  const allowMultiple = false;

  document.addEventListener("DOMContentLoaded", function () {
    const items = Array.from(document.querySelectorAll("[data-faq-item]"));
    if (!items.length) return;

    items.forEach(function (item) {
      const btn = item.querySelector("[data-faq-q]");
      const panel = item.querySelector("[data-faq-a]");
      if (!btn || !panel) return;

      btn.addEventListener("click", function () {
        const willOpen = !item.classList.contains("is-open");

        if (!allowMultiple && willOpen) {
          items.forEach(function (other) {
            if (other === item) return;
            other.classList.remove("is-open");
            const p = other.querySelector("[data-faq-a]");
            if (p) p.style.maxHeight = "0px";
            const b = other.querySelector("[data-faq-q]");
            if (b) b.setAttribute("aria-expanded", "false");
          });
        }

        item.classList.toggle("is-open", willOpen);
        btn.setAttribute("aria-expanded", willOpen ? "true" : "false");

        const inner = panel.querySelector(".faq-item__a-inner");
        const h = inner ? inner.scrollHeight + 24 : 200;
        panel.style.maxHeight = willOpen ? h + "px" : "0px";
      });
    });
  });
})();
