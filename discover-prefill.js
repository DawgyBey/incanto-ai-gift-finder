/**
 * ============================================================================
 * INCANTO — js/discover-prefill.js
 * ============================================================================
 * Purpose:
 *   If user arrives from homepage search (?prefill=1), move prompt into the
 *   assistant textarea for continuity.
 * ============================================================================
 */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get("prefill") !== "1") return;
    try {
      const raw = sessionStorage.getItem("incanto-discovery-payload");
      const data = raw ? JSON.parse(raw) : null;
      const ta = document.getElementById("mock-ai-input");
      if (data && data.prompt && ta) ta.value = data.prompt;
    } catch {
      /* ignore */
    }
  });
})();
