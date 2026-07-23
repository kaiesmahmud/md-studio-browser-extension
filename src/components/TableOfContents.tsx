import { ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TocEntry } from "@/types";

interface TableOfContentsProps {
    entries: TocEntry[];
    onNavigate: (id: string) => void;
}

export function TableOfContents({
    entries,
    onNavigate,
}: TableOfContentsProps) {
    return (
        <Popover>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg"
                            disabled={entries.length === 0}
                            aria-label="Table of contents"
                        >
                            <ListTree className="size-4" />
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">Outline</TooltipContent>
            </Tooltip>

            <PopoverContent align="end" className="glass-strong w-64 p-1">
                <ScrollArea className="max-h-80">
                    <div className="p-1">
                        {entries.length === 0 ? (
                            <p className="text-muted-foreground p-3 text-xs">
                                No headings yet.
                            </p>
                        ) : (
                            entries.map((entry) => (
                                <button
                                    key={entry.id}
                                    type="button"
                                    onClick={() => onNavigate(entry.id)}
                                    className={cn(
                                        "hover:bg-accent block w-full truncate rounded-md px-2 py-1.5 text-left text-xs transition",
                                        entry.depth === 1 && "font-medium",
                                        entry.depth === 2 && "pl-4",
                                        entry.depth === 3 && "pl-6",
                                        entry.depth >= 4 && "text-muted-foreground pl-8",
                                    )}
                                    title={entry.text}
                                >
                                    {entry.text}
                                </button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}