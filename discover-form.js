/**
 * ============================================================================
 * INCANTO — js/discover-form.js
 * ============================================================================
 * Purpose:
 *   Reads AI discovery filters + optional assistant prompt, stores payload in
 *   sessionStorage, navigates to results.html for a polished handoff.
 *
 * sessionStorage key: incanto-discovery-payload (JSON string)
 * ============================================================================
 */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("discover-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const get = function (name) {
        const el = form.elements.namedItem(name);
        return el && "value" in el ? String(el.value) : "";
      };

      const hobbies = Array.from(form.querySelectorAll('input[name="hobbies"]:checked')).map(
        function (x) {
          return x.value;
        }
      );

      const payload = {
        age: get("age"),
        gender: get("gender"),
        occasion: get("occasion"),
        relationship: get("relationship"),
        budget: get("budget"),
        personality: get("personality"),
        hobbies: hobbies,
        prompt: get("prompt"),
        createdAt: new Date().toISOString(),
      };

      try {
        sessionStorage.setItem("incanto-discovery-payload", JSON.stringify(payload));
      } catch {
        /* quota / private mode */
      }

      window.location.href = "results.html";
    });
  });
})();
