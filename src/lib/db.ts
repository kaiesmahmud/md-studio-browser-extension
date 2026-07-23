import { openDB, type IDBPDatabase } from "idb";
import type { RecentFileEntry } from "@/types";

const DB_NAME = "md-studio";
const DB_VERSION = 1;
const STORE_RECENTS = "recents";
const MAX_RECENTS = 12;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_RECENTS)) {
          const store = db.createObjectStore(STORE_RECENTS, { keyPath: "id" });
          store.createIndex("lastOpened", "lastOpened");
        }
      },
    });
  }
  return dbPromise;
}

export async function listRecents(): Promise<RecentFileEntry[]> {
  try {
    const db = await getDb();
    const all = (await db.getAll(STORE_RECENTS)) as RecentFileEntry[];
    return all.sort((a, b) => b.lastOpened - a.lastOpened).slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

export async function addRecent(entry: RecentFileEntry): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE_RECENTS, entry);
    await pruneRecents();
  } catch {
    /* recents are best-effort */
  }
}

export async function removeRecent(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORE_RECENTS, id);
  } catch {
    /* ignore */
  }
}

export async function clearRecents(): Promise<void> {
  try {
    const db = await getDb();
    await db.clear(STORE_RECENTS);
  } catch {
    /* ignore */
  }
}

async function pruneRecents(): Promise<void> {
  const all = await listRecents();
  if (all.length <= MAX_RECENTS) return;

  const db = await getDb();
  const excess = all.slice(MAX_RECENTS);
  await Promise.all(excess.map((entry) => db.delete(STORE_RECENTS, entry.id)));
}

/** Stable-ish id from name + size so reopening the same file dedupes. */
export function makeRecentId(name: string, size: number | null): string {
  return `${name}::${size ?? 0}`;
}
