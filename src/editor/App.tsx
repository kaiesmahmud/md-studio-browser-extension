import { useState } from "react";
import { FileText, FolderOpen, Save, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { SaveChoiceDialog } from "@/components/SaveChoiceDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useTheme } from "@/hooks/useTheme";
import { detectEngine } from "@/lib/browser";
import { formatBytes } from "@/lib/fs";

export function App() {
    const { mode, resolved, setMode } = useTheme();
    const fs = useFileSystem();
    const [saveOpen, setSaveOpen] = useState(false);

    const engine = detectEngine();

    return (
        <TooltipProvider delayDuration={300}>
            <AppShell
                toolbar={
                    <div className="flex h-12 items-center gap-2 px-3">
                        <div className="flex items-center gap-2">
                            <div className="from-primary flex size-7 items-center justify-center rounded-lg bg-gradient-to-br to-cyan-500">
                                <FileText className="size-4 text-white" />
                            </div>
                            <span className="text-sm font-semibold tracking-tight">
                                md-studio
                            </span>
                        </div>

                        <Separator orientation="vertical" className="mx-1 h-5" />

                        {fs.doc && (
                            <>
                                <span className="max-w-56 truncate text-sm">
                                    {fs.doc.meta.name}
                                </span>
                                {fs.dirty && (
                                    <span className="bg-primary size-1.5 rounded-full" />
                                )}
                            </>
                        )}

                        <div className="flex-1" />

                        {fs.doc && (
                            <>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="gap-1.5"
                                    disabled={fs.busy}
                                    onClick={() => setSaveOpen(true)}
                                >
                                    <Save className="size-4" />
                                    Save
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="gap-1.5"
                                    disabled={fs.busy}
                                    onClick={fs.open}
                                >
                                    <FolderOpen className="size-4" />
                                    Open
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-8"
                                    onClick={fs.closeDocument}
                                    aria-label="Close document"
                                >
                                    <X className="size-4" />
                                </Button>
                                <Separator orientation="vertical" className="mx-1 h-5" />
                            </>
                        )}

                        <ThemeToggle
                            mode={mode}
                            resolved={resolved}
                            onModeChange={setMode}
                        />
                    </div>
                }
                statusBar={
                    <div className="text-muted-foreground flex h-8 items-center gap-4 px-3 text-xs">
                        <span>engine: {engine}</span>
                        <span>
                            overwrite:{" "}
                            {fs.capabilities.canOverwrite ? "supported" : "unsupported"}
                        </span>
                        {fs.doc && (
                            <>
                                <span>{formatBytes(fs.doc.meta.size)}</span>
                                <span>{fs.doc.content.length} chars</span>
                                <span>{fs.dirty ? "unsaved changes" : "saved"}</span>
                            </>
                        )}
                    </div>
                }
            >
                {fs.doc ? (
                    <textarea
                        value={fs.doc.content}
                        onChange={(event) => fs.setContent(event.target.value)}
                        spellCheck={false}
                        className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm outline-none"
                        placeholder="Start typing…"
                    />
                ) : (
                    <EmptyState
                        useNativePicker={fs.capabilities.fileSystemAccess}
                        busy={fs.busy}
                        onOpenPicker={fs.open}
                        onOpenFile={fs.openFile}
                        onNewDocument={fs.newDocument}
                    />
                )}
            </AppShell>

            <SaveChoiceDialog
                open={saveOpen}
                onOpenChange={setSaveOpen}
                filename={fs.doc?.meta.name ?? ""}
                canOverwrite={fs.canOverwrite}
                busy={fs.busy}
                onSaveExisting={async () => {
                    const ok = await fs.saveExisting();
                    if (ok) setSaveOpen(false);
                }}
                onSaveAsNew={async () => {
                    const ok = await fs.saveAsNew();
                    if (ok) setSaveOpen(false);
                }}
            />

            <Toaster position="bottom-right" richColors />
        </TooltipProvider>
    );
}