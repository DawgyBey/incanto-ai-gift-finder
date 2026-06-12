/**
 * ============================================================================
 * INCANTO — js/wizard.js
 * Gift Discovery Wizard — state machine + navigation (Back / Next)
 * ============================================================================
 *
 * EMBEDDED MODE (index.html)
 * --------------------------
 * When `#incanto-wizard` has the class `incanto-wizard--embed`, the wizard is a
 * fixed overlay on the homepage. Step 1 “Exit / Back” and the top “Close” control
 * call `closeWizard()` instead of navigating away (same URL, full page still
 * reachable underneath).
 *
 * MEMBER 4 (INTEGRATION) — READ THIS FIRST
 * ---------------------------------------
 * This file intentionally separates THREE concerns:
 *
 * 1) `wizardState` (the “single source of truth” for answers)
 * 2) `uiStepIndex` (which wizard panel is visible) — 0..4 == Steps 1..5
 * 3) `phase` ('wizard' | 'results')
 *
 * BACK BUTTON LOGIC
 * ------------------
 * - From Results        -> Back returns to Step 5 (last question step).
 * - From Step 5..2      -> Back decrements `uiStepIndex` by 1.
 * - From Step 1         -> If embedded: `closeWizard()`. Else: navigate to index.
 *
 * Replace `renderResults()` / scoring with an API call when wiring the backend.
 * ============================================================================
 */

