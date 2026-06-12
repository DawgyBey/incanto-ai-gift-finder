/**
 * ============================================================================
 * INCANTO — js/ui-toast.js
 * ============================================================================
 * Purpose:
 *   Tiny toast API: window.IncantoToast.show({ message, variant })
 *   Used for wishlist, mock AI actions, form demos.
 *
 * Customize:
 *   - DURATION_MS: auto-dismiss timing
 * ============================================================================
 */
(function (global) {
  const DURATION_MS = 3600;

  function ensureHost() {
    let host = document.getElementById("incanto-toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "incanto-toast-host";
      host.className = "toast-host";
      document.body.appendChild(host);
    }
    return host;
  }

  function show(options) {
    const message = options && options.message ? String(options.message) : "Saved.";
    const variant = options && options.variant ? String(options.variant) : "default";

    const host = ensureHost();
    const el = document.createElement("div");
    el.className = "toast toast--" + variant;
    el.setAttribute("role", "status");
    el.textContent = message;
    host.appendChild(el);

    window.setTimeout(function () {
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      el.style.transition = "opacity 240ms ease, transform 240ms ease";
      window.setTimeout(function () {
        el.remove();
      }, 260);
    }, DURATION_MS);
  }

  global.IncantoToast = { show: show };
})(window);
