import { useState, useEffect } from 'react';
import { FileItem, TabItem, VSCodeReplicaProps } from '../types';

const DEFAULT_FILES: Record<string, string> = {
  'README.md': `# VS Code Web Replica (Sleek Mode) 🚀

This is a lightweight, highly interactive React component replica of VS Code.

### Core Features Left:
1. **Interactive File Explorer (Left sidebar)**: 
   - Folders expand/collapse state.
   - Right-click Context Menu: Add new files/folders inline, rename, duplicate, or delete permanently!
   - Active status indicators: modified files display warning yellow text, and new files display green labels.
2. **Search & Replace (Left sidebar)**:
   - Full text search across all workspace files.
   - Toggles for Case Sensitive, Whole Word, and Regular Expressions!
   - Replace and Replace All actions instantly update the document contents in the virtual state.
3. **Monaco Editor Integration**:
   - Real typing and tab navigation.
   - Dynamic syntax highlighting for 20+ languages.
   - Tab management: Closable tabs, breadcrumbs, and double-clicks to keep tabs open.
4. **Command Palette**:
   - Press **F1** or **Cmd+Shift+P** / **Ctrl+Shift+P** to open global actions.
   - Quickly Toggle Sidebar visibility, format active code, or switch themes in real-time!

Use the outer dashboard to swap color schemes or inject files externally!`,

  'package.json': `{
  "name": "vscode-web-replica",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  }
}`,

  'src/App.tsx': `import React, { useState } from 'react';

export default function App() {
  const [clicks, setClicks] = useState(0);
  
  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h1>Sleek Replica</h1>
      <p>Click count: {clicks}</p>
      <button onClick={() => setClicks(c => c + 1)}>
        Click me
      </button>
    </div>
  );
}`,

  'src/main.tsx': `// Application Entry Point
console.log("Initializing IDE React Application...");

const root = document.getElementById('root');
if (root) {
  console.log("Root container found. Bootstrapping completed.");
} else {
  console.error("Bootstrapping Exception: #root division is missing!");
}`,

  'src/index.css': `/* CSS Document */
body {
  margin: 0;
  padding: 0;
  background-color: #121212;
  color: #ffffff;
}

h1 {
  color: #007acc;
  transition: color 0.3s ease;
}`
};

type VFSFiles = VSCodeReplicaProps['files'];

interface UseVFSOptions {
  propsFiles: VFSFiles;
  defaultOpenFile?: string;
  onFileChange?: (path: string, newContent: string) => void;
  onFileCreate?: (path: string, isFolder: boolean) => void;
  onFileDelete?: (path: string) => void;
  onFileRename?: (oldPath: string, newPath: string) => void;
}

interface UseVFSReturn {
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  activeFilePath: string | null;
  setActiveFilePath: React.Dispatch<React.SetStateAction<string | null>>;
  tabs: TabItem[];
  setTabs: React.Dispatch<React.SetStateAction<TabItem[]>>;
  handleCreateFile: (path: string, isFolder: boolean) => void;
  handleRenameFile: (oldPath: string, newPath: string) => void;
  handleDeleteFile: (path: string) => void;
  handleDuplicateFile: (path: string) => void;
  handleUpdateFileContent: (path: string, newContent: string) => void;
  handleCloseTab: (path: string, e?: React.MouseEvent) => void;
}

/**
 * useVFS — manages the Virtual File System state and all CRUD operations.
 * Initializes from propsFiles or DEFAULT_FILES, merges updates reactively.
 */
