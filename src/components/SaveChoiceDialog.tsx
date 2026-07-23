import { Download, FilePlus2, Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SaveChoiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filename: string;
    canOverwrite: boolean;
    busy: boolean;
    onSaveExisting: () => void;
    onSaveAsNew: () => void;
}

export function SaveChoiceDialog({
    open,
    onOpenChange,
    filename,
    canOverwrite,
    busy,
    onSaveExisting,
    onSaveAsNew,
}: SaveChoiceDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass-strong sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Save changes</DialogTitle>
                    <DialogDescription>
                        Choose where to write your edits.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-2 py-2">
                    <button
                        type="button"
                        disabled={!canOverwrite || busy}
                        onClick={onSaveExisting}
                        className={cn(
                            "group flex items-start gap-3 rounded-xl border p-3 text-left transition",
                            "hover:border-primary/50 hover:bg-accent/50",
                            "disabled:pointer-events-none disabled:opacity-45",
                        )}
                    >
                        <span className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                            <Save className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium">
                                Save to existing file
                            </span>
                            <span className="text-muted-foreground block truncate text-xs">
                                {canOverwrite
                                    ? `Overwrite ${filename}`
                                    : "Not available in this browser"}
                            </span>
                        </span>
                    </button>

                    <button
                        type="button"
                        disabled={busy}
                        onClick={onSaveAsNew}
                        className={cn(
                            "group flex items-start gap-3 rounded-xl border p-3 text-left transition",
                            "hover:border-primary/50 hover:bg-accent/50",
                            "disabled:pointer-events-none disabled:opacity-45",
                        )}
                    >
                        <span className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                            {canOverwrite ? (
                                <FilePlus2 className="size-4" />
                            ) : (
                                <Download className="size-4" />
                            )}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium">
                                Save as new file
                            </span>
                            <span className="text-muted-foreground block text-xs">
                                {canOverwrite
                                    ? "Pick a new name and location"
                                    : "Download a copy"}
                            </span>
                        </span>
                    </button>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        disabled={busy}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}