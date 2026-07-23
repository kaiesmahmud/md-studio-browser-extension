import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ThemeMode } from "@/types";

interface ThemeToggleProps {
    mode: ThemeMode;
    resolved: "light" | "dark";
    onModeChange: (mode: ThemeMode) => void;
}

const OPTIONS: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle({ mode, resolved, onModeChange }: ThemeToggleProps) {
    const ActiveIcon =
        mode === "system" ? Monitor : resolved === "dark" ? Moon : Sun;

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg"
                            aria-label="Change theme"
                        >
                            <ActiveIcon className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">Theme</TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="end" className="min-w-36">
                {OPTIONS.map(({ value, label, icon: Icon }) => (
                    <DropdownMenuItem
                        key={value}
                        onClick={() => onModeChange(value)}
                        className="gap-2"
                    >
                        <Icon className="size-4" />
                        <span className="flex-1">{label}</span>
                        {mode === value && (
                            <span className="bg-primary size-1.5 rounded-full" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}