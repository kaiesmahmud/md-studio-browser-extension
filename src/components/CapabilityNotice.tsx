import { useState } from "react";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectEngine } from "@/lib/browser";

interface CapabilityNoticeProps {
    canOverwrite: boolean;
}

const DISMISS_KEY = "md-studio-fsa-notice-dismissed";

export function CapabilityNotice({ canOverwrite }: CapabilityNoticeProps) {
    const [dismissed, setDismissed] = useState(() => {
        try {
            return localStorage.getItem(DISMISS_KEY) === "1";
        } catch {
            return false;
        }
    });

    if (canOverwrite || dismissed) return null;

    const engine = detectEngine();
    const isBrave =
        engine === "chromium" &&
        typeof navigator !== "undefined" &&
        "brave" in navigator;

    return (
        <div className="glass-subtle mx-3 mt-3 flex items-start gap-3 rounded-xl p-3">
            <Info className="text-primary mt-0.5 size-4 shrink-0" />
            <div className="min-w-0 flex-1 text-xs">
                <p className="font-medium">Saving to the original file isn't available</p>
                <p className="text-muted-foreground mt-0.5">
                    {isBrave ? (
                        <>
                            Brave disables the File System Access API by default. Enable it at{" "}
                            <code className="font-mono">
                                brave://flags/#file-system-access-api
                            </code>{" "}
                            and restart the browser.
                        </>
                    ) : engine === "gecko" || engine === "webkit" ? (
                        <>
                            This browser doesn't support writing files in place. You can still
                            edit and download a copy.
                        </>
                    ) : (
                        <>
                            Your browser blocked file system access. You can still edit and
                            download a copy.
                        </>
                    )}
                </p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="size-6 shrink-0"
                onClick={() => {
                    setDismissed(true);
                    try {
                        localStorage.setItem(DISMISS_KEY, "1");
                    } catch {
                        /* storage blocked */
                    }
                }}
                aria-label="Dismiss"
            >
                <X className="size-3.5" />
            </Button>
        </div>
    );
}