/**
 * ============================================================================
 * INCANTO — js/page-transitions.js
 * ============================================================================
 * Purpose:
 *   Adds a subtle fade-out before navigating to other local HTML pages.
 *   Purely cosmetic for static sites; SPAs use router transitions instead.
 *
 * Customize:
 *   - Add more selectors to skipTransition for external links
 * ============================================================================
 */
(function () {
  function isInternalPageLink(a) {
    if (!a || a.target === "_blank") return false;
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
      return false;
    if (href.startsWith("http://") || href.startsWith("https://")) {
      try {
        const u = new URL(href, window.location.origin);
        return u.origin === window.location.origin && /\.html(\?|$)/i.test(u.pathname);
      } catch {
        return false;
      }
    }
    return /\.html(\?|$)/i.test(href);
  }

  document.addEventListener("click", function (e) {
    const a = e.target.closest("a");
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!isInternalPageLink(a)) return;
    if (a.hasAttribute("data-no-transition")) return;

    e.preventDefault();
    document.body.classList.add("is-page-exit");
    const href = a.href;
    window.setTimeout(function () {
      window.location.href = href;
    }, 220);
  });

  window.addEventListener("pageshow", function () {
    document.body.classList.remove("is-page-exit");
  });
})();
