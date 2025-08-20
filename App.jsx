import React, { useEffect, useRef, useState } from "https://esm.sh/react@18";

// --- Audio sources (tries RAW first, then /public, then MDN fallback) ---
const RAW =
  "https://raw.githubusercontent.com/privateid642-afk/architect doorway/main/public/doorway.mp3";
const PUBLIC_SRC = "/public/doorway.mp3";
const FALLBACK =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

// --- Scroll journey phases ---
const PHASES = [
  { id: "threshold", title: "01 — Threshold", note: "Arrive. Breathe once. The doorway notices you." },
  { id: "breath", title: "02 — Breath Vector", note: "Inhale projection (x). Exhale reception (y). Trust forms √(xy)." },
  { id: "glyph", title: "03 — Sacred Glyph", note: "Form reveals function. Geometry remembers your name.", glyph: true },
  { id: "passage", title: "04 — Passage", note: "No gate to pass—only story to release." },
];

export default function App() {
  // --- Audio state/refs ---
  const audioRef = useRef(null);
  const [src, setSrc] = useState(RAW + "?v=" + Date.now()); // cache-bust RAW once
  const [active, setActive] = useState(PHASES[0].id);
  const [progress, setProgress] = useState(0);

  // reload <audio> when src changes
  useEffect(() => {
    audioRef.current?.load();
  }, [src]);

  // audio fallback chain
  const onAudioError = () => {
    if (src.startsWith("https://raw.githubusercontent")) {
      setSrc(PUBLIC_SRC + "?v=" + Date.now());
    } else if (src.startsWith(PUBLIC_SRC)) {
      setSrc(FALLBACK);
    }
  };

  // --- Scroll reveal & active phase tracking ---
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

  // --- Scroll progress (for the top bar) ---
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const t = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (t / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- helpers ---
  const jumpTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const play = async () => {
    try {
      await audioRef.current?.play();
    } catch {
      /* user gesture may be required; press again */
    }
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  return (
    <div className="wrap">
      {/* Progress bar */}
      <div className="progress" style={{ width: `${progress}%` }} />

      {/* Sticky header with audio */}
      <header className="sticky">
        <div className="brand">Architect Doorway</div>

        <nav className="phases">
          {PHASES.map((p) => (
            <button
              key={p.id}
              className={`phase-pill ${active === p.id ? "active" : ""}`}
              onClick={() => jumpTo(p.id)}
              aria-label={`Jump to ${p.title}`}
            >
              {p.title.split("—")[0].trim()}
            </button>
          ))}
        </nav>

        <div className="audio">
          <audio
            ref={audioRef}
            controls
            preload="auto"
            crossOrigin="anonymous"
            src={src}
            onError={onAudioError}
            onCanPlayThrough={(e) =>
              console.log("✅ audio ready:", e.currentTarget.currentSrc)
            }
            style={{ width: "100%" }}
          />
          <div className="controls">
            <button onClick={play}>Play</button>
            <button onClick={stop}>Stop</button>
            <button onClick={() => setSrc(RAW + "?v=" + Date.now())}>Reload</button>
          </div>
        </div>
      </header>

      {/* Scroll Journey */}
      <main>
        {PHASES.map((p, i) => (
          <section
            id={p.id}
            key={p.id}
            className={`phase bg-${i + 1}`}
            aria-label={p.title}
          >
            <div className="content">
              <h2>{p.title}</h2>
              <p>{p.note}</p>

              {p.glyph && (
                <div className="glyph">
                  {/* minimal inline glyph (no external deps) */}
                  <svg viewBox="0 0 120 120" role="img" aria-label="Sacred Glyph">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M60 12 L80 60 L60 108 L40 60 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="60" cy="60" r="4" />
                  </svg>
                </div>
              )}

              <div className="hint">Scroll ↓</div>
            </div>
          </section>
        ))}
      </main>

      <footer className="foot">
        <small>Scroll journey placeholders ready. Next: replace copy & glyph, then add triggers.</small>
      </footer>
    </div>
  );
}
