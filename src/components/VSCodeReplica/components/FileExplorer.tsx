import React, { useState, useEffect, useRef } from 'react';
import {
  Folder, FolderOpen, File, ChevronRight, ChevronDown,
  FilePlus, FolderPlus, Trash2, Copy
} from './icons';
import { FileItem, FileDecoration } from '../types';

/** Map a decoration tone to its themed CSS colour variable. */
const toneColor = (tone?: FileDecoration['tone']): string => {
  switch (tone) {
    case 'error': return 'var(--vsc-text-error)';
    case 'warning': return 'var(--vsc-text-warning)';
    case 'success': return 'var(--vsc-text-success)';
    case 'info': return 'var(--vsc-accent)';
    default: return 'var(--vsc-text-muted)';
  }
};

interface FileExplorerProps {
  files: FileItem[];
  activeFilePath: string | null;
  onFileSelect: (path: string) => void;
  onCreateFile: (path: string, isFolder: boolean) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
  onDeleteFile: (path: string) => void;
  onDuplicateFile: (path: string) => void;
  onFolderExpand: (path: string) => Promise<void>; // Hooks dynamic expand calls
  loadingFolders: Set<string>; // Tracks currently loading directory states
  loadingFiles?: Set<string>; // Tracks currently loading files
  /** z-index for context menu. Raise above MUI layers (1200+) when embedding. Default: 1000 */
  contextMenuZIndex?: number;
  /** Viewer mode: suppress the right-click context menu and the modified/new (M/U) badges. */
  disableFileOps?: boolean;
  /** External per-file badges (e.g. violation counts, change status). Key = file path. */
  decorations?: Record<string, FileDecoration>;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodePath: string | null;
  isFolder: boolean;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFilePath,
  onFileSelect,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  onDuplicateFile,
  onFolderExpand,
  loadingFolders,
  loadingFiles,
  contextMenuZIndex,
  disableFileOps,
  decorations,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set<string>(['src']));
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    nodePath: null,
    isFolder: false,
  });

  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newItemInput, setNewItemInput] = useState<{ parentPath: string; isFolder: boolean } | null>(null);
  const [newValue, setNewValue] = useState('');
  
  const editInputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPath && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingPath]);

  useEffect(() => {
    if (newItemInput && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [newItemInput]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [contextMenu]);

  const toggleFolder = async (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = files.find(f => f.path === path);

    // If folder is marked lazy and not loaded, trigger external dynamic load
    if (node && node.isFolder && node.isLazy && !node.isLoaded) {
      if (loadingFolders.has(path)) return; // Prevent multiple loads
      const next = new Set(expandedPaths);
      next.add(path);
      setExpandedPaths(next);

      await onFolderExpand(path);
      return;
    }

    const next = new Set(expandedPaths);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    setExpandedPaths(next);
  };

  const handleContextMenu = (e: React.MouseEvent, path: string, isFolder: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    // Viewer mode: no file-mutation menu.
    if (disableFileOps) return;
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      nodePath: path,
      isFolder,
    });
  };

  // Convert flat files into hierarchical nodes
  interface TreeNode {
    name: string;
    path: string;
    isFolder: boolean;
    children: TreeNode[];
    fileData?: FileItem;
  }

  const buildTree = (): TreeNode => {
    const root: TreeNode = { name: 'root', path: '', isFolder: true, children: [] };
    
    // Sort files to put folders first, then alphabetical
    const sortedFiles = [...files].sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.path.localeCompare(b.path);
    });

    sortedFiles.forEach(file => {
      const parts = file.path.split('/');
      let current = root;
      let currentPath = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        const isLast = i === parts.length - 1;
        let existing = current.children.find(child => child.name === part);

        if (!existing) {
          existing = {
            name: part,
            path: currentPath,
            isFolder: !isLast || file.isFolder,
            children: [],
            fileData: isLast ? file : undefined
          };
          current.children.push(existing);
        } else if (isLast) {
          existing.fileData = file;
          existing.isFolder = file.isFolder;
        }
        current = existing;
      }
    });

    return root;
  };

  const handleEditSubmit = (oldPath: string) => {
    if (editValue.trim() && editValue !== oldPath.split('/').pop()) {
      const parts = oldPath.split('/');
      parts[parts.length - 1] = editValue.trim();
      const newPath = parts.join('/');
      onRenameFile(oldPath, newPath);
    }
    setEditingPath(null);
  };

  const handleCreateSubmit = () => {
    if (newItemInput && newValue.trim()) {
      const parent = newItemInput.parentPath;
      const fullPath = parent ? `${parent}/${newValue.trim()}` : newValue.trim();
      onCreateFile(fullPath, newItemInput.isFolder);
      if (newItemInput.isFolder) {
        // Auto expand parent
        const next = new Set(expandedPaths);
        next.add(parent);
        setExpandedPaths(next);
      }
    }
    setNewItemInput(null);
    setNewValue('');
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    if (node.path === '') {
      return (
        <div className="vsc-tree-root">
          {newItemInput && newItemInput.parentPath === '' && (
            <div className="vsc-tree-node" style={{ paddingLeft: `${depth * 12 + 12}px` }}>
              <span className="vsc-tree-node-icon">
                {newItemInput.isFolder ? <Folder size={16} /> : <File size={16} />}
              </span>
              <input
                ref={createInputRef}
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                onBlur={handleCreateSubmit}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreateSubmit();
                  if (e.key === 'Escape') setNewItemInput(null);
                }}
                className="vsc-tree-edit-input"
                placeholder={newItemInput.isFolder ? 'Folder name...' : 'File name...'}
              />
            </div>
          )}
          {node.children.map(child => renderNode(child, depth))}
        </div>
      );
    }

    const isExpanded = expandedPaths.has(node.path);
    const isActive = activeFilePath === node.path;
    const isEditing = editingPath === node.path;
    const isModified = node.fileData?.isModified;
    const isNew = node.fileData?.originalContent === undefined && !node.isFolder;
    const decoration = decorations?.[node.path];

    let nodeClass = 'vsc-tree-node';
    if (isActive) nodeClass += ' selected';
    if (isModified) nodeClass += ' vsc-node-modified';
    if (isNew) nodeClass += ' vsc-node-new';

    const fileExtension = node.name.split('.').pop() || '';
    
    // Choose file icons
    const getFileIcon = (ext: string) => {
      switch(ext) {
        case 'js':
        case 'jsx': return <File size={16} color="#f1e05a" />;
        case 'ts':
        case 'tsx': return <File size={16} color="#3178c6" />;
        case 'html': return <File size={16} color="#e34c26" />;
        case 'css': return <File size={16} color="#563d7c" />;
        case 'json': return <File size={16} color="#cbcb41" />;
        case 'md': return <File size={16} color="#083fa1" />;
        case 'py': return <File size={16} color="#3572a5" />;
        default: return <File size={16} color="#cccccc" />;
      }
    };

    return (
      <div key={node.path} className="vsc-tree-node-wrapper">
        <div
          className={nodeClass}
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
          onClick={(e) => {
            if (node.isFolder) {
              toggleFolder(node.path, e);
            } else {
              onFileSelect(node.path);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node.path, node.isFolder)}
        >
          {node.isFolder ? (
            <span className="vsc-tree-node-chevron" onClick={(e) => toggleFolder(node.path, e)}>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          ) : (
            <span className="vsc-tree-node-indent" />
          )}

          <span className="vsc-tree-node-icon">
            {node.isFolder ? (
              isExpanded ? <FolderOpen size={16} color="#e8a838" /> : <Folder size={16} color="#e8a838" />
            ) : loadingFiles?.has(node.path) ? (
              <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="vsc-loading-spinner-micro" />
              </div>
            ) : (
              getFileIcon(fileExtension)
            )}
          </span>

          {isEditing ? (
            <input
              ref={editInputRef}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={() => handleEditSubmit(node.path)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleEditSubmit(node.path);
                if (e.key === 'Escape') setEditingPath(null);
              }}
              className="vsc-tree-edit-input"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="vsc-tree-node-label">{node.name}</span>
          )}

          {isModified && !node.isFolder && !disableFileOps && (
            <span className="vsc-tree-node-badge" style={{ color: 'var(--vsc-text-warning)' }}>M</span>
          )}
          {isNew && !node.isFolder && !disableFileOps && (
            <span className="vsc-tree-node-badge" style={{ color: 'var(--vsc-text-success)' }}>U</span>
          )}
          {decoration?.badge != null && decoration.badge !== '' && (
            <span
              className="vsc-tree-node-badge"
              style={{ color: toneColor(decoration.tone), marginLeft: 'auto' }}
              title={decoration.tooltip}
            >
              {decoration.badge}
            </span>
          )}
        </div>

        {node.isFolder && isExpanded && (
          <div className="vsc-tree-folder-children">
            {loadingFolders.has(node.path) ? (
              <div 
                className="vsc-tree-node" 
                style={{ 
                  paddingLeft: `${(depth + 1) * 12 + 12}px`, 
                  color: 'var(--vsc-text-muted)', 
                  fontStyle: 'italic',
                  fontSize: '11px',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center'
                }}
              >
                <div className="vsc-loading-spinner-micro" />
                <span>Loading contents...</span>
              </div>
            ) : (
              <>
                {newItemInput && newItemInput.parentPath === node.path && (
                  <div className="vsc-tree-node" style={{ paddingLeft: `${(depth + 1) * 12 + 12}px` }}>
                    <span className="vsc-tree-node-icon">
                      {newItemInput.isFolder ? <Folder size={16} color="#e8a838" /> : <File size={16} color="#cccccc" />}
                    </span>
                    <input
                      ref={createInputRef}
                      value={newValue}
                      onChange={e => setNewValue(e.target.value)}
                      onBlur={handleCreateSubmit}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleCreateSubmit();
                        if (e.key === 'Escape') setNewItemInput(null);
                      }}
                      className="vsc-tree-edit-input"
                      placeholder={newItemInput.isFolder ? 'Folder name...' : 'File name...'}
                    />
                  </div>
                )}
                {node.children.map(child => renderNode(child, depth + 1))}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const treeData = buildTree();

  return (
    <div className="vsc-sidebar-content-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="vsc-sidebar-header">
        <span className="vsc-sidebar-title">Workspace Explorer</span>
      </div>

      <div className="vsc-sidebar-content" style={{ flex: 1, overflowY: 'auto' }}>
        {renderNode(treeData)}
      </div>

      {/* RIGHT CLICK CONTEXT MENU */}
      {contextMenu.visible && (
        <div
          className="vsc-context-menu"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px`, zIndex: contextMenuZIndex ?? 1000 }}
          onClick={e => e.stopPropagation()}
        >
          {contextMenu.isFolder && (
            <>
              <div 
                className="vsc-context-menu-item"
                onClick={() => {
                  setNewItemInput({ parentPath: contextMenu.nodePath || '', isFolder: false });
                  setContextMenu({ ...contextMenu, visible: false });
                }}
              >
                <span>New File</span>
                <span className="vsc-context-menu-shortcut"><FilePlus size={12} /></span>
              </div>
              <div 
                className="vsc-context-menu-item"
                onClick={() => {
                  setNewItemInput({ parentPath: contextMenu.nodePath || '', isFolder: true });
                  setContextMenu({ ...contextMenu, visible: false });
                }}
              >
                <span>New Folder</span>
                <span className="vsc-context-menu-shortcut"><FolderPlus size={12} /></span>
              </div>
              <div className="vsc-context-menu-separator" />
            </>
          )}
          
          <div 
            className="vsc-context-menu-item"
            onClick={() => {
              if (contextMenu.nodePath) {
                setEditingPath(contextMenu.nodePath);
                setEditValue(contextMenu.nodePath.split('/').pop() || '');
              }
              setContextMenu({ ...contextMenu, visible: false });
            }}
          >
            <span>Rename...</span>
            <span className="vsc-context-menu-shortcut">Enter</span>
          </div>

          <div 
            className="vsc-context-menu-item"
            onClick={() => {
              if (contextMenu.nodePath) {
                onDuplicateFile(contextMenu.nodePath);
              }
              setContextMenu({ ...contextMenu, visible: false });
            }}
          >
            <span>Duplicate File</span>
            <span className="vsc-context-menu-shortcut"><Copy size={12} /></span>
          </div>

          <div className="vsc-context-menu-separator" />

          <div 
            className="vsc-context-menu-item"
            style={{ color: 'var(--vsc-text-error)' }}
            onClick={() => {
              if (contextMenu.nodePath) {
                onDeleteFile(contextMenu.nodePath);
              }
              setContextMenu({ ...contextMenu, visible: false });
            }}
          >
            <span>Delete Permanently</span>
            <span className="vsc-context-menu-shortcut"><Trash2 size={12} /></span>
          </div>
        </div>
      )}
    </div>
  );
};
