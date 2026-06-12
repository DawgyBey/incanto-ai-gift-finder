// Simple price conversion and formatting utility
(function () {
  // Update this rate if you want a different conversion
  const USD_TO_NPR = 132; // 1 USD = 132 NPR (approx)

  function formatNPR(amount) {
    // Round to nearest rupee and format with comma separators
    const v = Math.round(Number(amount) * USD_TO_NPR);
    return (
      "Rs. " + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    );
  }

  // Export to global for templates to use
  if (typeof window !== "undefined") {
    window.INCANTO_FORMAT_PRICE_NPR = formatNPR;
    window.INCANTO_USD_TO_NPR = USD_TO_NPR;
  } else if (typeof globalThis !== "undefined") {
    globalThis.INCANTO_FORMAT_PRICE_NPR = formatNPR;
    globalThis.INCANTO_USD_TO_NPR = USD_TO_NPR;
  }
})();
