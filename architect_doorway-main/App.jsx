// File: src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import EngineRouter from "./EngineRouter";

/**
 * Architect Doorway — Test Harness (Option A mount)
 * - Visible smoke frame + data-testids
 * - Console traces on mount/unmount and actions
 * - Audio with native controls (loop ON by default) + optional soft-loop segment
 * - Styled link-as-button handoff (semantic <a>) via EngineRouter
 * - Non-crashing if elements are missing
 */

export default function App() {
  const audioRef = useRef(null);

  // UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Looping
  const [useNativeLoop, setUseNativeLoop] = useState(true); // default ON
  const [useSoftLoop, setUseSoftLoop] = useState(false);
  const [softLoopFrom, setSoftLoopFrom] = useState(0); // seconds
  const [softLoopTo, setSoftLoopTo] = useState(0);     // 0 = duration

  // Telemetry
  const [t, setT] = useState({ current: 0, duration: 0 });

  // Build stamp (cache-busting proof if provided)
  const BUILD_STAMP = String(import.meta.env?.VITE_BUILD_STAMP || "dev");

  // ---- Lifecycle smoke logs ----
  useEffect(() => {
    console.log("[SMOKE] App.jsx: mounted", {
      ts: new Date().toISOString(),
      BUILD_STAMP,
    });
    return () => console.log("[SMOKE] App.jsx: unmounted");
  }, [BUILD_STAMP]);

  // Keep native loop in sync (use attribute + property)
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const enableNative = !!useNativeLoop && !useSoftLoop;
    el.loop = enableNative;
    if (enableNative) el.setAttribute("loop", "");
    else el.removeAttribute("loop");
  }, [useNativeLoop, useSoftLoop]);

  // Time telemetry + soft-loop segment
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onTimeUpdate = () => {
      const current = el.currentTime || 0;
      const duration = Number.isFinite(el.duration) ? el.duration : 0;
      setT({ current, duration });

      if (useSoftLoop && duration > 0) {
        const start = Math.max(0, softLoopFrom || 0);
        const end = softLoopTo > 0 ? Math.min(softLoopTo, duration) : duration;
        if (current >= end - 0.02) {
          // Epsilon avoids stutter at the boundary
          el.currentTime = start;
          if (!el.paused) {
            const p = el.play();
            if (p?.catch) p.catch(() => {});
          }
        }
      }
    };

    const onLoaded = () => {
      const duration = Number.isFinite(el.duration) ? el.duration : 0;
      setT({ current: el.currentTime || 0, duration });
      console.log("[SMOKE] App.jsx: loadedmetadata", { duration });
    };

    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoaded);
    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [useSoftLoop, softLoopFrom, softLoopTo]);

  // ---- Helpers ----
  const safeAudio = () => {
    const el = audioRef.current;
    if (!el) {
      console.warn("[SMOKE] App.jsx: audio element not ready");
      setErrorMsg("Audio element not ready.");
    }
    return el;
  };

  const handlePlayPause = async () => {
    const el = safeAudio();
    if (!el) return;

    try {
      if (el.paused) {
        console.log("[SMOKE] App.jsx: play() requested");
        setStatus("loading");
        await el.play();
        setIsPlaying(true);
        setStatus("playing");
        console.log("[SMOKE] App.jsx: play() started");
      } else {
        console.log("[SMOKE] App.jsx: pause() requested");
        el.pause();
        setIsPlaying(false);
        setStatus("paused");
        console.log("[SMOKE] App.jsx: pause() done");
      }
    } catch (err) {
      console.error("[SMOKE] App.jsx: play/pause error", err);
      setErrorMsg(String(err?.message || err));
      setStatus("error");
      setIsPlaying(false);
    }
  };

  const onEnded = () => {
    console.log("[SMOKE] App.jsx: audio ended");
    setIsPlaying(false);
    setStatus("ended");
    // Failsafe: if native loop didn’t fire, soft-restart when native disabled
    const el = audioRef.current;
    if (el && !useNativeLoop && !useSoftLoop) {
      el.currentTime = 0;
      const p = el.play();
      if (p?.catch) p.catch(() => {});
    }
  };

  const onCanPlay = () => {
    console.log("[SMOKE] App.jsx: canplay");
    if (status === "loading") setStatus("ready");
  };

  const onError = (e) => {
    console.error("[SMOKE] App.jsx: audio error", e?.target?.error || e);
    setErrorMsg("Audio failed to load. Check /public/doorway.mp3 or /doorway.wav.");
    setStatus("error");
  };

  const fmt = (s) => {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  // ---- Render ----
  return (
    <div
      data-testid="smoke-frame"
      style={{
        border: "2px solid #999",
        padding: 16,
        margin: 16,
        borderRadius: 12,
        maxWidth: 900,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1 style={{ marginTop: 0 }}>Architect Doorway (Test Harness)</h1>

      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
        BUILD_STAMP: <code>{BUILD_STAMP}</code>
      </div>

      {/* AUDIO QA BLOCK */}
      <section
        style={{
          display: "grid",
          gap: 12,
          alignItems: "start",
          gridTemplateColumns: "1fr",
          marginBottom: 16,
        }}
      >
        <audio
          ref={audioRef}
          id="doorway-audio"
          data-testid="doorway-audio"
          preload="auto"
          controls
          controlsList="nodownload"
          // loop attribute/property controlled via effect to ensure sync
          onEnded={onEnded}
          onCanPlay={onCanPlay}
          onError={onError}
        >
          {/* Provide both sources; browser picks first supported */}
          <source src="/doorway.mp3" type="audio/mpeg" />
          <source src="/doorway.wav" type="audio/wav" />
          Your browser does not support HTML5 audio.
        </audio>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            data-testid="toggle-audio"
            onClick={handlePlayPause}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #555",
              cursor: "pointer",
              background: isPlaying ? "#e8f5e9" : "#f5f5f5",
            }}
            title="Play/Pause (click)"
          >
            {isPlaying ? "Pause" : "Play"} Audio
          </button>

          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={useNativeLoop && !useSoftLoop}
              onChange={(e) => {
                const v = e.target.checked;
                setUseNativeLoop(v);
                if (v) setUseSoftLoop(false);
              }}
            />
            Native loop
          </label>

          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={useSoftLoop}
              onChange={(e) => {
                const v = e.target.checked;
                setUseSoftLoop(v);
                if (v) setUseNativeLoop(false);
              }}
            />
            Soft loop (segment)
          </label>

          {useSoftLoop && (
            <>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                from (s):
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={softLoopFrom}
                  onChange={(e) => setSoftLoopFrom(Math.max(0, Number(e.target.value) || 0))}
                  style={{ width: 80 }}
                />
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                to (s, 0 = duration):
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={softLoopTo}
                  onChange={(e) => setSoftLoopTo(Math.max(0, Number(e.target.value) || 0))}
                  style={{ width: 110 }}
                />
              </label>
            </>
          )}

          <span style={{ fontSize: 12 }}>
            Status: <strong data-testid="audio-status">{status}</strong>
          </span>

          {errorMsg ? (
            <span
              data-testid="audio-error"
              style={{ color: "#b00020", fontSize: 12, borderLeft: "2px solid #b00020", paddingLeft: 8 }}
            >
              {errorMsg}
            </span>
          ) : null}
        </div>

        <div style={{ fontSize: 12, opacity: 0.9 }}>
          Time: <code>{fmt(t.current)} / {fmt(t.duration)}</code>
        </div>
      </section>

      {/* LINK HANDOFF (styled link-as-button via EngineRouter) */}
      <section style={{ marginTop: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 12, marginBottom: 6, opacity: 0.8 }}>
          Note: Audio + link live here temporarily; we can relocate later without logic changes.
        </div>
        <EngineRouter />
      </section>

      <hr style={{ margin: "16px 0" }} />

      <details>
        <summary>Diagnostics</summary>
        <ul style={{ marginTop: 8 }}>
          <li>Verify <code>/public/doorway.mp3</code> or <code>/public/doorway.wav</code> exists.</li>
          <li>Native loop ON means full-file looping; Soft loop lets you loop a segment.</li>
          <li>Use DevTools (F12) → Console: look for <code>[SMOKE]</code> traces.</li>
        </ul>
      </details>
    </div>
  );
}
