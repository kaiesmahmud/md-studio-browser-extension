import { useMemo } from "react";
import { computeStats } from "@/lib/markdown";
import { formatBytes } from "@/lib/fs";
import type { EditorDocument } from "@/types";

interface StatusBarProps {
    doc: EditorDocument;
    dirty: boolean;
    canOverwrite: boolean;
}

export function StatusBar({ doc, dirty, canOverwrite }: StatusBarProps) {
    const stats = useMemo(() => computeStats(doc.content), [doc.content]);

    return (
        <div className="text-muted-foreground flex h-8 items-center gap-3 overflow-x-auto px-3 text-xs whitespace-nowrap">
            <span className={dirty ? "text-primary font-medium" : ""}>
                {dirty ? "Unsaved changes" : "Saved"}
            </span>
            <span className="bg-border h-3 w-px" />
            <span>{stats.words.toLocaleString()} words</span>
            <span>{stats.characters.toLocaleString()} chars</span>
            <span>{stats.lines.toLocaleString()} lines</span>
            <span className="bg-border h-3 w-px" />
            <span>{stats.readingTimeText}</span>
            <span className="bg-border hidden h-3 w-px sm:block" />
            <span className="hidden sm:inline">{formatBytes(doc.meta.size)}</span>
            {!canOverwrite && (
                <>
                    <span className="bg-border hidden h-3 w-px md:block" />
                    <span className="hidden md:inline">Overwrite unavailable</span>
                </>
            )}
        </div>
    );
}