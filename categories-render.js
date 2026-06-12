/**
 * ============================================================================
 * INCANTO — js/categories-render.js
 * ============================================================================
 * Purpose:
 *   Renders the full product grid on categories.html from INCANTO_PRODUCTS.
 *   Works with categories-page.js chip filtering via data-category-card.
 * ============================================================================
 */
(function () {
  function cardTemplate(p) {
    return (
      '<article class="card-product reveal" data-category-card="' +
      p.category +
      '">' +
      '<div class="card-product__media"><img loading="lazy" src="' +
      p.image +
      '" alt="">' +
      '<button type="button" class="card-product__wish" data-wishlist-toggle data-product-id="' +
      p.id +
      '" aria-label="Add to wishlist" aria-pressed="false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0-7.8-7.8z"/></svg></button></div>' +
      '<div class="card-product__body"><div class="card-product__meta">' +
      p.category +
      '</div><h3 class="card-product__title"><a href="product.html?id=' +
      encodeURIComponent(p.id) +
      '">' +
      p.title +
      '</a></h3><p class="text-muted" style="font-size:0.875rem;margin:0.35rem 0 0.75rem">' +
      p.shortDescription +
      '</p><div class="card-product__row"><div class="card-product__price">' +
        (window.INCANTO_FORMAT_PRICE_NPR
          ? window.INCANTO_FORMAT_PRICE_NPR(p.price)
          : ('Rs. ' + Math.round(p.price * (window.INCANTO_USD_TO_NPR || 132)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))) +
      '</div><div class="card-product__rating">★ ' +
      p.rating +
      '</div></div><div style="margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap"><button type="button" class="btn btn--secondary" style="padding:0.45rem 0.85rem;font-size:0.8rem" data-modal-open data-product-id="' +
      p.id +
      '">Quick view</button></div></div></article>'
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    const mount = document.getElementById("categories-grid");
    const products = window.INCANTO_PRODUCTS || [];
    if (!mount) return;
    mount.innerHTML = products.map(cardTemplate).join("");
    if (window.IncantoWishlist) window.IncantoWishlist.syncButtons();

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      mount.querySelectorAll(".reveal").forEach(function (el) {
        io.observe(el);
      });
    }
  });
})();
