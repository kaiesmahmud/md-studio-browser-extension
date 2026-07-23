import { ext } from "@/lib/browser";

const EDITOR_PAGE = "src/editor/index.html";

/** Toolbar icon click → open (or focus) the editor tab. */
ext.action.onClicked.addListener(() => {
  void openEditorTab();
});

async function openEditorTab(): Promise<void> {
  const url = ext.runtime.getURL(EDITOR_PAGE);

  try {
    // Reuse an already-open editor tab rather than stacking duplicates.
    const existing = await ext.tabs.query({ url: `${url}*` });

    if (existing.length > 0 && existing[0].id !== undefined) {
      await ext.tabs.update(existing[0].id, { active: true });
      if (existing[0].windowId !== undefined) {
        await ext.windows.update(existing[0].windowId, { focused: true });
      }
      return;
    }

    await ext.tabs.create({ url });
  } catch (error) {
    console.error("[md-studio] failed to open editor tab:", error);
    // Last resort — always give the user a tab.
    await ext.tabs.create({ url });
  }
}

/** Open the editor once on fresh install so the user sees something happen. */
ext.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    void ext.tabs.create({ url: ext.runtime.getURL(EDITOR_PAGE) });
  }
});
