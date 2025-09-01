// UserContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * User context with safe defaults + smoke-test affordances.
 * - BUILD_STAMP: cache-busting proof (visible + logged)
 * - No-crash on missing props
 * - Console trace on mount/unmount and on actions
 * - LocalStorage (best-effort) for session continuity; failsafe if unavailable
 */

const tryLoad = (key, fallback) => {
  try {
    const v = window.localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const trySave = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* no-op */
  }
};

export const UserContext = createContext({
  user: { name: "" },
  isSubscribed: false,
  setUserName: () => {},
  toggleSubscribed: () => {},
  reset: () => {},
  BUILD_STAMP: "",
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [BUILD_STAMP] = useState(() => new Date().toISOString());

  const [user, setUser] = useState(() =>
    tryLoad("ux_user", { name: "" })
  );

  const [isSubscribed, setIsSubscribed] = useState(() =>
    tryLoad("ux_isSubscribed", false)
  );

  useEffect(() => {
    console.log("[UserContext] Mount @", BUILD_STAMP, { user, isSubscribed });
    return () => {
      console.log("[UserContext] Unmount @", BUILD_STAMP);
    };
  }, [BUILD_STAMP]);

  useEffect(() => {
    trySave("ux_user", user);
  }, [user]);

  useEffect(() => {
    trySave("ux_isSubscribed", isSubscribed);
  }, [isSubscribed]);

  const setUserName = (name) => {
    const next = { name: name || "" };
    console.log("[UserContext] setUserName ->", next);
    setUser(next);
  };

  const toggleSubscribed = () => {
    setIsSubscribed((prev) => {
      const next = !prev;
      console.log("[UserContext] toggleSubscribed ->", next);
      return next;
    });
  };

  const reset = () => {
    console.log("[UserContext] reset()");
    setUser({ name: "" });
    setIsSubscribed(false);
  };

  const value = useMemo(
    () => ({ user, isSubscribed, setUserName, toggleSubscribed, reset, BUILD_STAMP }),
    [user, isSubscribed, BUILD_STAMP]
  );

  return (
    <UserContext.Provider value={value}>
      <div
        data-testid="user-context-frame"
        style={{
          border: "2px dashed #888",
          padding: "0.5rem",
          margin: "0.5rem 0",
          borderRadius: 12,
        }}
      >
        <div style={{ fontSize: 12, color: "#555", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span>🔹 <strong>UserContext</strong> Active</span>
          <span>BUILD_STAMP: <code>{BUILD_STAMP}</code></span>
          <span>name: <code>{value.user?.name || "Guest"}</code></span>
          <span>sub: <code>{String(value.isSubscribed)}</code></span>
        </div>
        {children}
      </div>
    </UserContext.Provider>
  );
};
