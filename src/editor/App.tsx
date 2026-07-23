import { FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/useTheme";
import { detectEngine, supportsFileSystemAccess } from "@/lib/browser";

export function App() {
    const { mode, resolved, setMode } = useTheme();

    const engine = detectEngine();
    const fsa = supportsFileSystemAccess();

    return (
        <>
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

                        <div className="flex-1" />

                        <ThemeToggle mode={mode} resolved={resolved} onModeChange={setMode} />
                    </div>
                }
                statusBar={
                    <div className="text-muted-foreground flex h-8 items-center gap-4 px-3 text-xs">
                        <span>engine: {engine}</span>
                        <span>
                            file system access: {fsa ? "available" : "unavailable (fallback)"}
                        </span>
                    </div>
                }
            >
                <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
                    <div className="glass-strong flex size-16 items-center justify-center rounded-2xl">
                        <FileText className="text-primary size-7" />
                    </div>
                    <div className="space-y-1 text-center">
                        <h1 className="text-xl font-semibold tracking-tight">
                            Shell is running
                        </h1>
                        <p className="text-muted-foreground max-w-sm text-sm">
                            Glass surfaces, mesh backdrop and theming are wired up. The file
                            picker and editor arrive in the next step.
                        </p>
                    </div>
                    <Button variant="secondary" size="sm">
                        Placeholder action
                    </Button>
                </div>
            </AppShell>

            <Toaster position="bottom-right" richColors />
        </>
    );
}