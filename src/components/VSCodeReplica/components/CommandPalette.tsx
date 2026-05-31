import React, { useState, useEffect, useRef } from 'react';

interface PaletteCommand {
  id: string;
  name: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  onClose: () => void;
  commands: PaletteCommand[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onClose,
  commands,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    
    // Close on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    // Reset selection when search changes
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="vsc-palette-overlay" onKeyDown={handleKeyDown}>
      <div ref={modalRef} className="vsc-palette-modal">
        <div className="vsc-palette-search">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="vsc-input"
            placeholder="Type a command to execute..."
            title="Command Palette input query"
          />
        </div>
        <div className="vsc-palette-list">
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '12px', fontSize: '12px', color: 'var(--vsc-text-muted)', textAlign: 'center' }}>
              No commands matching '{search}'
            </div>
          ) : (
            filteredCommands.map((cmd, i) => (
              <div
                key={cmd.id}
                className={`vsc-palette-item ${i === selectedIndex ? 'selected' : ''}`}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
              >
                <span>
                  <span style={{ color: 'var(--vsc-text-muted)', marginRight: '6px' }}>{cmd.category}:</span>
                  {cmd.name}
                </span>
                {cmd.shortcut && (
                  <span className="vsc-palette-shortcut">{cmd.shortcut}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
