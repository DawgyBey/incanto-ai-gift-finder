/**
 * ============================================================================
 * INCANTO — js/product-page.js
 * ============================================================================
 * Purpose:
 *   product.html?id=... hydrates layout from INCANTO_PRODUCTS.
 * ============================================================================
 */
(function () {
  function getId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  document.addEventListener("DOMContentLoaded", function () {
    const id = getId();
    const products = window.INCANTO_PRODUCTS || [];
    const prod = products.find(function (p) {
      return p.id === id;
    });

    const titleEl = document.getElementById("product-title");
    const priceEl = document.getElementById("product-price");
    const catEl = document.getElementById("product-category");
    const imgEl = document.getElementById("product-image");
    const descEl = document.getElementById("product-description");
    const tagsEl = document.getElementById("product-tags");

    if (!prod) {
      if (titleEl) titleEl.textContent = "Product not found";
      if (descEl)
        descEl.textContent =
          "We couldn’t find that item. Browse categories or return home to keep exploring.";
      return;
    }

    document.title = prod.title + " · Incanto";
    if (titleEl) titleEl.textContent = prod.title;
    if (priceEl)
      priceEl.textContent =
        (window.INCANTO_FORMAT_PRICE_NPR
          ? window.INCANTO_FORMAT_PRICE_NPR(prod.price)
          : ('Rs. ' + Math.round(prod.price * (window.INCANTO_USD_TO_NPR || 132)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')));
    if (catEl) catEl.textContent = prod.category;
    if (imgEl) {
      imgEl.src = prod.image;
      imgEl.alt = prod.title;
    }
    if (descEl) descEl.textContent = prod.longDescription || prod.shortDescription;

    if (tagsEl) {
      tagsEl.innerHTML = "";
      prod.tags.forEach(function (t) {
        const span = document.createElement("span");
        span.className = "chip";
        span.textContent = t;
        tagsEl.appendChild(span);
      });
    }

    const wishBtn = document.getElementById("product-wishlist");
    if (wishBtn) {
      wishBtn.setAttribute("data-product-id", prod.id);
      if (window.IncantoWishlist && window.IncantoWishlist.has(prod.id)) {
        wishBtn.classList.add("is-active");
        wishBtn.setAttribute("aria-pressed", "true");
      }
    }

    const saveBtn = document.getElementById("product-save");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        if (window.IncantoSaved) window.IncantoSaved.add(prod.id);
        if (window.IncantoToast)
          window.IncantoToast.show({ message: "Saved to your gift list.", variant: "success" });
      });
    }
  });
})();
