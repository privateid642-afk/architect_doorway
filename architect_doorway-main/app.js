// app.js
import React, { useEffect, useMemo } from "react";
import SacredGlyph from "./SacredGlyph"; // ensure this file exists; component is safe to receive no props
import { UserProvider, useUser } from "./UserContext";

function ControlPanel() {
  const { user, isSubscribed, setUserName, toggleSubscribed, reset } = useUser();

  return (
    <div
      data-testid="control-panel"
      style={{
        border: "1px solid rgba(0,0,0,0.1)",
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>Session Controls</h3>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ fontSize: 14 }}>
          Name:&nbsp;
          <input
            onChange={(e) => setUserName(e.target.value.trim())}
            placeholder="Guest"
            defaultValue={user?.name ?? ""}
            style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #ccc" }}
          />
        </label>

        <button
          onClick={toggleSubscribed}
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.2)",
            cursor: "pointer",
          }}
        >
          {isSubscribed ? "Set FREE" : "Set SUBSCRIBED"}
        </button>

        <button
          onClick={reset}
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.2)",
            cursor: "pointer",
            background: "rgba(0,0,0,0.03)",
          }}
          title="Clear name and subscription"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function RootShell() {
  const stamp = useMemo(() => new Date().toISOString(), []);
  const { user, isSubscribed } = useUser();

  useEffect(() => {
    console.log("[App] Mount @", stamp);
    return () => console.log("[App] Unmount @", stamp);
  }, [stamp]);

  return (
    <div
      className="app-container"
      data-testid="app-root"
      style={{
        maxWidth: 840,
        margin: "0 auto",
        padding: 16,
        border: "2px solid rgba(0,0,0,0.05)",
        borderRadius: 14,
      }}
    >
      <h1 style={{ margin: "0 0 8px" }}>Welcome to the App</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Root component mounted. <strong>BUILD_STAMP visible in the UserContext frame below.</strong>
      </p>

      <div
        data-testid="session-pill"
        style={{
          display: "inline-flex",
          gap: 10,
          padding: "6px 10px",
          borderRadius: 999,
          border: "1px solid rgba(0,0,0,0.1)",
          background: "rgba(0,0,0,0.03)",
          marginBottom: 12,
          fontSize: 13,
        }}
      >
        <span>👤 {user?.name || "Guest"}</span>
        <span>•</span>
        <span>{isSubscribed ? "SUBSCRIBED" : "FREE"}</span>
        <span>•</span>
        <span>AppStamp: {stamp}</span>
      </div>

      <ControlPanel />

      {/* SacredGlyph can consume context if it wants; also safe with no props */}
      <div className="sacred-glyph-wrapper" data-testid="sacred-glyph-wrapper">
        <SacredGlyph />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <RootShell />
    </UserProvider>
  );
}
