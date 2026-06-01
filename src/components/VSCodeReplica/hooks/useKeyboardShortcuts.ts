import { useEffect, RefObject } from 'react';

interface UseKeyboardShortcutsOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  onTogglePalette: () => void;
}

/**
 * useKeyboardShortcuts — attaches keyboard listener to the component container
 * (not window) so shortcuts only fire when the editor is focused.
 *
 * Supported shortcuts:
 * - Cmd/Ctrl + Shift + P → toggle Command Palette
 * - F1 → toggle Command Palette
 */
export function useKeyboardShortcuts({ containerRef, onTogglePalette }: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') || e.key === 'F1') {
        e.preventDefault();
        onTogglePalette();
      }
    };

    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTogglePalette]);
}
