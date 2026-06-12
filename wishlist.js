/**
 * ============================================================================
 * INCANTO — js/wishlist.js
 * ============================================================================
 * Purpose:
 *   Client-side wishlist using localStorage (array of product ids).
 *   Powers heart buttons across pages + wishlist.html rendering.
 *
 * Storage:
 *   localStorage key: incanto-wishlist → JSON string array
 * ============================================================================
 */
(function (global) {
  const KEY = "incanto-wishlist";

  function readIds() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeIds(ids) {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }

  function has(id) {
    return readIds().includes(id);
  }

  function toggle(id) {
    const ids = readIds();
    const idx = ids.indexOf(id);
    if (idx === -1) ids.push(id);
    else ids.splice(idx, 1);
    writeIds(ids);
    return idx === -1;
  }

  function syncButtons() {
    const ids = readIds();
    document.querySelectorAll("[data-wishlist-toggle]").forEach(function (btn) {
      const id = btn.getAttribute("data-product-id");
      if (!id) return;
      btn.classList.toggle("is-active", ids.includes(id));
      btn.setAttribute("aria-pressed", ids.includes(id) ? "true" : "false");
    });
  }

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-wishlist-toggle]");
    if (!btn) return;
    const id = btn.getAttribute("data-product-id");
    if (!id) return;
    const added = toggle(id);
    btn.classList.toggle("is-active", added);
    btn.setAttribute("aria-pressed", added ? "true" : "false");
    btn.classList.add("is-animating");
    window.setTimeout(function () {
      btn.classList.remove("is-animating");
    }, 500);
    if (window.IncantoToast) {
      window.IncantoToast.show({
        message: added ? "Added to wishlist." : "Removed from wishlist.",
        variant: "success",
      });
    }
    document.dispatchEvent(new CustomEvent("incanto:wishlist-changed"));
  });

  document.addEventListener("DOMContentLoaded", function () {
    syncButtons();
  });

  global.IncantoWishlist = {
    readIds: readIds,
    has: has,
    toggle: toggle,
    syncButtons: syncButtons,
  };
})(window);