export function useVFS({
  propsFiles,
  defaultOpenFile,
  onFileChange,
  onFileCreate,
  onFileDelete,
  onFileRename,
}: UseVFSOptions): UseVFSReturn {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [tabs, setTabs] = useState<TabItem[]>([]);

  // Initialize and merge VFS
  useEffect(() => {
    if (!propsFiles) {
      if (files.length === 0) {
        const initialFiles: FileItem[] = Object.entries(DEFAULT_FILES).map(([path, content]) => ({
          name: path.split('/').pop() || path,
          path,
          content,
          isFolder: false,
          originalContent: content
        }));
        initialFiles.push({ name: 'src', path: 'src', isFolder: true });
        setFiles(initialFiles);

        const defaultFile = defaultOpenFile
          ? initialFiles.find(f => f.path === defaultOpenFile && !f.isFolder)
          : initialFiles.find(f => f.path === 'README.md' && !f.isFolder);
        if (defaultFile) {
          setActiveFilePath(defaultFile.path);
          setTabs([{ path: defaultFile.path, name: defaultFile.name }]);
        }
      }
      return;
    }

    setFiles(prevFiles => {
      const mergedFiles = [...prevFiles];
      Object.entries(propsFiles).forEach(([path, data]) => {
        const existingIdx = mergedFiles.findIndex(f => f.path === path);
        let newFileItem: FileItem;

        if (typeof data === 'string') {
          newFileItem = { name: path.split('/').pop() || path, path, content: data, isFolder: false, originalContent: data };
        } else {
          newFileItem = {
            name: path.split('/').pop() || path,
            path,
            content: data.content,
            isFolder: !!data.isFolder,
            originalContent: data.content,
            isLazy: !!data.isLazy,
            isLoaded: false
          };
        }

        if (existingIdx >= 0) {
          const existing = mergedFiles[existingIdx];
          if (!existing.isModified && existing.content !== newFileItem.content) {
            mergedFiles[existingIdx] = { ...existing, content: newFileItem.content, originalContent: newFileItem.originalContent, isLazy: newFileItem.isLazy };
          }
        } else {
          mergedFiles.push(newFileItem);
        }
      });
      return mergedFiles;
    });

    if (!activeFilePath) {
      const initialPaths = Object.keys(propsFiles);
      const defaultPath = defaultOpenFile ?? initialPaths.find(p => p.endsWith('README.md')) ?? initialPaths[0];
      if (defaultPath) {
        const name = defaultPath.split('/').pop() || defaultPath;
        const data = propsFiles[defaultPath];
        const isFolder = typeof data === 'object' && data !== null && 'isFolder' in data ? !!data.isFolder : false;
        if (!isFolder) {
          setActiveFilePath(defaultPath);
          setTabs([{ path: defaultPath, name }]);
        }
      }
    }
  }, [propsFiles]);

  const handleCloseTab = (path: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextTabs = tabs.filter(t => t.path !== path);
    setTabs(nextTabs);
    if (activeFilePath === path) {
      setActiveFilePath(nextTabs.length > 0 ? nextTabs[nextTabs.length - 1].path : null);
    }
  };

  const handleUpdateFileContent = (path: string, newContent: string) => {
    setFiles(prev => prev.map(f => {
      if (f.path !== path) return f;
      return { ...f, content: newContent, isModified: newContent !== f.originalContent };
    }));
    onFileChange?.(path, newContent);
  };

  const handleCreateFile = (path: string, isFolder: boolean) => {
    if (files.some(f => f.path === path)) return;
    const name = path.split('/').pop() || path;
    const newFile: FileItem = { name, path, isFolder, content: isFolder ? undefined : '', originalContent: isFolder ? undefined : '', isModified: false };
    setFiles(prev => [...prev, newFile]);
    if (!isFolder) {
      setTabs(prev => [...prev, { path, name }]);
      setActiveFilePath(path);
    }
    onFileCreate?.(path, isFolder);
  };

  const handleRenameFile = (oldPath: string, newPath: string) => {
    const name = newPath.split('/').pop() || newPath;
    setFiles(prev => prev.map(f => {
      if (f.path === oldPath) return { ...f, name, path: newPath };
      if (f.path.startsWith(`${oldPath}/`)) return { ...f, path: f.path.replace(oldPath, newPath) };
      return f;
    }));
    setTabs(prev => prev.map(t => {
      if (t.path === oldPath) return { ...t, name, path: newPath };
      if (t.path.startsWith(`${oldPath}/`)) return { ...t, path: t.path.replace(oldPath, newPath) };
      return t;
    }));
    if (activeFilePath === oldPath) setActiveFilePath(newPath);
    onFileRename?.(oldPath, newPath);
  };

  const handleDeleteFile = (path: string) => {
    setFiles(prev => prev.filter(f => f.path !== path && !f.path.startsWith(`${path}/`)));
    handleCloseTab(path);
    tabs.forEach(t => { if (t.path.startsWith(`${path}/`)) handleCloseTab(t.path); });
    onFileDelete?.(path);
  };

  const handleDuplicateFile = (path: string) => {
    const file = files.find(f => f.path === path);
    if (!file || file.isFolder) return;
    const parts = path.split('.');
    const ext = parts.pop();
    const duplicatePath = `${parts.join('.')}_copy.${ext}`;
    handleCreateFile(duplicatePath, false);
    handleUpdateFileContent(duplicatePath, file.content || '');
  };

  return {
    files, setFiles,
    activeFilePath, setActiveFilePath,
    tabs, setTabs,
    handleCreateFile,
    handleRenameFile,
    handleDeleteFile,
    handleDuplicateFile,
    handleUpdateFileContent,
    handleCloseTab,
  };
}
