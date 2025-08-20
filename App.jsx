// app.jsx (root) — pure ESM + React.createElement (no JSX build step)
import React, { useEffect, useRef, useState } from "https://esm.sh/react@18";

const h = React.createElement;

/* ──────────────────────────────────────────────────────────────
   Audio sources: tries RAW first, then /public, then MDN fallback
──────────────────────────────────────────────────────────────── */
const RAW =
  "https://raw.githubusercontent.com/privateid642-afk/architect_doorway/main/public/doorway.mp3";
const PUBLIC_SRC = "/public/doorway.mp3"; // your repo keeps the mp3 in /public
const FALLBACK =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

/* ──────────────────────────────────────────────────────────────
   Scroll journey phases
──────────────────────────────────────────────────────────────── */
const PHASES = [
  { id: "threshold", title: "01 — Threshold", note: "Arrive. Breathe once. The doorway notices you." },
  { id: "breath",    title: "02 — Breath Vector", note: "Inhale projection (x). Exhale reception (y). Trust forms √(xy)." },
  { id: "glyph",     title: "03 — Sacred Glyph", note: "Form reveals function. Geometry remembers your name.", glyph: true },
  { id: "passage",   title: "04 — Passage", note: "No gate to pass—only story to release." },
];

/* ──────────────────────────────────────────────────────────────
   Audio cue points (seconds) — tweak to taste
──────────────────────────────────────────────────────────────── */
const CUES = {
  threshold: 0,
  breath: 7.5,
  glyph: 18.2,
  passage: 32.0,
};

export default function App() {
  // Audio + UI state
  const audioRef = useRef(null);
  const [src, setSrc] = useState(RAW + "?v=" + Date.now()); // try RAW first, cache-busted once
  const [active, setActive] = useState(PHASES[0].id);
  const [progress, setProgress] = useState(0);

  // Reload <audio> when src changes
  useEffect(() => {
    audioRef.current?.load();
  }, [src]);

  // Fallback chain: RAW → /public → MDN demo
  const onAudioError = () => {
    if (typeof src === "string" && src.startsWith("https://raw.githubusercontent")) {
      setSrc(PUBLIC_SRC + "?v=" + Date.now());
    } else if (typeof src === "string" && src.startsWith("/public/doorway.mp3")) {
      setSrc(FALLBACK);
    }
  };

  // IntersectionObserver: reveal + track active section
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll(".phase"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal");
            const id = e.target.getAttribute("id");
            if (id) setActive(id);
          }
        });
      },
      { root: null, threshold: 0.6 }
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Scroll progress for top bar
  useEffect(() => {
    const onScroll = () => {
      const d = document.documentElement;
      const max = d.scrollHeight - d.clientHeight;
      setProgress(max > 0 ? (d.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Audio actions when active section changes
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const t = CUES[active];
    if (Number.isFinite(t)) {
      try { el.currentTime = t; } catch {}
    }

    // Simple behavior rules
    if (active === "passage") {
      el.play().catch(() => { /* first gesture may be required */ });
    }
    if (active === "threshold") {
      el.pause();
      el.currentTime = CUES.threshold || 0;
    }
  }, [active]);

  // Helpers
  const jumpTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Pre-seek on intentional jump
    const el = audioRef.current;
    const t = CUES[id];
    if (el && Number.isFinite(t)) {
      try { el.currentTime = t; } catch {}
    }
  };

  const play = async () => {
    try { await audioRef.current?.play(); } catch {/* user gesture may be required */ }
  };

  const stop = () => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  };

  // Header pills
  const pills = h(
    "nav",
    { className: "phases" },
    ...PHASES.map((p) =>
      h(
        "button",
        {
          key: p.id,
          className: `phase-pill ${active === p.id ? "active" : ""}`,
          onClick: () => jumpTo(p.id),
          "aria-label": `Jump to ${p.title}`,
        },
        p.title.split("—")[0].trim()
      )
    )
  );

  // Audio block
  const audioBlock = h(
    "div",
    { className: "audio" },
    h("audio", {
      ref: (el) => (audioRef.current = el),
      controls: true,
      preload: "auto",
      crossOrigin: "anonymous",
      src,
      onError: onAudioError,
      onCanPlayThrough: (e) =>
        console.log("✅ audio ready:", e.currentTarget.currentSrc),
      style: { width: "100%" },
    }),
    h(
      "div",
      { className: "controls" },
      h("button", { onClick: play }, "Play"),
      h("button", { onClick: stop }, "Stop"),
      h("button", { onClick: () => setSrc(RAW + "?v=" + Date.now()) }, "Reload")
    )
  );

  // Sections
  const sections = PHASES.map((p, i) =>
    h(
      "section",
      { id: p.id, key: p.id, className: `phase bg-${i + 1}`, "aria-label": p.title },
      h(
        "div",
        { className: "content" },
        h("h2", null, p.title),
        h("p", null, p.note),
        p.glyph
          ? h(
              "div",
              { className: "glyph" },
              h(
                "svg",
                { viewBox: "0 0 120 120", role: "img", "aria-label": "Sacred Glyph" },
                h("circle", { cx: 60, cy: 60, r: 52, fill: "none", stroke: "currentColor", strokeWidth: 2 }),
                h("path", { d: "M60 12 L80 60 L60 108 L40 60 Z", fill: "none", stroke: "currentColor", strokeWidth: 2 }),
                h("circle", { cx: 60, cy: 60, r: 4 })
              )
            )
          : null,
        h("div", { className: "hint" }, "Scroll ↓")
      )
    )
  );

  // Render tree
  return h(
    "div",
    { className: "wrap" },
    // Progress bar
    h("div", { className: "progress", style: { width: `${progress}%` } }),
    // Header
    h(
      "header",
      { className: "sticky" },
      h("div", { className: "brand" }, "Architect Doorway"),
      pills,
      audioBlock
    ),
    // Main
    h("main", null, ...sections),
    // Footer
    h(
      "footer",
      { className: "foot" },
      h("small", null, "Scroll journey placeholders ready. Next: replace copy & glyph, then add triggers.")
    )
  );
}


