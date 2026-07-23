import { useMemo, useRef, useState } from "react";
import { FileText, FolderOpen, Save, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EditorWorkspace } from "@/components/EditorWorkspace";
import type { EditorWorkspaceHandle } from "@/components/EditorWorkspace";
import { EmptyState } from "@/components/EmptyState";
import { SaveChoiceDialog } from "@/components/SaveChoiceDialog";
import { StatusBar } from "@/components/StatusBar";
import { TableOfContents } from "@/components/TableOfContents";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useTheme } from "@/hooks/useTheme";
import { extractToc } from "@/lib/markdown";
import type { ViewMode } from "@/types";
import { CapabilityNotice } from "@/components/CapabilityNotice";

export function App() {
    const { mode: themeMode, resolved, setMode: setThemeMode } = useTheme();
    const fs = useFileSystem();
    const isMobile = useIsMobile();

    const [viewMode, setViewMode] = useState<ViewMode>("split");
    const [saveOpen, setSaveOpen] = useState(false);
    const workspaceRef = useRef<EditorWorkspaceHandle>(null);

    const toc = useMemo(
        () => (fs.doc ? extractToc(fs.doc.content) : []),
        [fs.doc],
    );

    return (
        <TooltipProvider delayDuration={300}>
            <AppShell
                toolbar={
                    <div className="flex h-12 items-center gap-2 px-3">
                        <div className="flex shrink-0 items-center gap-2">
                            <div className="from-primary flex size-7 items-center justify-center rounded-lg bg-gradient-to-br to-cyan-500">
                                <FileText className="size-4 text-white" />
                            </div>
                            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
                                md-studio
                            </span>
                        </div>

                        {fs.doc && (
                            <>
                                <Separator orientation="vertical" className="mx-1 h-5" />
                                <span className="min-w-0 truncate text-sm">
                                    {fs.doc.meta.name}
                                </span>
                                {fs.dirty && (
                                    <span className="bg-primary size-1.5 shrink-0 rounded-full" />
                                )}
                            </>
                        )}

                        <div className="flex-1" />

                        {fs.doc && (
                            <>
                                {!isMobile && (
                                    <>
                                        <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
                                        <Separator orientation="vertical" className="mx-1 h-5" />
                                    </>
                                )}

                                <TableOfContents
                                    entries={toc}
                                    onNavigate={(id) =>
                                        workspaceRef.current?.scrollToHeading(id)
                                    }
                                />

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="gap-1.5"
                                    disabled={fs.busy}
                                    onClick={() => setSaveOpen(true)}
                                >
                                    <Save className="size-4" />
                                    <span className="hidden sm:inline">Save</span>
                                </Button>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-8"
                                    disabled={fs.busy}
                                    onClick={fs.open}
                                    aria-label="Open another file"
                                >
                                    <FolderOpen className="size-4" />
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
                            mode={themeMode}
                            resolved={resolved}
                            onModeChange={setThemeMode}
                        />
                    </div>
                }
                statusBar={
                    fs.doc ? (
                        <StatusBar
                            doc={fs.doc}
                            dirty={fs.dirty}
                            canOverwrite={fs.capabilities.canOverwrite}
                        />
                    ) : undefined
                }
            >
                {fs.doc ? (
                    <div className="flex h-full min-h-0 flex-col">
                        <CapabilityNotice canOverwrite={fs.capabilities.canOverwrite} />
                        <div className="min-h-0 flex-1 overflow-hidden">
                            <EditorWorkspace
                                ref={workspaceRef}
                                content={fs.doc.content}
                                onChange={fs.setContent}
                                mode={viewMode}
                                onModeChange={setViewMode}
                                theme={resolved}
                                isMobile={isMobile}
                            />
                        </div>
                    </div>
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