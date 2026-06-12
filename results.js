/**
 * ============================================================================
 * INCANTO — js/results.js
 * ============================================================================
 * Purpose:
 *   Reads incanto-discovery-payload from sessionStorage and scores products.
 *   Renders results grid + summary chips. Falls back to “trending” if empty.
 * ============================================================================
 */
(function () {
  function readPayload() {
    try {
      const raw = sessionStorage.getItem("incanto-discovery-payload");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function scoreProduct(payload, prod) {
    let score = 0;
    const hay = (
      prod.title +
      " " +
      prod.category +
      " " +
      prod.tags.join(" ") +
      " " +
      prod.shortDescription
    ).toLowerCase();

    if (payload.prompt) {
      payload.prompt
        .toLowerCase()
        .split(/\s+/)
        .forEach(function (w) {
          if (w.length > 2 && hay.includes(w)) score += 2;
        });
    }

    const budget = Number(payload.budget || 0);
    if (budget && prod.price <= budget) score += 3;
    if (budget && prod.price > budget) score -= 2;

    const occ = (payload.occasion || "").toLowerCase();
    if (occ && hay.includes(occ)) score += 3;

    const rel = (payload.relationship || "").toLowerCase();
    if (rel.includes("partner") && ["Beauty", "Fashion", "Flowers"].includes(prod.category)) score += 2;
    if (rel.includes("friend") && ["Books", "Home", "Wellness"].includes(prod.category)) score += 1;

    (payload.hobbies || []).forEach(function (h) {
      if (hay.includes(String(h).toLowerCase())) score += 3;
    });

    return score;
  }

  function render() {
    const mount = document.getElementById("results-grid");
    const summary = document.getElementById("results-summary");
    if (!mount) return;

    const payload = readPayload();
    const products = window.INCANTO_PRODUCTS || [];

    if (summary) {
      if (!payload) {
        summary.textContent = "Here’s what’s trending — add filters on Discover for tailored picks.";
      } else {
        summary.textContent =
          "Curated from your occasion, relationship, budget, and interests — swap filters anytime.";
      }
    }

    const ranked = products
      .map(function (p) {
        return { p: p, s: payload ? scoreProduct(payload, p) : 0 };
      })
      .sort(function (a, b) {
        return b.s - a.s;
      });

    mount.innerHTML = "";

    ranked.forEach(function (row, idx) {
      if (!payload && idx >= 8) return;
      const prod = row.p;
      const card = document.createElement("article");
      card.className = "card-product reveal";
      card.innerHTML =
        '<div class="card-product__media">' +
        '<img loading="lazy" src="' +
        prod.image +
        '" alt="' +
        prod.title.replace(/"/g, "") +
        '">' +
        '<button type="button" class="card-product__wish" data-wishlist-toggle data-product-id="' +
        prod.id +
        '" aria-label="Add to wishlist" aria-pressed="false">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0-7.8-7.8z"/></svg>' +
        "</button>" +
        "</div>" +
        '<div class="card-product__body">' +
        '<div class="card-product__meta">' +
        prod.category +
        "</div>" +
        '<h3 class="card-product__title"><a href="product.html?id=' +
        encodeURIComponent(prod.id) +
        '">' +
        prod.title +
        "</a></h3>" +
        '<div class="card-product__row">' +
        '<div class="card-product__price">' +
        (window.INCANTO_FORMAT_PRICE_NPR
          ? window.INCANTO_FORMAT_PRICE_NPR(prod.price)
          : ('Rs. ' + Math.round(prod.price * (window.INCANTO_USD_TO_NPR || 132)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))) +
        "</div>" +
        '<div class="card-product__rating">★ ' +
        prod.rating +
        "</div>" +
        "</div>" +
        '<div style="margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap">' +
        '<button type="button" class="btn btn--secondary" style="padding:0.45rem 0.85rem;font-size:0.8rem" data-modal-open data-product-id="' +
        prod.id +
        '">Quick view</button>' +
        '<a class="btn btn--ghost" style="padding:0.45rem 0.85rem;font-size:0.8rem" href="product.html?id=' +
        encodeURIComponent(prod.id) +
        '">Details</a>' +
        "</div>" +
        "</div>";
      mount.appendChild(card);
    });

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
        { threshold: 0.12 }
      );
      mount.querySelectorAll(".reveal").forEach(function (el) {
        io.observe(el);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", render);
})();
