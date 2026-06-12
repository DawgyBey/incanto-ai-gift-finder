/**
 * ============================================================================
 * INCANTO — js/home-hero-search.js
 * ============================================================================
 * Purpose:
 *   Submits hero search by stuffing prompt into sessionStorage and opening
 *   discover.html with query param ?prefill=... (read below).
 * ============================================================================
 */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("hero-search-form");
    const input = document.getElementById("hero-search-input");
    if (!form || !input) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const prompt = input.value.trim() || "Thoughtful gift ideas";
      try {
        sessionStorage.setItem(
          "incanto-discovery-payload",
          JSON.stringify({
            prompt: prompt,
            age: "",
            gender: "",
            occasion: "",
            relationship: "",
            budget: "",
            personality: "",
            hobbies: [],
            createdAt: new Date().toISOString(),
          })
        );
      } catch {
        /* ignore */
      }
      window.location.href = "discover.html?prefill=1";
    });
  });
})();
