export type ViewMode = "edit" | "split" | "preview";

export type ThemeMode = "light" | "dark" | "system";

export type SaveTarget = "existing" | "new";

/** How the current document was opened — determines save capabilities. */
export type FileSource = "handle" | "legacy" | "unsaved";

export interface DocumentMeta {
  /** Display name, e.g. "notes.md" */
  name: string;
  /** Bytes at last read/write. Null when never persisted. */
  size: number | null;
  /** Epoch ms of last modification known to us. */
  lastModified: number | null;
  source: FileSource;
}

export interface EditorDocument {
  meta: DocumentMeta;
  /** Current buffer contents. */
  content: string;
  /** Contents as of last successful save — used for dirty comparison. */
  savedContent: string;
  /**
   * Live handle when File System Access API is available.
   * Absent on Firefox/Safari, where only "save as download" is possible.
   */
  handle?: FileSystemFileHandle;
}

export interface RecentFileEntry {
  id: string;
  name: string;
  lastOpened: number;
  /** Only present on Chromium. */
  handle?: FileSystemFileHandle;
  /** Fallback snapshot for browsers without handle support. */
  snapshot?: string;
}

export interface FrontMatterResult {
  data: Record<string, unknown> | null;
  body: string;
  raw: string | null;
}

export interface TocEntry {
  id: string;
  text: string;
  depth: number;
}

export interface DocumentStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  readingTimeMinutes: number;
  readingTimeText: string;
}

export interface FileCapabilities {
  /** showOpenFilePicker / showSaveFilePicker available. */
  fileSystemAccess: boolean;
  /** Can overwrite the originally-opened file in place. */
  canOverwrite: boolean;
  /** Handles can be persisted to IndexedDB for a recents list. */
  canPersistHandles: boolean;
}
