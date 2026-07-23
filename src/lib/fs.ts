import { supportsFileSystemAccess, supportsHandlePersistence } from "@/lib/browser";
import type { EditorDocument, FileCapabilities } from "@/types";

const MD_TYPES: FilePickerAcceptType[] = [
  {
    description: "Markdown",
    accept: {
      "text/markdown": [".md", ".markdown", ".mdown", ".mkd", ".mdx"],
      "text/plain": [".txt"],
    },
  },
];

export class FileSystemError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "FileSystemError";
    this.cause = cause;
  }
}

/** User dismissed a picker — expected, not an error to surface. */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function getCapabilities(): FileCapabilities {
  const fsa = supportsFileSystemAccess();
  return {
    fileSystemAccess: fsa,
    canOverwrite: fsa,
    canPersistHandles: supportsHandlePersistence(),
  };
}

/* ------------------------------------------------------------------
   OPEN
   ------------------------------------------------------------------ */

/**
 * Open via the File System Access API.
 * MUST be called synchronously inside a user gesture — no awaits before it.
 */
export async function openWithPicker(): Promise<EditorDocument | null> {
  if (!supportsFileSystemAccess()) {
    throw new FileSystemError("File System Access API unavailable");
  }

  let handles: FileSystemFileHandle[];
  try {
    handles = await window.showOpenFilePicker({
      types: MD_TYPES,
      multiple: false,
      excludeAcceptAllOption: false,
    });
  } catch (error) {
    if (isAbortError(error)) return null;
    throw new FileSystemError("Could not open file picker", error);
  }

  const handle = handles[0];
  if (!handle) return null;

  return readFromHandle(handle);
}

export async function readFromHandle(
  handle: FileSystemFileHandle,
): Promise<EditorDocument> {
  try {
    const file = await handle.getFile();
    const content = await file.text();

    return {
      meta: {
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        source: "handle",
      },
      content,
      savedContent: content,
      handle,
    };
  } catch (error) {
    throw new FileSystemError("Could not read file", error);
  }
}

/** Fallback path — <input type="file">. No overwrite possible. */
export async function readFromFile(file: File): Promise<EditorDocument> {
  try {
    const content = await file.text();

    return {
      meta: {
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        source: "legacy",
      },
      content,
      savedContent: content,
    };
  } catch (error) {
    throw new FileSystemError("Could not read file", error);
  }
}

export function createBlankDocument(name = "untitled.md"): EditorDocument {
  return {
    meta: { name, size: null, lastModified: null, source: "unsaved" },
    content: "",
    savedContent: "",
  };
}

/* ------------------------------------------------------------------
   PERMISSIONS
   ------------------------------------------------------------------ */

type PermissionState = "granted" | "denied" | "prompt";

export async function queryWritePermission(
  handle: FileSystemFileHandle,
): Promise<PermissionState> {
  try {
    return await handle.queryPermission({ mode: "readwrite" });
  } catch {
    return "denied";
  }
}

/** Re-prompt for write access. Requires a user gesture. */
export async function ensureWritePermission(
  handle: FileSystemFileHandle,
): Promise<boolean> {
  const current = await queryWritePermission(handle);
  if (current === "granted") return true;

  try {
    const requested = await handle.requestPermission({ mode: "readwrite" });
    return requested === "granted";
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------
   SAVE
   ------------------------------------------------------------------ */

/** Overwrite the originally-opened file. Chromium only. */
export async function saveToHandle(
  handle: FileSystemFileHandle,
  content: string,
): Promise<{ size: number; lastModified: number }> {
  const permitted = await ensureWritePermission(handle);
  if (!permitted) {
    throw new FileSystemError(
      "Write permission denied. Grant access to save to this file.",
    );
  }

  try {
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();

    const file = await handle.getFile();
    return { size: file.size, lastModified: file.lastModified };
  } catch (error) {
    throw new FileSystemError("Could not write to file", error);
  }
}

/** "Save As" via a real OS dialog. Chromium only. */
export async function saveWithPicker(
  content: string,
  suggestedName: string,
): Promise<{
  handle: FileSystemFileHandle;
  size: number;
  lastModified: number;
} | null> {
  if (!supportsFileSystemAccess()) {
    throw new FileSystemError("File System Access API unavailable");
  }

  let handle: FileSystemFileHandle;
  try {
    handle = await window.showSaveFilePicker({
      types: MD_TYPES,
      suggestedName: ensureMarkdownExtension(suggestedName),
      excludeAcceptAllOption: false,
    });
  } catch (error) {
    if (isAbortError(error)) return null;
    throw new FileSystemError("Could not open save dialog", error);
  }

  const result = await saveToHandle(handle, content);
  return { handle, ...result };
}

/** Fallback — trigger a browser download. Works everywhere. */
export function downloadAsFile(content: string, filename: string): void {
  const blob = new Blob([content], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = ensureMarkdownExtension(filename);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Revoke on the next tick so the download has started.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ------------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------------ */

export function ensureMarkdownExtension(name: string): string {
  const trimmed = name.trim() || "untitled";
  if (/\.(md|markdown|mdown|mkd|mdx|txt)$/i.test(trimmed)) return trimmed;
  return `${trimmed}.md`;
}

export function stripExtension(name: string): string {
  return name.replace(/\.(md|markdown|mdown|mkd|mdx|txt)$/i, "");
}

export function isDirty(doc: EditorDocument): boolean {
  return doc.content !== doc.savedContent;
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
