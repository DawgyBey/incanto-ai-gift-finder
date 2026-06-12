/**
 * ============================================================================
 * INCANTO — js/nav.js
 * ============================================================================
 * Purpose:
 *   - Sticky header shrink on scroll (premium SaaS micro-interaction)
 *   - Mobile drawer open/close + body scroll lock
 *   - Optional: ESC closes drawer
 *
 * Customize:
 *   - SCROLL_THRESHOLD: pixels before header adds .is-scrolled
 * ============================================================================
 */
(function () {
  const SCROLL_THRESHOLD = 12;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function initStickyHeader() {
    const header = qs("[data-site-header]");
    if (!header) return;

    function onScroll() {
      if (window.scrollY > SCROLL_THRESHOLD) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileNav() {
    const toggle = qs("[data-nav-toggle]");
    const drawer = qs("[data-mobile-drawer]");
    if (!toggle || !drawer) return;

    function setOpen(open) {
      toggle.classList.toggle("is-open", open);
      drawer.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    }

    toggle.addEventListener("click", function () {
      const open = !drawer.classList.contains("is-open");
      setOpen(open);
    });

    drawer.addEventListener("click", function (e) {
      const a = e.target.closest("a");
      if (a) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initStickyHeader();
    initMobileNav();
  });

  // If the full wizard markup isn't present on this page, ensure any
  // `[data-wizard-open]` control navigates to the homepage where the
  // wizard is embedded so it can open.
  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("incanto-wizard")) return;
    document.addEventListener(
      "click",
      function (e) {
        const openEl = e.target.closest("[data-wizard-open]");
        if (!openEl) return;
        e.preventDefault();
        // Use relative path to homepage — keeps same origin and works
        // from subfolders if pages are moved.
        window.location.href = "index.html#incanto-wizard";
      },
      true
    );
  });
})();
