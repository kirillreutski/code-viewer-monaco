import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Files, Search, X } from 'lucide-react';

import { FileExplorer } from './components/FileExplorer';
import { SearchAndReplace } from './components/SearchAndReplace';
import { CommandPalette } from './components/CommandPalette';

import { FileItem, TabItem, VSCodeReplicaProps } from './types';
import './styles/vscode.css';

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

export const VSCodeReplica: React.FC<VSCodeReplicaProps> = ({
  files: propsFiles,
  onFileChange,
  onFileSelect,
  lazyLoadFile,
  lazyLoadFolder,
  styleOverride,
  className = '',
  defaultTheme = 'vs-dark',
}) => {
  // Theme state ('vs-dark' | 'light')
  const [theme, setTheme] = useState<'vs-dark' | 'light'>(defaultTheme);

  // Core VFS (Virtual File System) files state
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [tabs, setTabs] = useState<TabItem[]>([]);

  // UI Panels Layout
  const [activeSidebar, setActiveSidebar] = useState<'explorer' | 'search'>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Command Palette trigger
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Loading indicators for dynamic fetching
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());

  // Sync internal theme state with outer defaultTheme prop
  useEffect(() => {
    setTheme(defaultTheme);
  }, [defaultTheme]);

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
        initialFiles.push(
          { name: 'src', path: 'src', isFolder: true }
        );
        setFiles(initialFiles);

        // Open README by default
        const defaultFile = initialFiles.find(f => f.path === 'README.md' && !f.isFolder);
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
          newFileItem = { 
            name: path.split('/').pop() || path, 
            path, 
            content: data, 
            isFolder: false, 
            originalContent: data 
          };
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
          // Only update content if the internal item is not modified and the content has actually changed
          if (!existing.isModified && existing.content !== newFileItem.content) {
            mergedFiles[existingIdx] = {
              ...existing,
              content: newFileItem.content,
              originalContent: newFileItem.originalContent,
              isLazy: newFileItem.isLazy
            };
          }
        } else {
          mergedFiles.push(newFileItem);
        }
      });

      return mergedFiles;
    });

    // Also handle default active file if nothing is active yet
    if (!activeFilePath) {
      const initialPaths = Object.keys(propsFiles);
      const defaultPath = initialPaths.find(p => p.endsWith('README.md')) || initialPaths[0];
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

  // Keyboard listener for Cmd+Shift+P / F1 Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') || e.key === 'F1') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // File explorer selection
  const handleFileSelect = async (path: string, line?: number) => {
    const file = files.find(f => f.path === path);
    if (!file) return;

    if (file.isFolder) return;

    // Immediately open tab and focus editor in loading mode
    if (!tabs.find(t => t.path === path)) {
      setTabs(prev => [...prev, { path, name: file.name }]);
    }
    setActiveFilePath(path);
    if (onFileSelect) onFileSelect(path);

    // Trigger lazy load in background if marked lazy and not loaded yet
    let fileContent = file.content;
    if (file.isLazy && !file.isLoaded && lazyLoadFile) {
      setLoadingFiles(prev => {
        const next = new Set(prev);
        next.add(path);
        return next;
      });

      try {
        fileContent = await lazyLoadFile(path);
        setFiles(prev => prev.map(f => f.path === path ? { ...f, content: fileContent, originalContent: fileContent, isLazy: false, isLoaded: true } : f));
      } catch (err) {
        console.error("Lazy loading failed for file:", path, err);
      } finally {
        setLoadingFiles(prev => {
          const next = new Set(prev);
          next.delete(path);
          return next;
        });
      }
    }

    if (line) {
      console.log(`Navigating to file ${path} at line ${line}`);
    }
  };

  // Folder dynamic expand lazy load
  const handleFolderExpand = async (path: string) => {
    if (!lazyLoadFolder) return;

    setLoadingFolders(prev => {
      const next = new Set(prev);
      next.add(path);
      return next;
    });

    try {
      const children = await lazyLoadFolder(path);
      setFiles(prev => {
        // Filter out existing duplicates from child tree
        const filtered = prev.filter(f => !children.some(c => c.path === f.path));
        // Mark active expanded folder as fully loaded
        const updated = filtered.map(f => f.path === path ? { ...f, isLazy: false, isLoaded: true } : f);
        return [...updated, ...children];
      });
    } catch (err) {
      console.error("Lazy loading failed for folder:", path, err);
    } finally {
      setLoadingFolders(prev => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    }
  };

  const handleCloseTab = (path: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextTabs = tabs.filter(t => t.path !== path);
    setTabs(nextTabs);
    
    if (activeFilePath === path) {
      if (nextTabs.length > 0) {
        setActiveFilePath(nextTabs[nextTabs.length - 1].path);
      } else {
        setActiveFilePath(null);
      }
    }
  };

  const handleUpdateFileContent = (path: string, newContent: string) => {
    setFiles(prev => prev.map(f => {
      if (f.path === path) {
        const isModified = newContent !== f.originalContent;
        return { ...f, content: newContent, isModified };
      }
      return f;
    }));

    if (onFileChange) onFileChange(path, newContent);
  };

  // VFS Operations
  const handleCreateFile = (path: string, isFolder: boolean) => {
    if (files.some(f => f.path === path)) return;

    const name = path.split('/').pop() || path;
    const newFile: FileItem = {
      name,
      path,
      isFolder,
      content: isFolder ? undefined : '',
      originalContent: isFolder ? undefined : '',
      isModified: false
    };

    setFiles(prev => [...prev, newFile]);

    if (!isFolder) {
      setTabs(prev => [...prev, { path, name }]);
      setActiveFilePath(path);
    }
  };

  const handleRenameFile = (oldPath: string, newPath: string) => {
    const name = newPath.split('/').pop() || newPath;
    setFiles(prev => prev.map(f => {
      if (f.path === oldPath) {
        return { ...f, name, path: newPath };
      }
      if (f.path.startsWith(`${oldPath}/`)) {
        const updatedSubpath = f.path.replace(oldPath, newPath);
        return { ...f, path: updatedSubpath };
      }
      return f;
    }));

    setTabs(prev => prev.map(t => {
      if (t.path === oldPath) return { ...t, name, path: newPath };
      if (t.path.startsWith(`${oldPath}/`)) return { ...t, path: t.path.replace(oldPath, newPath) };
      return t;
    }));

    if (activeFilePath === oldPath) setActiveFilePath(newPath);
  };

  const handleDeleteFile = (path: string) => {
    setFiles(prev => prev.filter(f => f.path !== path && !f.path.startsWith(`${path}/`)));
    handleCloseTab(path);
    
    tabs.forEach(t => {
      if (t.path.startsWith(`${path}/`)) {
        handleCloseTab(t.path);
      }
    });
  };

  const handleDuplicateFile = (path: string) => {
    const file = files.find(f => f.path === path);
    if (!file || file.isFolder) return;

    const parts = path.split('.');
    const ext = parts.pop();
    const basePath = parts.join('.');
    const duplicatePath = `${basePath}_copy.${ext}`;

    handleCreateFile(duplicatePath, false);
    handleUpdateFileContent(duplicatePath, file.content || '');
  };

  // Search & Replace actions
  const handleReplaceAll = (search: string, replace: string, caseSensitive: boolean, wholeWord: boolean, regexOpt: boolean) => {
    setFiles(prev => prev.map(file => {
      if (file.isFolder || !file.content) return file;

      let flags = 'g';
      if (!caseSensitive) flags += 'i';

      let matcher: RegExp;
      try {
        if (regexOpt) {
          matcher = new RegExp(search, flags);
        } else {
          let escaped = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          if (wholeWord) escaped = `\\b${escaped}\\b`;
          matcher = new RegExp(escaped, flags);
        }
        
        const newContent = file.content.replace(matcher, replace);
        const isModified = newContent !== file.originalContent;
        return { ...file, content: newContent, isModified };
      } catch(e) {
        return file;
      }
    }));
  };

  // Code formatting (strips trailing spaces)
  const formatActiveDocument = () => {
    if (!activeFilePath) return;
    const file = files.find(f => f.path === activeFilePath);
    if (!file || !file.content) return;

    const formatted = file.content
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n');

    handleUpdateFileContent(activeFilePath, formatted);
  };

  // Language mappings helper
  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx': return 'javascript';
      case 'ts':
      case 'tsx': return 'typescript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'py': return 'python';
      case 'cpp':
      case 'h': return 'cpp';
      case 'java': return 'java';
      case 'go': return 'go';
      case 'rs': return 'rust';
      case 'sh':
      case 'bash': return 'shell';
      case 'sql': return 'sql';
      case 'xml': return 'xml';
      case 'yaml':
      case 'yml': return 'yaml';
      case 'dockerfile': return 'dockerfile';
      default: return 'plaintext';
    }
  };

  // Compile global commands list for palette
  const globalCommands = [
    { id: 'theme-dark', name: 'Change Theme to VS Dark', category: 'Preferences', action: () => setTheme('vs-dark') },
    { id: 'theme-light', name: 'Change Theme to Light', category: 'Preferences', action: () => setTheme('light') },
    { id: 'toggle-sidebar', name: 'Toggle Primary Side Bar Visibility', category: 'View', shortcut: 'Ctrl+B', action: () => setIsSidebarOpen(!isSidebarOpen) },
    { id: 'format-doc', name: 'Format Active Document', category: 'Editor', shortcut: 'Shift+Alt+F', action: formatActiveDocument },
    { id: 'close-editor', name: 'Close Active Editor Window', category: 'Editor', action: () => activeFilePath && handleCloseTab(activeFilePath) },
    { id: 'new-file-palette', name: 'Create New File Scaffold', category: 'File', action: () => {
        setActiveSidebar('explorer');
        handleCreateFile('src/untitled.js', false);
      } 
    }
  ];

  const currentFile = files.find(f => f.path === activeFilePath);
  const currentLanguage = activeFilePath ? getLanguageFromExtension(activeFilePath) : 'plaintext';
  const breadcrumbs = activeFilePath ? activeFilePath.split('/') : [];

  return (
    <div 
      className={`vsc-container vsc-theme-${theme} ${className}`}
      style={styleOverride}
    >
      
      {/* WORKSPACE AREA */}
      <div className="vsc-workspace" style={{ height: '100%' }}>
        
        {/* Activity Bar */}
        <div className="vsc-activity-bar">
          <div className="vsc-activity-group">
            <div 
              className={`vsc-activity-item ${activeSidebar === 'explorer' && isSidebarOpen ? 'active' : ''}`}
              title="Explorer"
              onClick={() => {
                if (activeSidebar === 'explorer') setIsSidebarOpen(!isSidebarOpen);
                else { setActiveSidebar('explorer'); setIsSidebarOpen(true); }
              }}
            >
              <Files size={22} />
            </div>
            <div 
              className={`vsc-activity-item ${activeSidebar === 'search' && isSidebarOpen ? 'active' : ''}`}
              title="Search"
              onClick={() => {
                if (activeSidebar === 'search') setIsSidebarOpen(!isSidebarOpen);
                else { setActiveSidebar('search'); setIsSidebarOpen(true); }
              }}
            >
              <Search size={22} />
            </div>
          </div>
        </div>

        {/* Sidebar panels */}
        {isSidebarOpen && (
          <div className="vsc-sidebar">
            {activeSidebar === 'explorer' && (
              <FileExplorer
                files={files}
                activeFilePath={activeFilePath}
                onFileSelect={handleFileSelect}
                onCreateFile={handleCreateFile}
                onRenameFile={handleRenameFile}
                onDeleteFile={handleDeleteFile}
                onDuplicateFile={handleDuplicateFile}
                onFolderExpand={handleFolderExpand}
                loadingFolders={loadingFolders}
                loadingFiles={loadingFiles}
              />
            )}
            {activeSidebar === 'search' && (
              <SearchAndReplace
                files={files}
                onFileSelect={handleFileSelect}
                onReplaceAll={handleReplaceAll}
              />
            )}
          </div>
        )}

        {/* Main Editor Area */}
        <div className="vsc-editor-panel-split">
          <div className="vsc-editor-area">
            {/* Tabs Row */}
            {tabs.length > 0 && (
              <div className="vsc-tabs-container">
                {tabs.map(tab => {
                  const isActive = activeFilePath === tab.path;
                  const isModified = files.find(f => f.path === tab.path)?.isModified;
                  const isLoading = loadingFiles.has(tab.path);
                  return (
                    <div 
                      key={tab.path} 
                      className={`vsc-tab ${isActive ? 'active' : ''}`}
                      onClick={() => handleFileSelect(tab.path)}
                    >
                      {isLoading && (
                        <div style={{ width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '-2px' }}>
                          <span className="vsc-loading-spinner-micro" />
                        </div>
                      )}
                      <span>{tab.name}</span>
                      {isModified ? (
                        <span className="vsc-tab-modified-dot" title="Modified" />
                      ) : null}
                      <span 
                        className="vsc-tab-close"
                        onClick={(e) => handleCloseTab(tab.path, e)}
                        title="Close active tab"
                      >
                        <X size={10} />
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Breadcrumbs */}
            {activeFilePath && (
              <div className="vsc-breadcrumbs">
                <span className="vsc-breadcrumb-item">workspace</span>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <span>&gt;</span>
                    <span className="vsc-breadcrumb-item">{crumb}</span>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Monaco wrapper */}
            <div className="vsc-monaco-wrapper" style={{ height: '100%' }}>
              {activeFilePath && currentFile ? (
                loadingFiles.has(activeFilePath) ? (
                  <div className="vsc-editor-loader">
                    <div className="vsc-loading-spinner-large" />
                    <span style={{ fontSize: '13px' }}>Fetching file from remote repository...</span>
                  </div>
                ) : (
                  <Editor
                    height="100%"
                    path={currentFile.path}
                    value={currentFile.content || ''}
                    language={currentLanguage}
                    onChange={(val) => handleUpdateFileContent(currentFile.path, val || '')}
                    theme={theme === 'light' ? 'vs' : 'vs-dark'}
                    options={{
                      fontSize: 13,
                      fontFamily: "Consolas, 'Courier New', monospace",
                      minimap: { enabled: true },
                      wordWrap: 'off',
                      tabSize: 4,
                      lineNumbers: 'on',
                      cursorBlinking: 'blink',
                      scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible'
                      }
                    }}
                  />
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--vsc-text-muted)', gap: '12px' }}>
                  <Files size={48} />
                  <span style={{ fontSize: '13px' }}>No active code tab. Double click a workspace file to open.</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="vsc-button vsc-button-secondary" onClick={() => setIsPaletteOpen(true)}>
                      Open Command Palette (F1)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Floating Global Command Palette */}
      {isPaletteOpen && (
        <CommandPalette
          onClose={() => setIsPaletteOpen(false)}
          commands={globalCommands}
        />
      )}

    </div>
  );
};
export default VSCodeReplica;
