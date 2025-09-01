// File: src/main.jsx
/* Smoke: main.jsx loaded */
console.log("[SMOKE] main.jsx: starting bootstrap...", {
  ts: new Date().toISOString(),
  buildStamp: import.meta.env?.VITE_BUILD_STAMP || "dev"
});

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Guard: ensure #root exists to avoid runtime crash on missing DOM
const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("[SMOKE] main.jsx: #root not found in index.html");
  // Create a fallback root to avoid crash
  const fallback = document.createElement("div");
  fallback.id = "root";
  fallback.setAttribute("data-testid", "fallback-root-created");
  document.body.appendChild(fallback);
}

// Trace mount/unmount
window.addEventListener("beforeunload", () => {
  console.log("[SMOKE] main.jsx: window beforeunload at", new Date().toISOString());
});

try {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  console.log("[SMOKE] main.jsx: React root created");

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log("[SMOKE] main.jsx: App rendered");
} catch (err) {
  console.error("[SMOKE] main.jsx: render error", err);
  // Non-crashing visual indicator
  const errBox = document.createElement("pre");
  errBox.style.border = "2px solid red";
  errBox.style.padding = "12px";
  errBox.style.margin = "12px";
  errBox.style.fontFamily = "monospace";
  errBox.textContent = "[SMOKE] Render failed. Check console for details.";
  document.body.appendChild(errBox);
}
