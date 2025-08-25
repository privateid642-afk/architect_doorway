// SacredGlyph.jsx
import React, { useEffect } from "react";

/**
 * SacredGlyph
 * - Safe to render with no props (uses sensible defaults)
 * - Shows a visible frame so you can confirm it's mounted
 * - Logs lifecycle to console for quick verification
 *
 * Optional props:
 *   - user: { id?: string, name?: string }
 *   - isSubscribed: boolean
 */
export default function SacredGlyph(props = {}) {
  const {
    user = null,
    isSubscribed = false,
  } = props;

  useEffect(() => {
    // simple mount/unmount tracer
    // eslint-disable-next-line no-console
    console.log("[SacredGlyph] mounted", { user, isSubscribed });
    return () => {
      // eslint-disable-next-line no-console
      console.log("[SacredGlyph] unmounted");
    };
  }, [user, isSubscribed]);

  const name = user?.name || "Guest";

  return (
    <div
      data-testid="sacred-glyph"
      style={{
        border: "1px dashed rgba(0,0,0,0.25)",
        padding: "16px",
        margin: "16px 0",
        borderRadius: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h2 style={{ margin: 0 }}>SacredGlyph</h2>
        <span
          title={isSubscribed ? "Subscription active" : "Subscription required"}
          style={{
            fontSize: 12,
            padding: "2px 8px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.15)",
          }}
        >
          {isSubscribed ? "SUBSCRIBED" : "FREE"}
        </span>
      </div>

      <p style={{ margin: "8px 0 12px", opacity: 0.8 }}>
        Hello, <strong>{name}</strong>. This is a smoke-test frame confirming SacredGlyph is mounted.
      </p>

      {!isSubscribed ? (
        <div
          style={{
            background: "rgba(255, 215, 0, 0.12)",
            border: "1px solid rgba(255, 215, 0, 0.4)",
            padding: 12,
            borderRadius: 10,
            fontSize: 14,
          }}
        >
          You’re viewing the free preview. Hook this component up to your auth/subscription
          source to unlock full features.
        </div>
      ) : (
        <div
          style={{
            background: "rgba(0, 128, 0, 0.08)",
            border: "1px solid rgba(0, 128, 0, 0.25)",
            padding: 12,
            borderRadius: 10,
            fontSize: 14,
          }}
        >
          Subscription detected. Render premium glyph content here.
        </div>
      )}
    </div>
  );
}
