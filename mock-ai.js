/**
 * ============================================================================
 * INCANTO — js/mock-ai.js
 * ============================================================================
 * Purpose:
 *   Demo “assistant” on discover.html: parses keywords from textarea and
 *   reveals staggered recommendation cards using real catalog items.
 *
 * Not real AI — swap this module for an API call returning ranked products.
 * ============================================================================
 */
(function () {
  function pickProducts(prompt, max) {
    const products = window.INCANTO_PRODUCTS || [];
    const p = (prompt || "").toLowerCase();
    const scored = products.map(function (prod) {
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

      p.split(/\s+/).forEach(function (word) {
        if (word.length < 3) return;
        if (hay.includes(word)) score += 2;
      });

      if (p.includes("game") || p.includes("gamer") || p.includes("anime")) {
        if (["Gaming", "Tech"].includes(prod.category)) score += 4;
        if (hay.includes("rgb") || hay.includes("stream")) score += 3;
      }
      if (p.includes("girl") || p.includes("wife") || p.includes("girlfriend") || p.includes("anniversary")) {
        if (["Beauty", "Fashion", "Flowers"].includes(prod.category)) score += 3;
      }
      if (p.includes("brother") || p.includes("dad") || p.includes("men")) {
        if (["Tech", "Gaming", "Accessories"].includes(prod.category)) score += 2;
      }
      if (p.includes("book") || p.includes("read")) {
        if (prod.category === "Books") score += 6;
      }
      if (p.includes("cheap") || p.includes("under")) {
        if (prod.price <= 80) score += 2;
        else score -= 1;
      }

      return { prod: prod, score: score };
    });

    scored.sort(function (a, b) {
      return b.score - a.score;
    });

    const chosen = [];
    for (let i = 0; i < scored.length && chosen.length < max; i++) {
      if (scored[i].score > 0 || chosen.length < 3) chosen.push(scored[i].prod);
    }
    return chosen.slice(0, max);
  }

  function renderCards(container, products) {
    container.innerHTML = "";
    products.forEach(function (prod, idx) {
      const card = document.createElement("article");
      card.className = "ai-card";
      card.style.transitionDelay = idx * 90 + "ms";
      card.innerHTML =
        '<div style="font-weight:700;font-family:var(--font-display);margin-bottom:0.35rem">' +
        escapeHtml(prod.title) +
        "</div>" +
        '<div class="text-muted" style="font-size:0.85rem;margin-bottom:0.75rem">' +
        escapeHtml(prod.shortDescription) +
        "</div>" +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem">' +
        '<span style="font-weight:700;color:var(--color-primary)">' +
        (window.INCANTO_FORMAT_PRICE_NPR
          ? window.INCANTO_FORMAT_PRICE_NPR(prod.price)
          : ('Rs. ' + Math.round(prod.price * (window.INCANTO_USD_TO_NPR || 132)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))) +
        "</span>" +
        '<a class="btn btn--secondary" style="padding:0.45rem 0.85rem;font-size:0.8rem" href="product.html?id=' +
        encodeURIComponent(prod.id) +
        '">View</a>' +
        "</div>";
      container.appendChild(card);
      window.requestAnimationFrame(function () {
        card.classList.add("is-show");
      });
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("mock-ai-run");
    const input = document.getElementById("mock-ai-input");
    const out = document.getElementById("mock-ai-output");
    if (!btn || !input || !out) return;

    btn.addEventListener("click", function () {
      out.innerHTML =
        '<p class="text-muted" style="grid-column:1/-1;text-align:center;padding:1rem">Thinking…</p>';
      window.setTimeout(function () {
        const picks = pickProducts(input.value, 3);
        renderCards(out, picks);
        if (window.IncantoToast) {
          window.IncantoToast.show({ message: "Recommendations refreshed.", variant: "success" });
        }
      }, 650);
    });
  });
})();
