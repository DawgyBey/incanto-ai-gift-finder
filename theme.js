/**
 * ============================================================================
 * INCANTO — js/theme.js
 * ============================================================================
 * Purpose:
 *   Persists light/dark theme on <html data-theme="..."> for CSS variables.
 *   UI-only: wire to a real design system token pipeline when you add React.
 *
 * Customize:
 *   - Change storage key string if it collides with other apps
 * ============================================================================
 */
(function () {
  const STORAGE_KEY = "incanto-theme";

  function getPreferred() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function initTheme() {
    const saved = getPreferred();
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
      return;
    }
    // Default: light (per product brief). Uncomment to follow OS preference:
    // if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    //   applyTheme("dark");
    // }
    applyTheme("light");
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore private mode */
    }
  }

  document.addEventListener("DOMContentLoaded", initTheme);

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-theme-toggle]");
    if (!btn) return;
    e.preventDefault();
    toggleTheme();
  });
})();
