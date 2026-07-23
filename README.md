# md-studio

A Markdown reader and editor that runs as a browser extension. Open a `.md` file from your computer, edit it with live preview, and save it back to the original file — or to a new one.

Built with React 19, TypeScript, Tailwind CSS v4, and shadcn/ui.

---

## Features

- **Open local Markdown files** — via native file picker or drag-and-drop
- **Save to the original file, in place** — no re-downloading, no "Save As" every time
- **Save as a new file** — a two-option dialog on every save, so you always choose
- **Live split preview** — draggable divider, or edit-only / preview-only modes
- **Responsive** — split view on desktop, tabbed Edit/Preview on mobile widths
- **Dark, light, and system themes** — with a glassmorphism UI over an animated gradient
- **GitHub Flavored Markdown** — tables, task lists, strikethrough, autolinks
- **Mermaid diagrams** — lazy-loaded, rendered inline
- **YAML front matter** — parsed into a collapsible metadata panel
- **Table of contents** — jump to any heading
- **Document stats** — word count, character count, line count, reading time
- **Syntax-highlighted code blocks** — theme-aware, via highlight.js
- **Sanitized rendering** — raw HTML in Markdown is stripped of scripts and event handlers

---

## Browser support

| Browser | Open files | Edit & preview | Save to original file | Save as new file |
|---------|-----------|----------------|----------------------|------------------|
| Chrome 86+ | Yes | Yes | Yes | Yes (native dialog) |
| Edge 86+ | Yes | Yes | Yes | Yes (native dialog) |
| Brave | Yes | Yes | Flag required — see below | Yes (native dialog) |
| Firefox | Yes | Yes | No | Downloads a copy |
| Safari | Yes | Yes | No | Downloads a copy |

Saving in place requires the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API), which is Chromium-only. On browsers without it, md-studio degrades gracefully: you can still open, edit, preview, and download — the "Save to existing file" option is disabled with an explanation rather than hidden.

### Brave users

Brave ships the File System Access API disabled by default. To enable saving in place:

1. Open `brave://flags/#file-system-access-api`
2. Set it to **Enabled**
3. Restart Brave

Until then, md-studio shows an in-app notice and falls back to downloading a copy.

---

## Install

### From source

Requires Node.js 20 or newer.

```bash
git clone https://github.com/kaiesmahmud/md-studio-browser-extension.git
cd md-studio-browser-extension
npm install
npm run build:chrome
```

Then load it:

**Chrome / Brave / Edge**
1. Open `chrome://extensions` (or `brave://extensions`, `edge://extensions`)
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/chrome` folder

**Firefox**
```bash
npm run build:firefox
```
1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select any file inside `dist/firefox`

Firefox temporary add-ons are removed on restart. For a persistent install, use `npm run package:firefox` and submit the artifact to AMO, or install an already-signed build.

---

## Usage

Click the md-studio icon in your browser toolbar. A new tab opens with the editor.

| Action | How |
|--------|-----|
| Open a file | Click **Choose file**, or drag a `.md` onto the drop zone |
| New document | Click **New document** |
| Switch view | Use the Edit / Split / Preview toggle in the toolbar |
| Resize panes | Drag the divider between editor and preview |
| Jump to a heading | Click the outline icon in the toolbar |
| Save | Click **Save**, then pick "existing file" or "new file" |
| Close the document | Click the X in the toolbar |

Supported file types: `.md`, `.markdown`, `.mdown`, `.mkd`, `.mdx`, `.txt`

### Saving

Every save presents two options:

- **Save to existing file** — overwrites the file you opened. Requires the File System Access API. The first save in a session prompts for write permission.
- **Save as new file** — opens a native save dialog on Chromium; downloads a copy elsewhere.

Unsaved changes are marked with a dot next to the filename and "Unsaved changes" in the status bar.

---

## Development

```bash
npm run dev:chrome
```

Builds to `dist/chrome` with hot reload. Load that folder unpacked once; edits to `src/` refresh the tab automatically. Changes to the service worker need a manual reload from the extensions page.

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev:chrome` | Dev server, Chromium target |
| `npm run dev:firefox` | Dev server, Firefox target |
| `npm run build` | Production build, both targets |
| `npm run build:chrome` | Production build, Chromium only |
| `npm run build:firefox` | Production build, Firefox only |
| `npm run package` | Build and zip both targets into `release/` |
| `npm run lint` | Run oxlint |
| `npm run format` | Run Prettier |
| `npm run clean` | Remove `dist/` and `release/` |

