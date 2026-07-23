import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FrontMatterPanelProps {
    data: Record<string, unknown>;
}

function renderValue(value: unknown): string {
    if (value === null || value === undefined) return "—";
    if (Array.isArray(value)) return value.map(renderValue).join(", ");
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

export function FrontMatterPanel({ data }: FrontMatterPanelProps) {
    const [open, setOpen] = useState(true);
    const entries = Object.entries(data);

    if (entries.length === 0) return null;

    return (
        <div className="border-border/70 bg-muted/40 mb-6 rounded-xl border">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left"
            >
                <ChevronDown
                    className={cn(
                        "text-muted-foreground size-3.5 transition-transform",
                        !open && "-rotate-90",
                    )}
                />
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Front matter
                </span>
                <span className="text-muted-foreground/70 ml-auto text-xs">
                    {entries.length} {entries.length === 1 ? "field" : "fields"}
                </span>
            </button>

            {open && (
                <dl className="grid gap-x-4 gap-y-1.5 px-3 pt-1 pb-3 text-xs sm:grid-cols-[auto_1fr]">
                    {entries.map(([key, value]) => (
                        <div key={key} className="contents">
                            <dt className="text-muted-foreground font-mono">{key}</dt>
                            <dd className="font-mono break-words">{renderValue(value)}</dd>
                        </div>
                    ))}
                </dl>
            )}
        </div>
    );
}