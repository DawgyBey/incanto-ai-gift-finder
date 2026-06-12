// Mini wizard bridge: sync the compact sliders/chips in the hero with the full wizard
(function () {
  function formatInr(n) {
    return 'Rs. ' + Math.round(Number(n)).toLocaleString('en-IN');
  }

  document.addEventListener('DOMContentLoaded', function () {
    const miniRange = document.getElementById('mini-wiz-budget-range');
    const miniDisplay = document.getElementById('mini-wiz-budget-display');
    const wizardRange = document.getElementById('wiz-budget-range');
    const miniChips = Array.from(document.querySelectorAll('[data-mini-chip]'));

    if (miniRange && miniDisplay) {
      // initialize display
      miniDisplay.textContent = formatInr(miniRange.value);

      miniRange.addEventListener('input', function () {
        const v = miniRange.value;
        miniDisplay.textContent = formatInr(v);
        // Mirror value into the full wizard input so wizardState updates
        if (wizardRange) {
          wizardRange.value = String(v);
          // dispatch input so wizard.bindBudget() picks it up
          const ev = new Event('input', { bubbles: true });
          wizardRange.dispatchEvent(ev);
        }
      });

      // If the wizard's range exists, keep the mini display in sync when wizard updates
      if (wizardRange) {
        wizardRange.addEventListener('input', function () {
          miniDisplay.textContent = formatInr(wizardRange.value);
          miniRange.value = wizardRange.value;
        });
      }
    }

    // Chip syncing: clicking a mini-chip will toggle the matching chip inside the wizard
    miniChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        const val = chip.getAttribute('data-mini-chip');
        if (!val) return;
        chip.classList.toggle('is-selected');
        const wizardChip = document.querySelector('#incanto-wizard [data-wiz-chip="' + CSS.escape(val) + '"]');
        if (wizardChip) {
          // trigger a click on the wizard chip to keep internal state in sync
          wizardChip.click();
        }
      });
    });

    // When user opens the full wizard from the mini control, ensure the wizard inputs reflect mini state
    const miniOpen = document.getElementById('mini-open-wiz');
    if (miniOpen) {
      miniOpen.addEventListener('click', function () {
        // Mirror budget
        if (wizardRange && miniRange) {
          wizardRange.value = miniRange.value;
          wizardRange.dispatchEvent(new Event('input', { bubbles: true }));
        }
        // Mirror chips: for each selected mini chip, ensure wizard chip is selected
        miniChips.forEach(function (c) {
          if (!c.classList.contains('is-selected')) return;
          const v = c.getAttribute('data-mini-chip');
          if (!v) return;
          const wiz = document.querySelector('#incanto-wizard [data-wiz-chip="' + CSS.escape(v) + '"]');
          if (wiz && !wiz.classList.contains('is-selected')) wiz.click();
        });
      });
    }
  });
})();