(function () {
  const wizardState = {
    occasion: null,
    relationship: null,
    budgetInr: 15000,
    interests: /** @type {string[]} */ ([]),
    personality: null,
  };

  let uiStepIndex = 0;
  let phase = "wizard";
  const BUDGET = { min: 500, max: 20000, step: 500 };

  const STEP_TITLES = ["Occasion", "Relationship", "Budget", "Interests", "Personality"];

  const el = {
    root: /** @type {HTMLElement|null} */ (null),
    stage: null,
    panels: /** @type {HTMLElement[]} */ ([]),
    dots: /** @type {HTMLElement[]} */ ([]),
    results: null,
    resultsGrid: null,
    budgetInput: null,
    budgetText: null,
    btnBack: null,
    btnNext: null,
    nextLabel: null,
    announcer: null,
  };

  /** @type {HTMLElement|null} */
  let lastFocusBeforeWizard = null;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function isEmbed() {
    return Boolean(el.root && el.root.classList.contains("incanto-wizard--embed"));
  }

  function isWizardUiOpen() {
    return Boolean(el.root && !el.root.hasAttribute("hidden"));
  }

  function formatInr(amount) {
    const n = Math.round(Number(amount));
    return "Rs. " + n.toLocaleString("en-IN");
  }

  function usdToInr(usd) {
    return Math.round(Number(usd) * 83);
  }

  function setPhase(nextPhase) {
    phase = nextPhase;
  }

  function announce(message) {
    if (!el.announcer) return;
    el.announcer.textContent = "";
    window.requestAnimationFrame(function () {
      el.announcer.textContent = message;
    });
  }

  function announceStep() {
    if (!isWizardUiOpen()) return;
    if (phase === "results") {
      announce("Results ready. Shortlist displayed.");
      return;
    }
    announce("Step " + (uiStepIndex + 1) + " of 5: " + STEP_TITLES[uiStepIndex] + ".");
  }

  function updateProgressDots() {
    el.dots.forEach(function (dot, i) {
      const on = (phase === "wizard" && i === uiStepIndex) || (phase === "results" && i === 4);
      dot.classList.toggle("is-active", on);
    });
  }

  function setButtons() {
    if (!el.btnBack || !el.btnNext || !el.nextLabel) return;

    if (phase === "results") {
      el.btnBack.textContent = "Back";
      el.btnNext.style.display = "none";
      return;
    }
    el.btnNext.style.display = "";

    if (uiStepIndex === 0 && isEmbed()) {
      el.btnBack.textContent = "Exit";
    } else {
      el.btnBack.textContent = "Back";
    }

    el.nextLabel.textContent = uiStepIndex === 4 ? "See gifts" : "Next";
    el.btnNext.disabled = false;
  }

  function validateCurrentStep() {
    if (phase !== "wizard") return true;
    switch (uiStepIndex) {
      case 0:
        return Boolean(wizardState.occasion);
      case 1:
        return Boolean(wizardState.relationship);
      case 2:
        return (
          typeof wizardState.budgetInr === "number" &&
          wizardState.budgetInr >= BUDGET.min &&
          wizardState.budgetInr <= BUDGET.max
        );
      case 3:
        return wizardState.interests.length > 0;
      case 4:
        return Boolean(wizardState.personality);
      default:
        return true;
    }
  }

  function animateToStep(nextIndex) {
    const old = uiStepIndex;
    if (nextIndex === old) return;
    const currentPanel = el.panels[old];
    const nextPanel = el.panels[nextIndex];
    if (!currentPanel || !nextPanel) return;

    currentPanel.classList.add("is-exit");
    window.setTimeout(function () {
      currentPanel.classList.remove("is-active", "is-exit");
      nextPanel.classList.add("is-active");
      uiStepIndex = nextIndex;
      updateProgressDots();
      setButtons();
      announceStep();
    }, 180);
  }

  function showWizardStep(nextIndex) {
    el.panels.forEach(function (p, i) {
      p.classList.toggle("is-active", i === nextIndex);
      p.classList.remove("is-exit");
    });
    uiStepIndex = nextIndex;
    updateProgressDots();
    setButtons();
    announceStep();
  }

  function enterResults() {
    if (!validateCurrentStep()) return;

    if (el.stage) el.stage.style.display = "none";
    setPhase("results");
    if (el.results) {
      el.results.classList.add("is-active");
      void el.results.offsetWidth;
    }
    renderResults();
    updateProgressDots();
    setButtons();
    announceStep();
    if (el.root) el.root.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function leaveResults() {
    if (el.results) el.results.classList.remove("is-active");
    if (el.stage) el.stage.style.display = "";
    setPhase("wizard");
    showWizardStep(4);
  }

  function goNext() {
    if (phase === "results") return;
    if (!validateCurrentStep()) {
      el.btnNext && el.btnNext.classList.add("wiz-shake");
      window.setTimeout(function () {
        el.btnNext && el.btnNext.classList.remove("wiz-shake");
      }, 260);
      announce("Please complete this step before continuing.");
      return;
    }
    if (uiStepIndex === 4) {
      enterResults();
      return;
    }
    animateToStep(uiStepIndex + 1);
  }

  function goBack() {
    if (phase === "results") {
      leaveResults();
      return;
    }
    if (uiStepIndex === 0) {
      if (isEmbed()) {
        closeWizard();
      } else {
        window.location.href = "index.html";
      }
      return;
    }
    animateToStep(uiStepIndex - 1);
  }

  function getFocusable(root) {
    const sel = 'a[href]:not([tabindex="-1"]), button:not([disabled]):not([hidden]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return $all(sel, root).filter(function (node) {
      return node instanceof HTMLElement && node.offsetParent !== null;
    });
  }

  function onWizardKeydown(e) {
    if (!isWizardUiOpen() || !el.root) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeWizard();
      return;
    }

    if (e.key !== "Tab") return;
    const list = getFocusable(el.root);
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openWizard(triggerEl) {
    if (!el.root) return;
    lastFocusBeforeWizard = (triggerEl && triggerEl instanceof HTMLElement ? triggerEl : null) || /** @type {HTMLElement|null} */ (document.activeElement);

    el.root.removeAttribute("hidden");
    el.root.classList.add("is-open");
    document.body.classList.add("wizard-open");

    const drawer = document.querySelector("[data-mobile-drawer]");
    const navToggle = document.querySelector("[data-nav-toggle]");
    if (drawer) drawer.classList.remove("is-open");
    if (navToggle) {
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }

    const main = document.getElementById("main");
    const header = document.querySelector("[data-site-header]");
    if (main) main.setAttribute("aria-hidden", "true");
    if (header) header.setAttribute("aria-hidden", "true");

    document.addEventListener("keydown", onWizardKeydown, true);

    const closeBtn = document.getElementById("wiz-close");
    if (closeBtn) closeBtn.focus();
    else if (el.btnBack) el.btnBack.focus();

    announce("Gift wizard opened. " + (phase === "results" ? "Results." : "Step " + (uiStepIndex + 1) + " of 5."));
  }

  function closeWizard() {
    if (!el.root) return;

    if (phase === "results") {
      leaveResults();
    }
    showWizardStep(0);

    el.root.setAttribute("hidden", "hidden");
    el.root.classList.remove("is-open");
    document.body.classList.remove("wizard-open");

    const main = document.getElementById("main");
    const header = document.querySelector("[data-site-header]");
    if (main) main.removeAttribute("aria-hidden");
    if (header) header.removeAttribute("aria-hidden");

    document.removeEventListener("keydown", onWizardKeydown, true);

    if (lastFocusBeforeWizard && typeof lastFocusBeforeWizard.focus === "function") {
      lastFocusBeforeWizard.focus();
    }
    lastFocusBeforeWizard = null;

    announce("");
  }

  function scoreProduct(p) {
    let score = 0;
    const hay = (p.title + " " + p.category + " " + p.tags.join(" ") + " " + p.shortDescription).toLowerCase();
    const budgetInr = wizardState.budgetInr;
    const priceInr = usdToInr(p.price);

    if (priceInr <= budgetInr) score += 4;
    else score -= 2;

    const occ = String(wizardState.occasion || "").toLowerCase();
    if (occ && hay.includes(occ)) score += 3;

    const rel = String(wizardState.relationship || "").toLowerCase();
    if (rel.includes("partner") && ["Beauty", "Fashion", "Flowers"].includes(p.category)) score += 2;
    if (rel.includes("boss") && ["Accessories", "Home", "Books"].includes(p.category)) score += 2;
    if (rel.includes("colleague") && ["Tech", "Home", "Accessories"].includes(p.category)) score += 2;
    if (rel.includes("parent") && ["Wellness", "Home", "Travel"].includes(p.category)) score += 2;
    if (rel.includes("sibling") && ["Gaming", "Tech", "Fashion"].includes(p.category)) score += 1;

    wizardState.interests.forEach(function (interest) {
      if (hay.includes(String(interest).toLowerCase())) score += 3;
    });

    const vibe = String(wizardState.personality || "").toLowerCase();
    if (vibe.includes("playful") && (hay.includes("rgb") || hay.includes("gaming"))) score += 2;
    if (vibe.includes("intelligent") && (p.category === "Books" || hay.includes("smart"))) score += 2;
    if (vibe.includes("adventurous") && (p.category === "Travel" || hay.includes("sport"))) score += 2;
    if (vibe.includes("minimal") && (hay.includes("minimal") || hay.includes("desk"))) score += 2;

    return score;
  }

  function whyPerfect(p) {
    const bits = [];
    const priceInr = usdToInr(p.price);
    if (priceInr <= wizardState.budgetInr) bits.push("Fits your luxury budget");
    if (
      wizardState.interests.some(function (i) {
        return p.tags.join(" ").toLowerCase().includes(String(i).toLowerCase());
      })
    )
      bits.push("Matches an interest you selected");
    if (wizardState.relationship === "partner" && ["Beauty", "Fashion", "Flowers"].includes(p.category))
      bits.push("Great tone for a partner gift");
    if (wizardState.relationship === "boss" && ["Home", "Accessories", "Books"].includes(p.category))
      bits.push("Polished and workplace-safe");
    bits.push("Highly giftable finish + strong unboxing moment");
    return bits.slice(0, 2).join(" · ");
  }

  function renderResults() {
    if (!el.resultsGrid) return;
    const products = window.INCANTO_PRODUCTS || [];
    const ranked = products
      .map(function (p) {
        return { p: p, s: scoreProduct(p) };
      })
      .sort(function (a, b) {
        return b.s - a.s;
      })
      .slice(0, 6);

    el.resultsGrid.innerHTML = "";
    ranked.forEach(function (row) {
      const p = row.p;
      const card = document.createElement("article");
      card.className = "incanto-wizard__result-card";
      card.innerHTML =
        '<div class="incanto-wizard__result-media">' +
        '<div class="incanto-wizard__badge">' +
        escapeHtml(whyPerfect(p)) +
        "</div>" +
        '<img loading="lazy" src="' +
        escapeAttr(p.image) +
        '" alt="' +
        escapeAttr(p.title) +
        '" />' +
        "</div>" +
        '<div class="incanto-wizard__result-body">' +
        '<div class="incanto-wizard__result-title">' +
        escapeHtml(p.title) +
        "</div>" +
        '<div class="incanto-wizard__result-meta">' +
        '<span>' +
        escapeHtml(p.category) +
        "</span>" +
        '<span class="incanto-wizard__result-price">' +
        formatInr(usdToInr(p.price)) +
        "</span>" +
        "</div>" +
        '<div class="incanto-wizard__result-actions">' +
        '<button type="button" class="incanto-wizard__mini incanto-wizard__mini--primary" data-wiz-open="' +
        escapeAttr(p.id) +
        '">Add to shortlist</button>' +
        '<a class="incanto-wizard__mini" href="product.html?id=' +
        encodeURIComponent(p.id) +
        '">View details</a>' +
        "</div>" +
        "</div>";
      el.resultsGrid.appendChild(card);
    });
  }

  function toast(msg) {
    if (window.IncantoToast) window.IncantoToast.show({ message: msg, variant: "success" });
    else window.alert(msg);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;");
  }

  function bindChoiceGroup(containerSel, stateKey) {
    const root = $(containerSel, el.root);
    if (!root) return;
    root.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-wiz-choice]");
      if (!btn) return;
      const value = btn.getAttribute("data-wiz-choice");
      $all("[data-wiz-choice]", root).forEach(function (b) {
        b.classList.toggle("is-selected", b === btn);
      });
      wizardState[stateKey] = value;
    });
  }

  function bindChips() {
    const root = $("#wiz-step-interests", el.root);
    if (!root) return;
    root.addEventListener("click", function (e) {
      const chip = e.target.closest("[data-wiz-chip]");
      if (!chip) return;
      const v = chip.getAttribute("data-wiz-chip");
      chip.classList.toggle("is-selected");
      const on = chip.classList.contains("is-selected");
      const set = new Set(wizardState.interests);
      if (on) set.add(String(v));
      else set.delete(String(v));
      wizardState.interests = Array.from(set);
    });
  }

  function bindBudget() {
    if (!el.budgetInput || !el.budgetText) return;
    el.budgetInput.min = String(BUDGET.min);
    el.budgetInput.max = String(BUDGET.max);
    el.budgetInput.step = String(BUDGET.step);
    el.budgetInput.value = String(wizardState.budgetInr);

    function sync() {
      const n = Number(el.budgetInput.value);
      wizardState.budgetInr = n;
      el.budgetText.textContent = formatInr(n);
      el.budgetInput.setAttribute("aria-valuenow", String(n));
    }
    el.budgetInput.addEventListener("input", sync);
    sync();
  }

  function bindGlobalUi() {
    document.addEventListener(
      "click",
      function (e) {
        const openEl = e.target.closest("[data-wizard-open]");
        if (openEl) {
          e.preventDefault();
          if (el.root) {
            openWizard(openEl);
          } else {
            // No embedded wizard on this page — navigate to homepage and
            // include the wizard hash so the wizard opens on load.
            window.location.href = "index.html#incanto-wizard";
          }
          return;
        }
        const closeEl = e.target.closest("[data-wizard-close]");
        if (closeEl) {
          e.preventDefault();
          closeWizard();
        }
      },
      true
    );

    if (window.location.hash === "#incanto-wizard") {
      window.setTimeout(function () {
        openWizard(null);
      }, 0);
    }
  }

  function init() {
    el.root = document.getElementById("incanto-wizard");
    if (!el.root) return;

    el.stage = $("#wiz-stage", el.root);
    el.results = $("#wiz-results", el.root);
    el.resultsGrid = $("#wiz-results-grid", el.root);
    el.budgetInput = $("#wiz-budget-range", el.root);
    el.budgetText = $("#wiz-budget-display", el.root);
    el.btnBack = $("#wiz-btn-back", el.root);
    el.btnNext = $("#wiz-btn-next", el.root);
    el.nextLabel = $("#wiz-btn-next-label", el.root);
    el.announcer = $("#wiz-announcer", el.root);

    el.panels = $all("[data-wiz-panel]", el.root);
    el.dots = $all("[data-wiz-dot]", el.root);

    bindChoiceGroup("#wiz-step-occasion", "occasion");
    bindChoiceGroup("#wiz-step-relationship", "relationship");
    bindChoiceGroup("#wiz-step-personality", "personality");
    bindChips();
    bindBudget();

    el.btnBack.addEventListener("click", goBack);
    el.btnNext.addEventListener("click", goNext);

    const backResults = $("#wiz-btn-back-results", el.root);
    if (backResults) backResults.addEventListener("click", goBack);

    if (el.resultsGrid) {
      el.resultsGrid.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-wiz-open]");
        if (!btn) return;
        toast("Saved to shortlist (demo). Hook to wishlist API.");
      });
    }

    showWizardStep(0);
    bindGlobalUi();

    window.IncantoWizard = {
      open: openWizard,
      close: closeWizard,
      isOpen: function () {
        return isWizardUiOpen();
      },
    };
  }

  document.addEventListener("DOMContentLoaded", init);
})();
