"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768; // Tailwind md

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    function update() {
      setIsMobile(mql.matches);
    }
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}
