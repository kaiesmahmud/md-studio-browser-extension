import { forwardRef, useImperativeHandle, useRef } from "react";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ViewMode } from "@/types";

interface EditorWorkspaceProps {
    content: string;
    onChange: (value: string) => void;
    mode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
    theme: "light" | "dark";
    isMobile: boolean;
}

export interface EditorWorkspaceHandle {
    scrollToHeading: (id: string) => void;
}

/**
 * Plain textarea for now — CodeMirror lands in Step 6.
 * min-h-0 is what stops it from growing past its flex parent.
 */
function SourceArea({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="h-full min-h-0 overflow-hidden">
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                spellCheck={false}
                placeholder="Start typing…"
                className="h-full w-full resize-none overflow-y-auto overscroll-contain bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
            />
        </div>
    );
}

export const EditorWorkspace = forwardRef<
    EditorWorkspaceHandle,
    EditorWorkspaceProps
>(function EditorWorkspace(
    { content, onChange, mode, onModeChange, theme, isMobile },
    ref,
) {
    const previewRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        scrollToHeading(id: string) {
            const container = previewRef.current;
            if (!container) return;

            const target = container.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
            if (!target) return;

            // Scroll the container itself rather than the page.
            const offset =
                target.getBoundingClientRect().top -
                container.getBoundingClientRect().top +
                container.scrollTop;

            container.scrollTo({ top: offset - 12, behavior: "smooth" });
        },
    }));

    /* ---------- Mobile: tabs, no split ---------- */
    if (isMobile) {
        return (
            <Tabs
                value={mode === "split" ? "edit" : mode}
                onValueChange={(value) => onModeChange(value as ViewMode)}
                className="flex h-full min-h-0 flex-col"
            >
                <TabsList className="mx-3 mt-3 grid w-auto shrink-0 grid-cols-2">
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent
                    value="edit"
                    className="mt-0 min-h-0 flex-1 overflow-hidden"
                >
                    <SourceArea value={content} onChange={onChange} />
                </TabsContent>

                <TabsContent
                    value="preview"
                    className="mt-0 min-h-0 flex-1 overflow-hidden"
                >
                    <MarkdownPreview ref={previewRef} source={content} theme={theme} />
                </TabsContent>
            </Tabs>
        );
    }

    /* ---------- Desktop: edit only ---------- */
    if (mode === "edit") {
        return <SourceArea value={content} onChange={onChange} />;
    }

    /* ---------- Desktop: preview only ---------- */
    if (mode === "preview") {
        return <MarkdownPreview ref={previewRef} source={content} theme={theme} />;
    }

    /* ---------- Desktop: resizable split ---------- */
    return (
        <ResizablePanelGroup orientation="horizontal" className="h-full min-h-0">
            <ResizablePanel defaultSize={50} minSize={25} className="min-h-0">
                <SourceArea value={content} onChange={onChange} />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={50} minSize={25} className="min-h-0">
                <MarkdownPreview ref={previewRef} source={content} theme={theme} />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
});