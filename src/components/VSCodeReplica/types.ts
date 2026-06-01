export interface FileItem {
  name: string;
  path: string;
  content?: string;
  isFolder: boolean;
  isOpen?: boolean; // For folders to track expanded state
  isModified?: boolean; // For tracking modifications
  originalContent?: string; // For diff viewing
  isLazy?: boolean; // For dynamic folder/file content loader triggers
  isLoaded?: boolean; // For folders to verify if dynamic children have compiled
}

export interface TabItem {
  path: string;
  name: string;
}

/** Monaco marker — maps to IMarkerData for editor.setModelMarkers() */
export interface FileMarker {
  severity: 'error' | 'warning' | 'info' | 'hint';
  message: string;
  startLine: number;    // 1-indexed
  startColumn: number;  // 1-indexed
  endLine: number;
  endColumn: number;
  source?: string;      // optional label e.g. 'eslint', 'typescript'
}

/**
 * Subset of Monaco IStandaloneEditorConstructionOptions.
 * Extend with [key: string]: unknown for any additional Monaco options.
 */
export interface MonacoEditorOptions {
  fontSize?: number;
  fontFamily?: string;
  minimap?: { enabled?: boolean; scale?: number };
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  tabSize?: number;
  insertSpaces?: boolean;
  lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
  readOnly?: boolean;
  scrollbar?: {
    vertical?: 'auto' | 'visible' | 'hidden';
    horizontal?: 'auto' | 'visible' | 'hidden';
  };
  cursorBlinking?: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  renderWhitespace?: 'none' | 'boundary' | 'selection' | 'trailing' | 'all';
  lineHeight?: number;
  letterSpacing?: number;
  [key: string]: unknown;
}

export interface VSCodeReplicaProps {
  /** Virtual file system — key is path, value is content string or file descriptor */
  files?: Record<string, string | { content?: string; isFolder?: boolean; isLazy?: boolean }>;

  // ── Callbacks ───────────────────────────────────────────────────────────────
  /** Fired when a file's content changes in the editor */
  onFileChange?: (path: string, newContent: string) => void;
  /** Fired when a file is selected/opened in a tab */
  onFileSelect?: (path: string) => void;
  /** Fired when a new file or folder is created via the explorer */
  onFileCreate?: (path: string, isFolder: boolean) => void;
  /** Fired when a file or folder is deleted via the explorer */
  onFileDelete?: (path: string) => void;
  /** Fired when a file or folder is renamed via the explorer */
  onFileRename?: (oldPath: string, newPath: string) => void;

  // ── Lazy Loading ─────────────────────────────────────────────────────────────
  /** Async callback to fetch file content on demand (for isLazy files) */
  lazyLoadFile?: (path: string) => Promise<string>;
  /** Async callback to fetch folder children on expand (for isLazy folders) */
  lazyLoadFolder?: (path: string) => Promise<FileItem[]>;

  // ── Editor ───────────────────────────────────────────────────────────────────
  /** Override or extend Monaco editor options. Merged on top of defaults. */
  monacoOptions?: MonacoEditorOptions;
  /**
   * External markers (errors/warnings) to display in the Monaco editor.
   * Key = file path. Uses editor.setModelMarkers() under the hood.
   */
  markers?: Record<string, FileMarker[]>;

  // ── Layout & Appearance ──────────────────────────────────────────────────────
  /** Inline styles for the root container div */
  styleOverride?: React.CSSProperties;
  /** Additional CSS class on the root container */
  className?: string;
  /** Initial Monaco theme. Syncs reactively with prop changes. */
  defaultTheme?: 'vs-dark' | 'light';
  /** File path to open by default. Falls back to README.md then first file. */
  defaultOpenFile?: string;
  /** Sidebar panel width in px. Default: 260 */
  sidebarWidth?: number;
  /** z-index for the right-click context menu. Raise above MUI layers (1200+) if needed. Default: 1000 */
  contextMenuZIndex?: number;
}
