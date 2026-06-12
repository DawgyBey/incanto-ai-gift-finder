/**
 * ============================================================================
 * INCANTO — js/saved-gifts.js
 * ============================================================================
 * Purpose:
 *   “Saved gifts” are bookmarked recommendations (separate from wishlist).
 *   Stored as product ids in localStorage: incanto-saved
 * ============================================================================
 */
(function (global) {
  const KEY = "incanto-saved";

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

  function add(id) {
    const ids = readIds();
    if (!ids.includes(id)) ids.unshift(id);
    writeIds(ids.slice(0, 40));
  }

  global.IncantoSaved = { readIds: readIds, add: add };
})(window);
