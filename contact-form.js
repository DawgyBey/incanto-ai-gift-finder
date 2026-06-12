/**
 * ============================================================================
 * INCANTO — js/contact-form.js
 * ============================================================================
 * Purpose:
 *   Demo-only contact submit — shows toast instead of posting to a server.
 * ============================================================================
 */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (window.IncantoToast) {
        window.IncantoToast.show({
          message: "Thanks — this demo doesn’t send email yet.",
          variant: "success",
        });
      }
      form.reset();
    });
  });
})();
