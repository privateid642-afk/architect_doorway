// SacredGlyph.jsx
import React, { useEffect, useMemo } from "react";
import { useUser } from "./UserContext";

/**
 * SacredGlyph
 * - Safe if no props are passed.
 * - Reads from UserContext when available.
 * - Provides smoke-test markers + console lifecycle traces.
 */

export default function SacredGlyph({ symbol = "✦" }) {
  const { user, isSubscribed, BUILD_STAMP } = useUser() || {};
  const glyphStamp = useMemo(() => new Date().toISOString(), []);

  useEffect(() => {
    console.log("[SacredGlyph] Mount @", glyphStamp, {
      user,
      isSubscribed,
      BUILD_STAMP,
    });
    return () => {
      console.log("[SacredGlyph] Unmount @", glyphStamp);
    };
  }, [glyphStamp, user, isSubscribed, BUILD_STAMP]);

  return (
    <div
      className="sacred-glyph"
      data-testid="sacred-glyph"
      style={{
        border: "2px solid rgba(0,0,0,0.1)",
        borderRadius: 14,
        padding: 20,
        margin: "12px 0",
        textAlign: "center",
        background: "linear-gradient(135deg, #fafafa, #f0f0f0)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontSize: "3rem", lineHeight: 1 }}>{symbol}</div>
      <p style={{ margin: "8px 0 0", fontSize: 14, color: "#444" }}>
        SacredGlyph active <br />
        <code>BUILD_STAMP: {BUILD_STAMP || "N/A"}</code>
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>
        👤 {user?.name || "Guest"} |{" "}
        {isSubscribed ? "SUBSCRIBED" : "FREE"} | GlyphStamp: {glyphStamp}
      </p>
    </div>
  );
}

