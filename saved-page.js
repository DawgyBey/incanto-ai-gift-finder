/**
 * ============================================================================
 * INCANTO — js/saved-page.js
 * ============================================================================
 * Purpose:
 *   saved.html: renders “saved gifts” from localStorage incanto-saved.
 * ============================================================================
 */
(function () {
  function render() {
    const mount = document.getElementById("saved-grid");
    const empty = document.getElementById("saved-empty");
    if (!mount) return;

    const ids =
      (window.IncantoSaved && window.IncantoSaved.readIds && window.IncantoSaved.readIds()) || [];
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
        '" alt=""></div><div class="card-product__body"><div class="card-product__meta">' +
        prod.category +
        '</div><h3 class="card-product__title"><a href="product.html?id=' +
        encodeURIComponent(prod.id) +
        '">' +
        prod.title +
        '</a></h3><p class="text-muted" style="font-size:0.875rem;margin:0.5rem 0 0.75rem">' +
        prod.shortDescription +
        '</p><div class="card-product__row"><div class="card-product__price">' +
        (window.INCANTO_FORMAT_PRICE_NPR
          ? window.INCANTO_FORMAT_PRICE_NPR(prod.price)
          : ('Rs. ' + Math.round(prod.price * (window.INCANTO_USD_TO_NPR || 132)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))) +
        '</div><a class="btn btn--primary" style="padding:0.45rem 0.95rem;font-size:0.8rem" href="product.html?id=' +
        encodeURIComponent(prod.id) +
        '">Open</a></div></div>';
      mount.appendChild(article);
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
