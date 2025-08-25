/* =========================================================================
   AsArchitect / app.js
   Purpose:
   - Keep lightweight site behavior centralized.
   - Avoid duplicating logic already in index.html (e.g., audio time resume).
   - Provide safe hooks for future features (subscription, routing, etc.).

   Notes:
   - This file is framework-agnostic (plain JS). It will not break if React
     components (e.g., SacredGlyph.jsx) are added elsewhere.
   - Keep changes idempotent; re-running listeners should not double-bind.

   REMINDERS:
   - Doorway audio element ID: #door-audio (created in index.html)
   - Return page path: /return.html (drop-in live)
   - If you later add bundling (Vite/Webpack), preserve element IDs or update selectors here.
   ========================================================================= */

(function AsArchitectApp() {
  "use strict";

  // ---------------------------
  // Utility helpers
  // ---------------------------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Feature flags (flip to true/false as you grow)
  const FLAGS = {
    enableSmoothScroll: true,
    enableExternalLinkGuard: false, // set true if you want a confirm() for off-site links
    enableAudioAutoUnlock: true,    // try to start audio after the first user interaction
  };

  // ---------------------------
  // Smooth scroll for same-page #hash links
  // ---------------------------
  function setupSmoothScroll() {
    if (!FLAGS.enableSmoothScroll) return;
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href^='#']");
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  }

  // ---------------------------
  // External link guard (optional)
  // ---------------------------
  function setupExternalLinkGuard() {
    if (!FLAGS.enableExternalLinkGuard) return;
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const url = a.getAttribute("href");
      // Ignore hash and same-origin links
      if (!url || url.startsWith("#")) return;

      try {
        const dest = new URL(url, location.href);
        if (dest.origin !== location.origin) {
          const ok = confirm(
            "You are leaving AsArchitect.com.\n\n" +
              "To return anytime, use your browser’s Back button or visit asarchitect.com/return."
          );
          if (!ok) e.preventDefault();
        }
      } catch {
        // Non-standard URL; ignore gracefully
      }
    });
  }

  // ---------------------------
  // Audio guardian: unlock autoplay after first interaction
  // (Does NOT duplicate time-resume logic already in index.html)
  // ---------------------------
  function setupAudioGuardian() {
    if (!FLAGS.enableAudioAutoUnlock) return;

    const audio = $("#door-audio");
    if (!audio) return;

    let unlocked = false;

    const tryPlay = async () => {
      if (unlocked) return;
      try {
        // If browser requires user gesture, this call after a click/press should succeed
        await audio.play();
        unlocked = true;
        window.removeEventListener("pointerdown", tryPlay, { capture: true });
        window.removeEventListener("keydown", tryPlay, { capture: true });
      } catch {
        // Ignore; will try again on next interaction
      }
    };

    // First user interaction will attempt to start audio if paused
    window.addEventListener("pointerdown", tryPlay, { capture: true, once: false });
    window.addEventListener("keydown", tryPlay, { capture: true, once: false });
  }

  // ---------------------------
  // Keyboard shortcut: press "R" to go to /return.html
  // (handy for testing & user convenience)
  // ---------------------------
  function setupReturnShortcut() {
    document.addEventListener("keydown", (e) => {
      // Ignore if typing into inputs/textareas
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === "r") {
        // Optional: confirm; comment out if not desired
        // if (!confirm("Go to /return.html now?")) return;
        location.href = "return.html";
      }
    });
  }

  // ---------------------------
  // Boot
  // ---------------------------
  function init() {
    setupSmoothScroll();
    setupExternalLinkGuard();
    setupAudioGuardian();
    setupReturnShortcut();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  // ---------------------------
  // END: app.js
  // ---------------------------

  /* =========================
     FUTURE NOTES:
     - If you introduce SPA routing (e.g., React/Next), move audio element
       to the root layout so it doesn’t re-mount per view.
     - For subscription/dashboard logic, create a /dashboard.html (or app route)
       and add detection/redirect from /return.html based on auth state.
     - If you add Google Ads/YouTube embeds, ensure consent + policy text
       are present to avoid ad disapprovals.
     ========================= */
})();
