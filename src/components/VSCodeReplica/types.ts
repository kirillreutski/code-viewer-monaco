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

export interface VSCodeReplicaProps {
  files?: Record<string, string | { content?: string; isFolder?: boolean; isLazy?: boolean }>;
  onFileChange?: (path: string, newContent: string) => void;
  onFileSelect?: (path: string) => void;
  lazyLoadFile?: (path: string) => Promise<string>;
  lazyLoadFolder?: (path: string) => Promise<FileItem[]>; // Dynamic folder contents fetcher callback
  styleOverride?: React.CSSProperties;
  className?: string;
  defaultTheme?: 'vs-dark' | 'light';
}
