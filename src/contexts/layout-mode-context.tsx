"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const STORAGE_KEY = "trinityhouse-layout";

export type LayoutMode = "sidebar" | "topbar";

type ContextValue = {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  toggleLayoutMode: () => void;
};

const LayoutModeContext = createContext<ContextValue | null>(null);

export function LayoutModeProvider({ children }: { children: ReactNode }) {
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>("sidebar");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "topbar" || saved === "sidebar") setLayoutModeState(saved);
    } catch {}
  }, []);

  const setLayoutMode = useCallback((mode: LayoutMode) => {
    setLayoutModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  }, []);

  const toggleLayoutMode = useCallback(() => {
    setLayoutModeState((prev) => {
      const next = prev === "sidebar" ? "topbar" : "sidebar";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  const value: ContextValue = mounted
    ? { layoutMode: layoutMode, setLayoutMode, toggleLayoutMode }
    : { layoutMode: "sidebar", setLayoutMode, toggleLayoutMode };

  return (
    <LayoutModeContext.Provider value={value}>
      {children}
    </LayoutModeContext.Provider>
  );
}

export function useLayoutMode(): ContextValue {
  const ctx = useContext(LayoutModeContext);
  if (!ctx) {
    return {
      layoutMode: "sidebar",
      setLayoutMode: () => {},
      toggleLayoutMode: () => {},
    };
  }
  return ctx;
}
