// app.js
import React from "react";
import SacredGlyph from "./SacredGlyph"; // path OK if files are co-located
import { UserProvider, useUser } from "./UserContext";

function ControlPanel() {
  const { user, isSubscribed, setUserName, toggleSubscribed, reset } = useUser();

  return (
    <div
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

export default function App() {
  return (
    <UserProvider>
      <div className="app-container" style={{ maxWidth: 840, margin: "0 auto", padding: 16 }}>
        <h1>Welcome to the App</h1>
        <p>This is your root app component.</p>

        <ControlPanel />
        {/* SacredGlyph now consumes context automatically (still supports props if passed) */}
        <div className="sacred-glyph-wrapper">
          <SacredGlyph />
        </div>
      </div>
    </UserProvider>
  );
}
