import { useCallback, useRef, useState } from "react";
import { FilePlus2, FolderOpen, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    useNativePicker: boolean;
    busy: boolean;
    onOpenPicker: () => void;
    onOpenFile: (file: File) => void;
    onNewDocument: () => void;
}

export function EmptyState({
    useNativePicker,
    busy,
    onOpenPicker,
    onOpenFile,
    onNewDocument,
}: EmptyStateProps) {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            setDragging(false);

            const file = event.dataTransfer.files?.[0];
            if (file) onOpenFile(file);
        },
        [onOpenFile],
    );

    const handleClick = useCallback(() => {
        if (useNativePicker) {
            onOpenPicker();
        } else {
            inputRef.current?.click();
        }
    }, [useNativePicker, onOpenPicker]);

    return (
        <div className="flex h-full items-center justify-center p-6">
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    "flex w-full max-w-lg flex-col items-center gap-5 rounded-2xl border-2 border-dashed p-10 transition",
                    dragging
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-border/60",
                )}
            >
                <div className="glass-strong flex size-16 items-center justify-center rounded-2xl">
                    <Upload
                        className={cn(
                            "size-7 transition",
                            dragging ? "text-primary" : "text-muted-foreground",
                        )}
                    />
                </div>

                <div className="space-y-1 text-center">
                    <h2 className="text-lg font-semibold tracking-tight">
                        Open a Markdown file
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Drop a <code className="font-mono text-xs">.md</code> file here, or
                        browse your computer.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button onClick={handleClick} disabled={busy} className="gap-2">
                        <FolderOpen className="size-4" />
                        Choose file
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={onNewDocument}
                        disabled={busy}
                        className="gap-2"
                    >
                        <FilePlus2 className="size-4" />
                        New document
                    </Button>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept=".md,.markdown,.mdown,.mkd,.mdx,.txt,text/markdown,text/plain"
                    className="hidden"
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) onOpenFile(file);
                        event.target.value = "";
                    }}
                />
            </div>
        </div>
    );
}