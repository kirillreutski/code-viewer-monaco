import { useState } from 'react';
import { FileItem } from '../types';

interface UseLazyLoadOptions {
  lazyLoadFile?: (path: string) => Promise<string>;
  lazyLoadFolder?: (path: string) => Promise<FileItem[]>;
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

interface UseLazyLoadReturn {
  loadingFiles: Set<string>;
  loadingFolders: Set<string>;
  /** Triggers file content fetch if file is marked isLazy and not yet loaded */
  triggerFileLazyLoad: (file: FileItem) => Promise<void>;
  /** Triggers folder children fetch when expanding a lazy folder */
  triggerFolderLazyLoad: (path: string) => Promise<void>;
}

/**
 * useLazyLoad — manages async lazy-loading of file content and folder children.
 * Tracks loading states to show spinners in tabs and the file tree.
 */
export function useLazyLoad({ lazyLoadFile, lazyLoadFolder, setFiles }: UseLazyLoadOptions): UseLazyLoadReturn {
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());

  const triggerFileLazyLoad = async (file: FileItem): Promise<void> => {
    if (!file.isLazy || file.isLoaded || !lazyLoadFile) return;

    const { path } = file;
    setLoadingFiles(prev => { const n = new Set(prev); n.add(path); return n; });

    try {
      const content = await lazyLoadFile(path);
      setFiles(prev => prev.map(f =>
        f.path === path ? { ...f, content, originalContent: content, isLazy: false, isLoaded: true } : f
      ));
    } catch (err) {
      console.error('Lazy loading failed for file:', path, err);
    } finally {
      setLoadingFiles(prev => { const n = new Set(prev); n.delete(path); return n; });
    }
  };

  const triggerFolderLazyLoad = async (path: string): Promise<void> => {
    if (!lazyLoadFolder) return;

    setLoadingFolders(prev => { const n = new Set(prev); n.add(path); return n; });

    try {
      const children = await lazyLoadFolder(path);
      setFiles(prev => {
        const filtered = prev.filter(f => !children.some(c => c.path === f.path));
        const updated = filtered.map(f => f.path === path ? { ...f, isLazy: false, isLoaded: true } : f);
        return [...updated, ...children];
      });
    } catch (err) {
      console.error('Lazy loading failed for folder:', path, err);
    } finally {
      setLoadingFolders(prev => { const n = new Set(prev); n.delete(path); return n; });
    }
  };

  return { loadingFiles, loadingFolders, triggerFileLazyLoad, triggerFolderLazyLoad };
}
