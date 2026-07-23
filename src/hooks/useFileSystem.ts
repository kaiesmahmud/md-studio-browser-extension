import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createBlankDocument,
  downloadAsFile,
  FileSystemError,
  getCapabilities,
  openWithPicker,
  readFromFile,
  readFromHandle,
  saveToHandle,
  saveWithPicker,
} from "@/lib/fs";
import { addRecent, makeRecentId } from "@/lib/db";
import type { EditorDocument } from "@/types";

export function useFileSystem() {
  const [doc, setDoc] = useState<EditorDocument | null>(null);
  const [busy, setBusy] = useState(false);
  const capabilities = useRef(getCapabilities()).current;

  const recordRecent = useCallback(async (next: EditorDocument) => {
    await addRecent({
      id: makeRecentId(next.meta.name, next.meta.size),
      name: next.meta.name,
      lastOpened: Date.now(),
      handle: next.handle,
      snapshot: next.handle ? undefined : next.content,
    });
  }, []);

  /** Must be invoked directly from a click handler. */
  const open = useCallback(async () => {
    setBusy(true);
    try {
      const next = await openWithPicker();
      if (!next) return;
      setDoc(next);
      void recordRecent(next);
      toast.success(`Opened ${next.meta.name}`);
    } catch (error) {
      const message =
        error instanceof FileSystemError ? error.message : "Could not open the file";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }, [recordRecent]);

  /** Fallback + drag-drop path. */
  const openFile = useCallback(
    async (file: File) => {
      setBusy(true);
      try {
        const next = await readFromFile(file);
        setDoc(next);
        void recordRecent(next);
        toast.success(`Opened ${next.meta.name}`);
      } catch {
        toast.error("Could not read the file");
      } finally {
        setBusy(false);
      }
    },
    [recordRecent],
  );

  const openFromHandle = useCallback(
    async (handle: FileSystemFileHandle) => {
      setBusy(true);
      try {
        const next = await readFromHandle(handle);
        setDoc(next);
        void recordRecent(next);
        toast.success(`Opened ${next.meta.name}`);
      } catch {
        toast.error("Could not reopen that file — it may have moved.");
      } finally {
        setBusy(false);
      }
    },
    [recordRecent],
  );

  const newDocument = useCallback(() => {
    setDoc(createBlankDocument());
  }, []);

  const setContent = useCallback((content: string) => {
    setDoc((current) => (current ? { ...current, content } : current));
  }, []);

  const closeDocument = useCallback(() => {
    setDoc(null);
  }, []);

  /** Overwrite the opened file. */
  const saveExisting = useCallback(async () => {
    if (!doc?.handle) {
      toast.error("No existing file to save to");
      return false;
    }

    setBusy(true);
    try {
      const { size, lastModified } = await saveToHandle(doc.handle, doc.content);
      setDoc((current) =>
        current
          ? {
              ...current,
              savedContent: current.content,
              meta: { ...current.meta, size, lastModified },
            }
          : current,
      );
      toast.success(`Saved ${doc.meta.name}`);
      return true;
    } catch (error) {
      const message =
        error instanceof FileSystemError ? error.message : "Could not save";
      toast.error(message);
      return false;
    } finally {
      setBusy(false);
    }
  }, [doc]);

  /** Save As — real dialog on Chromium, download elsewhere. */
  const saveAsNew = useCallback(async () => {
    if (!doc) return false;

    setBusy(true);
    try {
      if (capabilities.fileSystemAccess) {
        const result = await saveWithPicker(doc.content, doc.meta.name);
        if (!result) return false;

        const file = await result.handle.getFile();
        setDoc((current) =>
          current
            ? {
                ...current,
                handle: result.handle,
                savedContent: current.content,
                meta: {
                  name: file.name,
                  size: result.size,
                  lastModified: result.lastModified,
                  source: "handle",
                },
              }
            : current,
        );
        toast.success(`Saved as ${file.name}`);
        return true;
      }

      downloadAsFile(doc.content, doc.meta.name);
      setDoc((current) =>
        current ? { ...current, savedContent: current.content } : current,
      );
      toast.success("Downloaded");
      return true;
    } catch (error) {
      const message =
        error instanceof FileSystemError ? error.message : "Could not save";
      toast.error(message);
      return false;
    } finally {
      setBusy(false);
    }
  }, [doc, capabilities.fileSystemAccess]);

  const dirty = doc ? doc.content !== doc.savedContent : false;
  const canOverwrite = Boolean(doc?.handle) && capabilities.canOverwrite;

  return {
    doc,
    busy,
    dirty,
    capabilities,
    canOverwrite,
    open,
    openFile,
    openFromHandle,
    newDocument,
    closeDocument,
    setContent,
    saveExisting,
    saveAsNew,
  };
}
