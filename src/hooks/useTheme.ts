import { useCallback, useEffect, useState } from "react";
import { applyTheme, getStoredTheme, storeTheme } from "@/lib/theme";
import type { ThemeMode } from "@/types";

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme());
  const [resolved, setResolved] = useState<"light" | "dark">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );

  useEffect(() => {
    setResolved(applyTheme(mode));
    storeTheme(mode);
  }, [mode]);

  // Follow OS changes only while in "system" mode.
  useEffect(() => {
    if (mode !== "system") return;

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(applyTheme("system"));

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((current) => {
      const currentResolved = current === "system" ? applyTheme("system") : current;
      return currentResolved === "dark" ? "light" : "dark";
    });
  }, []);

  return { mode, resolved, setMode, toggle };
}
