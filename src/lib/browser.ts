import browserPolyfill from "webextension-polyfill";

/**
 * Unified extension API.
 * Firefox exposes `browser` natively; Chromium needs the polyfill over `chrome`.
 */
export const ext = browserPolyfill;

export type BrowserEngine = "chromium" | "gecko" | "webkit" | "unknown";

export function detectEngine(): BrowserEngine {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;

  if (ua.includes("Firefox/")) return "gecko";
  if (ua.includes("Chrome/") || ua.includes("Chromium/")) return "chromium";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "webkit";
  return "unknown";
}

export function isChromium(): boolean {
  return detectEngine() === "chromium";
}

/** True when the File System Access API is usable in this context. */
export function supportsFileSystemAccess(): boolean {
  return (
    typeof window !== "undefined" &&
    "showOpenFilePicker" in window &&
    typeof window.showOpenFilePicker === "function"
  );
}
