import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { crx } from "@crxjs/vite-plugin";
import path from "node:path";
import { chromeManifest, firefoxManifest } from "./manifest.config";

const target = process.env.BROWSER_TARGET === "firefox" ? "firefox" : "chrome";
const manifest = target === "firefox" ? firefoxManifest : chromeManifest;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    crx({
      manifest,
      browser: target === "firefox" ? "firefox" : "chrome",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: `dist/${target}`,
    emptyOutDir: true,
    target: "esnext",
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks: {
          mermaid: ["mermaid"],
          codemirror: [
            "@codemirror/state",
            "@codemirror/view",
            "@codemirror/commands",
            "@codemirror/lang-markdown",
            "@codemirror/language",
            "@codemirror/search",
            "@codemirror/autocomplete",
          ],
          markdown: [
            "react-markdown",
            "remark-gfm",
            "remark-frontmatter",
            "rehype-sanitize",
            "rehype-highlight",
            "rehype-slug",
            "rehype-autolink-headings",
          ],
          pdf: ["jspdf", "html2canvas"],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
