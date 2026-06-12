/**
 * ============================================================================
 * INCANTO — js/app.js
 * ============================================================================
 * Purpose:
 *   Global bootstrapping:
 *   - Hides premium loader after window load
 *   - Scroll reveal (IntersectionObserver)
 *   - Animated counters when stats enter viewport
 *   - Button ripple on click
 *   - Optional subtle hover sound (muted by default preference)
 *
 * Customize:
 *   - REVEAL_SELECTOR: elements to fade in on scroll
 * ============================================================================
 */
(function () {
  const REVEAL_SELECTOR = ".reveal";

  function initLoader() {
    const loader = document.getElementById("site-loader");
    if (!loader) return;

    window.addEventListener("load", function () {
      document.body.classList.remove("is-loading");
      loader.classList.add("is-hidden");
    });
  }

  function initReveal() {
    const els = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  function initCounters() {
    const counters = Array.from(document.querySelectorAll("[data-counter]"));
    if (!counters.length) return;
    if (!("IntersectionObserver" in window)) {
      counters.forEach(function (el) {
        const target = Number(el.getAttribute("data-counter-target") || "0");
        el.textContent = String(target);
      });
      return;
    }

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = Number(el.getAttribute("data-counter-target") || "0");
          const duration = 900;
          const start = performance.now();

          function tick(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = String(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach(function (el) {
      io.observe(el);
    });
  }

  function initRipples() {
    document.addEventListener(
      "click",
      function (e) {
        const btn = e.target.closest(".btn");
        if (!btn) return;
        btn.classList.remove("is-rippling");
        void btn.offsetWidth;
        btn.classList.add("is-rippling");
        window.setTimeout(function () {
          btn.classList.remove("is-rippling");
        }, 600);
      },
      true
    );
  }

  /**
   * Optional micro-click sound using Web Audio (no external mp3 required).
   * Browsers may still block until a user gesture — first toggle enables it.
   */
  function playSoftTick() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 1760;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.06);
    ctx.resume().catch(function () {});
  }

  function initMicroSound() {
    let enabled = false;
    try {
      enabled = localStorage.getItem("incanto-sound") === "1";
    } catch {
      /* ignore */
    }

    document.addEventListener("click", function (e) {
      if (!enabled) return;
      const t = e.target.closest("[data-sound-click]");
      if (!t) return;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
      playSoftTick();
    });

    document.addEventListener("click", function (e) {
      const sw = e.target.closest("[data-sound-toggle]");
      if (!sw) return;
      enabled = !enabled;
      try {
        localStorage.setItem("incanto-sound", enabled ? "1" : "0");
      } catch {
        /* ignore */
      }
      window.IncantoToast &&
        window.IncantoToast.show({
          message: enabled ? "Subtle sounds on." : "Sounds off.",
          variant: "success",
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add("is-loading");
    initLoader();
    initReveal();
    initCounters();
    initRipples();
    initMicroSound();
  });
})();
