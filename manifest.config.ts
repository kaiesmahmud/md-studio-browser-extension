import type { ManifestV3Export } from "@crxjs/vite-plugin";
import pkg from "./package.json" with { type: "json" };

const shared = {
  manifest_version: 3 as const,
  name: "md-studio",
  version: pkg.version === "0.0.0" ? "1.0.0" : pkg.version,
  description:
    "A modern Markdown reader and editor. Open, edit, preview and save .md files directly from your browser.",
  icons: {
    16: "icons/icon-16.png",
    32: "icons/icon-32.png",
    48: "icons/icon-48.png",
    128: "icons/icon-128.png",
  },
  permissions: ["storage"],
  action: {
    default_title: "Open md-studio",
    default_icon: {
      16: "icons/icon-16.png",
      32: "icons/icon-32.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
    },
  },
  content_security_policy: {
    extension_pages:
      "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;",
  },
};

export const chromeManifest: ManifestV3Export = {
  ...shared,
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module",
  },
  minimum_chrome_version: "116",
};

export const firefoxManifest: ManifestV3Export = {
  ...shared,
  background: {
    scripts: ["src/background/service-worker.ts"],
    type: "module",
  },
  browser_specific_settings: {
    gecko: {
      id: "md-studio@devdeertech.com",
      strict_min_version: "115.0",
    },
  },
} as ManifestV3Export;
