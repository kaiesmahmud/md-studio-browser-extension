import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { crx } from "@crxjs/vite-plugin";
import path from "node:path";
import { chromeManifest, firefoxManifest } from "./manifest.config.js";

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
    mainFields: ["browser", "module", "main"],
    conditions: ["browser", "import", "module", "default"],
  },
  build: {
    outDir: `dist/${target}`,
    emptyOutDir: true,
    target: "esnext",
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      input: {
        editor: path.resolve(__dirname, "src/editor/index.html"),
      },
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;

          if (id.includes("mermaid")) return "mermaid";
          if (id.includes("@codemirror") || id.includes("@lezer")) {
            return "codemirror";
          }
          if (
            id.includes("react-markdown") ||
            id.includes("remark-") ||
            id.includes("rehype-") ||
            id.includes("micromark") ||
            id.includes("mdast-") ||
            id.includes("hast-")
          ) {
            return "markdown";
          }
          if (id.includes("jspdf") || id.includes("html2canvas")) {
            return "pdf";
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
