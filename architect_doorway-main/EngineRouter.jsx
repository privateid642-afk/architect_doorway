// File: src/EngineRouter.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * EngineRouter — standalone version (no other local imports)
 * Purpose:
 *  - Show a styled <a> (link-as-button) for the doorway page
 *  - Expose the plain URL for Daily Posts
 *  - Allow ?engine=orion|gpt4o|gpt5 override
 *  - Safe defaults if env vars are missing
 *
 * Env (optional):
 *  VITE_ENGINE_ORION_URL
 *  VITE_ENGINE_GPT4O_URL
 *  VITE_ENGINE_GPT5_URL
 *  VITE_BUILD_STAMP
 */

const env = import.meta.env || {};
const ORION_URL = String(env.VITE_ENGINE_ORION_URL || "https://orion-messenger.com").trim();
const GPT4O_URL = String(env.VITE_ENGINE_GPT4O_URL || "").trim();
const GPT5_URL  = String(env.VITE_ENGINE_GPT5_URL  || "").trim();
const BUILD_STAMP = String(env.VITE_BUILD_STAMP || "dev").trim();

const ENGINES = [
  { key: "orion", label: "Orion", url: ORION_URL },
  { key: "gpt4o", label: "GPT-4o", url: GPT4O_URL },
  { key: "gpt5",  label: "GPT-5",  url: GPT5_URL  },
];

function readQueryEngine() {
  try {
    const q = new URLSearchParams(window.location.search);
    const val = (q.get("engine") || "").toLowerCase();
    return ["orion", "gpt4o", "gpt5"].includes(val) ? val : "";
  } catch {
    return "";
  }
}

function resolveUrl(engineKey) {
  const e = ENGINES.find((x) => x.key === engineKey);
  if (e && e.url) return e.url;
  // fallback chain: GPT-4o → GPT-5 → Orion
  if (engineKey === "gpt4o" && GPT4O_URL) return GPT4O_URL;
  if (engineKey === "gpt5"  && GPT5_URL ) return GPT5_URL;
  return ORION_URL;
}

export default function EngineRouter() {
  const forced = readQueryEngine();
  const [selection, setSelection] = useState(forced || "orion");

  useEffect(() => {
    console.log("[SMOKE] EngineRouter: mounted", {
      ts: new Date().toISOString(),
      BUILD_STAMP,
      forced,
      envSet: { ORION_URL: !!ORION_URL, GPT4O_URL: !!GPT4O_URL, GPT5_URL: !!GPT5_URL },
    });
    return () => console.log("[SMOKE] EngineRouter: unmounted");
  }, [forced]);

  const targetUrl = useMemo(() => resolveUrl(selection), [selection]);
  const label = "Enter The Architect";

  return (
    <div
      data-testid="engine-router"
      style={{ border: "1px dashed #789", padding: 12, borderRadius: 12, background: "#f8fbff" }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Seamless Transition</div>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
        BUILD_STAMP: <code>{BUILD_STAMP}</code>
      </div>

      <label htmlFor="engineSel" style={{ display: "block", marginBottom: 6 }}>
        Preferred engine (use <code>?engine=orion|gpt4o|gpt5</code> to preset):
      </label>
      <select
        id="engineSel"
        data-testid="engine-select"
        value={selection}
        onChange={(e) => setSelection(e.target.value)}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #999", marginBottom: 12 }}
      >
        {ENGINES.map((e) => (
          <option key={e.key} value={e.key}>
            {e.label}{!e.url ? " (url not set)" : ""}
          </option>
        ))}
      </select>

      {/* Styled link as button (semantic <a>) */}
      <div style={{ marginTop: 4 }}>
        <a
          href={targetUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="architect-link"
          onClick={() => console.log("[SMOKE] EngineRouter: link clicked", { targetUrl })}
          title={targetUrl || "No target configured"}
          style={{
            display: "inline-block",
            padding: "12px 20px",
            borderRadius: 10,
            background: "#0645ad",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 16,
            border: "1px solid #042c6b",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            cursor: "pointer",
          }}
        >
          {label}
        </a>
      </div>

      {/* Plain URL for Daily Posts */}
      <div style={{ fontSize: 12, opacity: 0.85, marginTop: 10 }}>
        Daily Post URL:&nbsp;
        <code data-testid="engine-url">{targetUrl || "(not set → Orion fallback)"}</code>
      </div>
    </div>
  );
}
