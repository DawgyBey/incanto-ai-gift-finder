/**
 * ============================================================================
 * INCANTO — js/auth-ui.js
 * ============================================================================
 * Purpose:
 *   Login + signup pages: toggles password visibility (demo UI only).
 * ============================================================================
 */
(function () {
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-password-toggle]");
    if (!btn) return;
    const sel = btn.getAttribute("data-password-toggle");
    const input = sel ? document.querySelector(sel) : null;
    if (!input || (input.type !== "password" && input.type !== "text")) return;
    const next = input.type === "password" ? "text" : "password";
    input.type = next;
    btn.setAttribute("aria-label", next === "text" ? "Hide password" : "Show password");
  });

  document.addEventListener("DOMContentLoaded", function () {
    ["login-form", "signup-form"].forEach(function (id) {
      const form = document.getElementById(id);
      if (!form) return;
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (window.IncantoToast) {
          window.IncantoToast.show({
            message: "Demo mode — hook this form to your auth API.",
            variant: "success",
          });
        }
      });
    });
  });
})();
