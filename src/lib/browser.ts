import browserPolyfill from "webextension-polyfill";

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

/**
 * True when the File System Access API is usable.
 * Checks the function directly rather than via `in`, which can miss
 * properties defined on the prototype chain or behind a getter.
 */
export function supportsFileSystemAccess(): boolean {
  if (typeof window === "undefined") return false;

  const open = (window as unknown as Record<string, unknown>).showOpenFilePicker;
  const save = (window as unknown as Record<string, unknown>).showSaveFilePicker;

  return typeof open === "function" && typeof save === "function";
}

/** Handles can be structured-cloned into IndexedDB only on Chromium. */
export function supportsHandlePersistence(): boolean {
  return (
    supportsFileSystemAccess() &&
    typeof window !== "undefined" &&
    "FileSystemFileHandle" in window
  );
}
