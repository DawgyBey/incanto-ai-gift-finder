/**
 * ============================================================================
 * INCANTO — js/dashboard-page.js
 * ============================================================================
 * Purpose:
 *   Populates dashboard.html with local wishlist/saved counts + recent rows.
 * ============================================================================
 */
(function () {
  function recentFromStorage() {
    const wish =
      (window.IncantoWishlist && window.IncantoWishlist.readIds && window.IncantoWishlist.readIds()) ||
      [];
    const saved =
      (window.IncantoSaved && window.IncantoSaved.readIds && window.IncantoSaved.readIds()) || [];
    const merged = [];
    wish.forEach(function (id) {
      merged.push({ id: id, kind: "Wishlist" });
    });
    saved.forEach(function (id) {
      merged.push({ id: id, kind: "Saved gift" });
    });
    return merged.slice(0, 6);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const products = window.INCANTO_PRODUCTS || [];
    const wishIds =
      (window.IncantoWishlist && window.IncantoWishlist.readIds && window.IncantoWishlist.readIds()) ||
      [];
    const savedIds =
      (window.IncantoSaved && window.IncantoSaved.readIds && window.IncantoSaved.readIds()) || [];

    const wEl = document.getElementById("dash-wish-count");
    const sEl = document.getElementById("dash-saved-count");
    const pEl = document.getElementById("dash-products-count");
    if (wEl) wEl.setAttribute("data-counter-target", String(wishIds.length));
    if (sEl) sEl.setAttribute("data-counter-target", String(savedIds.length));
    if (pEl) pEl.setAttribute("data-counter-target", String(products.length));

    const tbody = document.querySelector("[data-dash-recent]");
    if (tbody) {
      tbody.innerHTML = "";
      const rows = recentFromStorage();
      if (!rows.length) {
        tbody.innerHTML =
          '<tr><td colspan="3" class="text-muted" style="padding:1rem">No activity yet — discover a gift to populate this feed.</td></tr>';
        return;
      }
      rows.forEach(function (row) {
        const prod = products.find(function (p) {
          return p.id === row.id;
        });
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" +
          (prod ? prod.title : row.id) +
          "</td><td>" +
          row.kind +
          "</td><td><a href=\"product.html?id=" +
          encodeURIComponent(row.id) +
          '">Open</a></td>';
        tbody.appendChild(tr);
      });
    }
  });
})();
