/**
 * ============================================================================
 * INCANTO — js/wishlist-page.js
 * ============================================================================
 * Purpose:
 *   wishlist.html: renders cards for ids in localStorage wishlist.
 * ============================================================================
 */
(function () {
  function render() {
    const mount = document.getElementById("wishlist-grid");
    const empty = document.getElementById("wishlist-empty");
    if (!mount) return;

    const ids =
      (window.IncantoWishlist && window.IncantoWishlist.readIds && window.IncantoWishlist.readIds()) ||
      [];
    const products = window.INCANTO_PRODUCTS || [];

    mount.innerHTML = "";
    if (!ids.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    ids.forEach(function (id) {
      const prod = products.find(function (p) {
        return p.id === id;
      });
      if (!prod) return;
      const article = document.createElement("article");
      article.className = "card-product reveal is-visible";
      article.innerHTML =
        '<div class="card-product__media"><img loading="lazy" src="' +
        prod.image +
        '" alt=""><button type="button" class="card-product__wish is-active" data-wishlist-toggle data-product-id="' +
        prod.id +
        '" aria-label="Remove from wishlist" aria-pressed="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0-7.8-7.8z"/></svg></button></div><div class="card-product__body"><div class="card-product__meta">' +
        prod.category +
        '</div><h3 class="card-product__title"><a href="product.html?id=' +
        encodeURIComponent(prod.id) +
        '">' +
        prod.title +
        '</a></h3><div class="card-product__row"><div class="card-product__price">' +
          (window.INCANTO_FORMAT_PRICE_NPR
            ? window.INCANTO_FORMAT_PRICE_NPR(prod.price)
            : ('Rs. ' + Math.round(prod.price * (window.INCANTO_USD_TO_NPR || 132)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))) +
          '</div><div class="card-product__rating">★ ' +
        prod.rating +
        '</div></div><div style="margin-top:0.75rem"><button type="button" class="btn btn--secondary" style="padding:0.45rem 0.85rem;font-size:0.8rem" data-modal-open data-product-id="' +
        prod.id +
        '">Quick view</button></div></div>';
      mount.appendChild(article);
    });

    if (window.IncantoWishlist) window.IncantoWishlist.syncButtons();
  }

  document.addEventListener("DOMContentLoaded", render);
  document.addEventListener("incanto:wishlist-changed", render);
})();
