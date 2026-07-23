import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
    code: string;
    theme: "light" | "dark";
}

let mermaidLoader: Promise<typeof import("mermaid")> | null = null;

function loadMermaid() {
    if (!mermaidLoader) {
        mermaidLoader = import("mermaid");
    }
    return mermaidLoader;
}

let idCounter = 0;

export function MermaidDiagram({ code, theme }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function render() {
            try {
                const { default: mermaid } = await loadMermaid();
                if (cancelled) return;

                mermaid.initialize({
                    startOnLoad: false,
                    theme: theme === "dark" ? "dark" : "default",
                    securityLevel: "strict",
                    fontFamily: "var(--font-sans)",
                });

                const id = `mermaid-${++idCounter}`;
                const { svg } = await mermaid.render(id, code);

                if (!cancelled && containerRef.current) {
                    containerRef.current.innerHTML = svg;
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Diagram error");
                }
            }
        }

        void render();
        return () => {
            cancelled = true;
        };
    }, [code, theme]);

    if (error) {
        return (
            <div className="border-destructive/40 bg-destructive/5 text-destructive mb-4 rounded-lg border p-3 text-xs">
                <span className="font-medium">Diagram error:</span> {error}
            </div>
        );
    }

    return <div ref={containerRef} className="mermaid-block" />;
}