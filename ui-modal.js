/**
 * ============================================================================
 * INCANTO — js/ui-modal.js
 * ============================================================================
 * Purpose:
 *   Opens product quick-preview modal from [data-modal-open] buttons.
 *   Reads product id from data-product-id (preferred) or legacy data-product JSON.
 *
 * HTML contract:
 *   <button type="button" data-modal-open data-product-id="aurora-1">Preview</button>
 *   <div id="product-modal" class="modal-backdrop" hidden>...</div>
 *
 * Customize:
 *   - Extend template in openModalFromButton for richer layouts
 * ============================================================================
 */
(function () {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function findProductById(id) {
    const list = window.INCANTO_PRODUCTS || [];
    return list.find(function (p) {
      return p.id === id;
    });
  }

  function renderModal(modal, product) {
    const title = modal.querySelector("[data-modal-title]");
    const img = modal.querySelector("[data-modal-image]");
    const price = modal.querySelector("[data-modal-price]");
    const desc = modal.querySelector("[data-modal-desc]");
    const link = modal.querySelector("[data-modal-link]");

    if (title) title.textContent = product.title;
    if (img) {
      img.src = product.image;
      img.alt = product.title;
    }
    if (price)
      price.textContent =
        (window.INCANTO_FORMAT_PRICE_NPR
          ? window.INCANTO_FORMAT_PRICE_NPR(product.price)
          : ('Rs. ' + Math.round(product.price * (window.INCANTO_USD_TO_NPR || 132)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')));
    if (desc) desc.textContent = product.longDescription || product.shortDescription;
    if (link) link.href = "product.html?id=" + encodeURIComponent(product.id);
  }

  function openModal(modal) {
    modal.hidden = false;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    window.setTimeout(function () {
      modal.hidden = true;
    }, 280);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("product-modal");
    if (!modal) return;

    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.closest("[data-modal-close]")) {
        closeModal(modal);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal(modal);
    });

    document.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-modal-open]");
      if (!btn) return;
      let id = btn.getAttribute("data-product-id");
      if (!id) {
        const raw = btn.getAttribute("data-product");
        if (!raw) return;
        try {
          id = JSON.parse(raw).id;
        } catch {
          return;
        }
      }
      const product = findProductById(id);
      if (!product) return;
      renderModal(modal, product);
      openModal(modal);
    });
  });
})();