### Project structure

```
md-studio-browser-extension/
├── manifest.config.ts          # MV3 manifest, Chromium + Firefox variants
├── vite.config.ts              # Build config, dual browser targets
├── public/
│   ├── icons/                  # Extension icons (16/32/48/128)
│   └── theme-init.js           # Pre-paint theme, avoids flash
└── src/
    ├── background/
    │   └── service-worker.ts   # Toolbar click → open editor tab
    ├── editor/
    │   ├── index.html          # Editor page entry
    │   ├── main.tsx
    │   └── App.tsx             # Root component
    ├── components/
    │   ├── ui/                 # shadcn/ui primitives
    │   ├── AppShell.tsx        # Glass frame + layout
    │   ├── MeshBackdrop.tsx    # Animated gradient background
    │   ├── EmptyState.tsx      # File picker / drop zone
    │   ├── EditorWorkspace.tsx # Split pane, responsive tabs
    │   ├── MarkdownPreview.tsx # Rendering pipeline
    │   ├── MermaidDiagram.tsx  # Lazy-loaded diagrams
    │   ├── FrontMatterPanel.tsx
    │   ├── SaveChoiceDialog.tsx
    │   ├── TableOfContents.tsx
    │   ├── ViewModeToggle.tsx
    │   ├── ThemeToggle.tsx
    │   ├── StatusBar.tsx
    │   └── CapabilityNotice.tsx
    ├── hooks/
    │   ├── useFileSystem.ts    # Open, save, dirty tracking
    │   ├── useTheme.ts
    │   └── useMediaQuery.ts
    ├── lib/
    │   ├── fs.ts               # File System Access wrapper + fallback
    │   ├── db.ts               # IndexedDB, recent files
    │   ├── browser.ts          # Cross-browser API + capability detection
    │   ├── markdown.ts         # Sanitize schema, front matter, TOC, stats
    │   ├── theme.ts
    │   └── utils.ts
    ├── styles/
    │   ├── globals.css         # Design tokens, glass utilities
    │   ├── fonts.css
    │   └── markdown.css        # Rendered output typography
    └── types/
        ├── index.ts
        └── file-system-access.d.ts
```

### Stack

- **React 19** + **TypeScript 7**
- **Vite 8** with `@crxjs/vite-plugin` for MV3 bundling
- **Tailwind CSS v4** — CSS-first config, no `tailwind.config.js`
- **shadcn/ui** on Radix primitives
- **react-markdown** with remark-gfm, rehype-sanitize, rehype-highlight
- **Mermaid** for diagrams, dynamically imported
- **idb** for IndexedDB file handle persistence
- **webextension-polyfill** for cross-browser extension APIs

---

## Security

- **Content Security Policy** — `script-src 'self'`. No remote scripts, no `eval`, everything bundled.
- **Sanitized Markdown** — raw HTML passes through `rehype-sanitize` before rendering. Scripts, event handlers, and dangerous protocols are stripped.
- **Minimal permissions** — the manifest requests only `storage` (for theme preference). No host permissions, no content scripts, no network access.
- **Local only** — files never leave your machine. There is no backend, no telemetry, no analytics.

File access is granted per-file by you through the browser's native picker. The extension cannot read anything you haven't explicitly opened.

---

## Known limitations

- Saving in place is Chromium-only, and Brave requires a flag
- Mermaid adds roughly 3MB to the bundle; it's lazy-loaded, so it only downloads when a document actually contains a diagram
- File handles persisted for the recent files list require permission re-prompting in new sessions — a browser security requirement, not something the extension can bypass
- Firefox builds must be loaded as temporary add-ons unless signed through AMO

---

## Roadmap

- CodeMirror 6 editor with syntax highlighting and find & replace
- Keyboard shortcuts (Ctrl+O, Ctrl+S, Ctrl+Shift+S)
- Unsaved-changes guard on tab close
- Recent files menu
- Auto-save toggle
- Export to HTML and PDF
- Synced scrolling between editor and preview
- Formatting toolbar (bold, italic, link)

---

## Contributing

Issues and pull requests are welcome.

```bash
npm install
npm run dev:chrome
npm run lint
npx tsc --noEmit
```

Please run the linter and type check before opening a PR.

---

## License

MIT

---

## Credits

Built by [Kaies Mahmud](https://github.com/kaiesmahmud).

Fonts: [Inter](https://rsms.me/inter/) and [JetBrains Mono](https://www.jetbrains.com/lp/mono/), both bundled locally under the SIL Open Font License.