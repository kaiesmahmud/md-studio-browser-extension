import { forwardRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";
import { FrontMatterPanel } from "@/components/FrontMatterPanel";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { parseFrontMatter, sanitizeSchema } from "@/lib/markdown";

interface MarkdownPreviewProps {
    source: string;
    theme: "light" | "dark";
    showFrontMatter?: boolean;
}

export const MarkdownPreview = forwardRef<HTMLDivElement, MarkdownPreviewProps>(
    function MarkdownPreview({ source, theme, showFrontMatter = true }, ref) {
        const { data, body } = useMemo(() => parseFrontMatter(source), [source]);

        return (
            <div ref={ref} className="h-full overflow-y-auto overscroll-contain">
                <div className="markdown-body mx-auto max-w-3xl px-6 py-6">
                    {showFrontMatter && data && <FrontMatterPanel data={data} />}

                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[
                            rehypeRaw,
                            [rehypeSanitize, sanitizeSchema],
                            rehypeSlug,
                            [
                                rehypeAutolinkHeadings,
                                {
                                    behavior: "append",
                                    properties: { className: "heading-anchor", ariaHidden: true },
                                    content: { type: "text", value: "#" },
                                },
                            ],
                            [rehypeHighlight, { detect: true, ignoreMissing: true }],
                        ]}
                        components={{
                            a: ({ href, children, ...props }) => (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    {...props}
                                >
                                    {children}
                                </a>
                            ),
                            code: ({ className, children, ...props }) => {
                                const text = String(children).replace(/\n$/, "");

                                if (className === "language-mermaid") {
                                    return <MermaidDiagram code={text} theme={theme} />;
                                }

                                return (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {body}
                    </ReactMarkdown>
                </div>
            </div>
        );
    },
);