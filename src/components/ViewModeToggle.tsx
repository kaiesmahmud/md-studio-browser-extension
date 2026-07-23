import { Columns2, Eye, PenLine } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ViewMode } from "@/types";

interface ViewModeToggleProps {
    mode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
}

const MODES: Array<{ value: ViewMode; label: string; icon: typeof Eye }> = [
    { value: "edit", label: "Edit", icon: PenLine },
    { value: "split", label: "Split", icon: Columns2 },
    { value: "preview", label: "Preview", icon: Eye },
];

export function ViewModeToggle({ mode, onModeChange }: ViewModeToggleProps) {
    return (
        <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(value) => value && onModeChange(value as ViewMode)}
            className="gap-0.5"
        >
            {MODES.map(({ value, label, icon: Icon }) => (
                <Tooltip key={value}>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem
                            value={value}
                            aria-label={label}
                            className="size-8 rounded-lg"
                        >
                            <Icon className="size-4" />
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{label}</TooltipContent>
                </Tooltip>
            ))}
        </ToggleGroup>
    );
}