// UserContext.jsx
import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

/**
 * Minimal auth/subscription context
 * - Safe defaults (guest, not subscribed)
 * - Simple actions: setUserName, toggleSubscribed, reset
 */
const Ctx = createContext({
  user: null,
  isSubscribed: false,
  setUserName: () => {},
  toggleSubscribed: () => {},
  reset: () => {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const setUserName = useCallback((name) => {
    if (!name) return setUser(null);
    setUser((prev) => ({ id: prev?.id ?? "local", name }));
  }, []);

  const toggleSubscribed = useCallback(() => setIsSubscribed((v) => !v), []);
  const reset = useCallback(() => {
    setUser(null);
    setIsSubscribed(false);
  }, []);

  const value = useMemo(
    () => ({ user, isSubscribed, setUserName, toggleSubscribed, reset }),
    [user, isSubscribed, setUserName, toggleSubscribed, reset]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUser() {
  return useContext(Ctx);
}
