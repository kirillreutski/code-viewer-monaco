# code-viewer-monaco 🚀

A premium, highly interactive React component replicating the visual workspace of **VS Code**, powered by **Monaco Editor**. It features dynamic asynchronous lazy loading for both directories and files, recursive folder navigation, breadcrumbs, search-and-replace, custom VS themes, and a fuzzy command palette.

[![npm version](https://img.shields.io/npm/v/code-viewer-monaco.svg?style=flat-out)](https://www.npmjs.com/package/code-viewer-monaco)
[![license](https://img.shields.io/npm/l/code-viewer-monaco.svg?style=flat-out)](https://github.com/kirillreutski/code-viewer-monaco/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/min/code-viewer-monaco?color=green)](https://bundlephobia.com/package/code-viewer-monaco)

---

## 🌟 Key Features

* **High-Fidelity VS Code Look & Feel**: Complete Activity Bar, hierarchical Sidebar File Explorer, Breadcrumbs, Tab management (closable, active indicators), and Dark/Light visual styling.
* **Monaco Editor Integration**: Fully integrated editor with real typing, autocomplete, tab sizing, and dynamic syntax highlighting for 20+ languages.
* **Dynamic Folder Lazy Loading**: Dynamic folder expansion. Expanding a lazy directory (`isLazy: true`) calls an async hook, showing an inline loader spinner and injecting children recursively.
* **Instant File Lazy Loading & Spinners**: Files marked lazy open a tab **instantly** to keep the UI snappy, showing animated progress loaders in the file explorer tree, the tab header, and a full-size editor pane while fetching content.
* **Cross-File Search & Replace**: Real-time cross-file text matching with regular expressions, case-sensitivity, and whole-word toggles. Instantly replace matches in the virtual state.
* **Fuzzy Command Palette (`F1` or `Cmd+Shift+P` / `Ctrl+Shift+P`)**: Searchable global launcher to quickly change themes, toggle sidebar, format active documents, or close tabs.
* **Custom Style Overrides**: Built with a customizable CSS variable design system. Override theme colors, border styles, fonts, and accents effortlessly.

---

## 📦 Installation

Install the package via your favorite package manager:

```bash
npm install code-viewer-monaco
```
or
```bash
yarn add code-viewer-monaco
```

---

## 🚀 Quick Start

Import the component and its baseline stylesheet into your React application:

```tsx
import React from 'react';
import { VSCodeReplica } from 'code-viewer-monaco';
import 'code-viewer-monaco/dist/style.css';

export default function MyEditor() {
  // Virtual File System (VFS) dictionary
  const myFiles = {
    'README.md': '# Hello World\nStart typing here...',
    'src/index.js': 'console.log("Welcome to Monaco!");',
    
    // Lazy file placeholder (loaded on-demand when clicked)
    'remote_assets/heavy_utility.js': { isFolder: false, isLazy: true },
    
    // Lazy folder placeholder (dynamic children fetched when expanded)
    'remote_assets/lazy_folder': { isFolder: true, isLazy: true }
  };

  // Mock callback to fetch file contents asynchronously
  const handleLazyLoadFile = async (path: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `// Successfully loaded ${path} remotely!\nexport const value = 42;\n`;
  };

  // Mock callback to fetch folder children dynamically
  const handleLazyLoadFolder = async (path: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return [
      {
        name: 'nested_script.js',
        path: `${path}/nested_script.js`,
        content: 'console.log("Loaded recursively!");',
        isFolder: false
      }
    ];
  };

  return (
    <div style={{ height: '600px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <VSCodeReplica
        files={myFiles}
        defaultTheme="vs-dark"
        lazyLoadFile={handleLazyLoadFile}
        lazyLoadFolder={handleLazyLoadFolder}
        onFileChange={(path, newContent) => console.log(`Edited: ${path}`)}
        onFileSelect={(path) => console.log(`Selected: ${path}`)}
      />
    </div>
  );
}
```

---

## 🛠️ API Reference

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `files` | `Record<string, string \| FileDescriptor>` | built-in files | Virtual File System dictionary. |
| `defaultTheme` | `"vs-dark" \| "light"` | `"vs-dark"` | Initial Monaco/layout theme. Syncs reactively. |
| `defaultOpenFile` | `string` | `README.md` or first file | File path to open on mount. |
| `lazyLoadFile` | `(path) => Promise<string>` | `undefined` | Fetch file content on demand (`isLazy: true` files). |
| `lazyLoadFolder` | `(path) => Promise<FileItem[]>` | `undefined` | Fetch folder children on expand (`isLazy: true` folders). |
| `onFileChange` | `(path, newContent) => void` | `undefined` | Fired when editor content changes. |
| `onFileSelect` | `(path) => void` | `undefined` | Fired when a file tab is opened/focused. |
| `onFileCreate` | `(path, isFolder) => void` | `undefined` | Fired when a file/folder is created via the explorer. |
| `onFileDelete` | `(path) => void` | `undefined` | Fired when a file/folder is deleted via the explorer. |
| `onFileRename` | `(oldPath, newPath) => void` | `undefined` | Fired when a file/folder is renamed via the explorer. |
| `monacoOptions` | `MonacoEditorOptions` | see defaults | Override Monaco editor options (fontSize, minimap, etc). Merged on top of defaults. |
| `markers` | `Record<string, FileMarker[]>` | `undefined` | External error/warning markers rendered as squiggly lines in the editor. |
| `sidebarWidth` | `number` | `260` | Sidebar panel width in pixels. |
| `contextMenuZIndex` | `number` | `1000` | z-index for the right-click context menu. Raise to `1500+` when embedding alongside MUI modals/drawers. |
| `styleOverride` | `React.CSSProperties` | `undefined` | Inline styles on the root container. |
| `className` | `string` | `""` | Additional CSS class on the root container. |

### Types

```typescript
export interface FileItem {
  name: string;
  path: string;
  content?: string;
  isFolder: boolean;
  isLazy?: boolean;
  isLoaded?: boolean;
}

/** Marker displayed as squiggly line in Monaco */
export interface FileMarker {
  severity: 'error' | 'warning' | 'info' | 'hint';
  message: string;
  startLine: number;    // 1-indexed
  startColumn: number;
  endLine: number;
  endColumn: number;
  source?: string;      // e.g. 'eslint', 'typescript'
}

/** Subset of Monaco IStandaloneEditorConstructionOptions */
export interface MonacoEditorOptions {
  fontSize?: number;
  minimap?: { enabled?: boolean };
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  readOnly?: boolean;
  // ... any other Monaco option via [key: string]: unknown
}
```

---

## 🔌 Integration Guides

### Vite

Monaco Editor requires web workers. Add the plugin:

```bash
npm install -D vite-plugin-monaco-editor
```

```ts
// vite.config.ts
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  plugins: [
    monacoEditorPlugin({ languages: ['typescript', 'javascript', 'css', 'json', 'markdown'] })
  ]
});
```

### Next.js

Monaco cannot run server-side. Use dynamic import:

```tsx
import dynamic from 'next/dynamic';

const VSCodeReplica = dynamic(
  () => import('code-viewer-monaco').then(m => m.VSCodeReplica),
  { ssr: false }
);
```

### MUI Admin Panel

```tsx
import { VSCodeReplica } from 'code-viewer-monaco';
import 'code-viewer-monaco/dist/style.css';
import { Box, Paper } from '@mui/material';

function CodePanel() {
  return (
    <Paper elevation={3} sx={{ height: 600, overflow: 'hidden', borderRadius: 2 }}>
      <Box sx={{ height: '100%' }}>
        <VSCodeReplica
          files={myFiles}
          // Raise context menu above MUI Drawer (1200) and Modal (1300)
          contextMenuZIndex={1500}
          onFileChange={handleChange}
        />
      </Box>
    </Paper>
  );
}
```

---

## 🔴 Markers — Error & Warning Highlights

Display squiggly lines and hover tooltips in the editor using external markers
(e.g. from your linter or TypeScript language server):

```tsx
import { VSCodeReplica, FileMarker } from 'code-viewer-monaco';

const markers: Record<string, FileMarker[]> = {
  'src/App.tsx': [
    {
      severity: 'error',
      message: "Property 'foo' does not exist on type 'Bar'.",
      startLine: 12,
      startColumn: 5,
      endLine: 12,
      endColumn: 8,
      source: 'typescript',
    },
    {
      severity: 'warning',
      message: 'Unused variable: myVar',
      startLine: 7,
      startColumn: 7,
      endLine: 7,
      endColumn: 12,
      source: 'eslint',
    },
  ],
};

<VSCodeReplica files={myFiles} markers={markers} />
```

---

## 🎨 Theme Customization

`code-viewer-monaco` uses **CSS Variables** scoped to `.vsc-container` (no global `:root` pollution).
Override any token via `className` or your project stylesheet:

```css
/* Custom Neon Cyberpunk overrides */
.my-editor-container {
  --vsc-accent: #00ffcc;
  --vsc-bg-editor: #0c0812;
  --vsc-bg-sidebar: #120e1a;
  --vsc-bg-activitybar: #161021;
  --vsc-border-color: #2a1f3a;
  --vsc-text-main: #e0d0f0;
}
```

```tsx
<VSCodeReplica className="my-editor-container" />
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/kirillreutski/code-viewer-monaco/blob/main/LICENSE) file for details.
