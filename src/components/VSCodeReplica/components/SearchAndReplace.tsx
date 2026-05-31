import React, { useState, useEffect } from 'react';
import { Replace, ChevronRight, ChevronDown, CaseSensitive, WholeWord, Regex } from 'lucide-react';
import { FileItem } from '../types';

interface SearchAndReplaceProps {
  files: FileItem[];
  onFileSelect: (path: string, line?: number) => void;
  onReplaceAll: (search: string, replace: string, caseSensitive: boolean, wholeWord: boolean, isRegex: boolean) => void;
}

interface SearchMatch {
  lineIndex: number; // 0-indexed
  lineText: string;
  matchIndex: number;
  matchLength: number;
}

interface FileSearchResult {
  path: string;
  name: string;
  matches: SearchMatch[];
}

export const SearchAndReplace: React.FC<SearchAndReplaceProps> = ({
  files,
  onFileSelect,
  onReplaceAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [isRegex, setIsRegex] = useState(false);
  const [results, setResults] = useState<FileSearchResult[]>([]);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    performSearch();
  }, [searchQuery, files, caseSensitive, wholeWord, isRegex]);

  const performSearch = () => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const searchResults: FileSearchResult[] = [];
    const openSet = new Set<string>();

    files.forEach(file => {
      if (file.isFolder || !file.content) return;

      const lines = file.content.split('\n');
      const fileMatches: SearchMatch[] = [];

      lines.forEach((lineText, lineIndex) => {
        let regex: RegExp;
        let flags = 'g';
        if (!caseSensitive) flags += 'i';

        try {
          if (isRegex) {
            regex = new RegExp(searchQuery, flags);
          } else {
            // Escape literal regex chars
            let escaped = searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            if (wholeWord) {
              escaped = `\\b${escaped}\\b`;
            }
            regex = new RegExp(escaped, flags);
          }

          let match;
          while ((match = regex.exec(lineText)) !== null) {
            fileMatches.push({
              lineIndex,
              lineText,
              matchIndex: match.index,
              matchLength: match[0].length,
            });

            // Prevent infinite loops on empty matches
            if (match.index === regex.lastIndex) {
              regex.lastIndex++;
            }
          }
        } catch (e) {
          // Invalid regex
        }
      });

      if (fileMatches.length > 0) {
        searchResults.push({
          path: file.path,
          name: file.name,
          matches: fileMatches,
        });
        openSet.add(file.path);
      }
    });

    setResults(searchResults);
    setExpandedFiles(openSet);
  };

  const toggleFileExpand = (path: string) => {
    const next = new Set(expandedFiles);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    setExpandedFiles(next);
  };

  const handleReplaceAll = () => {
    if (searchQuery.trim()) {
      onReplaceAll(searchQuery, replaceQuery, caseSensitive, wholeWord, isRegex);
    }
  };

  const totalMatches = results.reduce((acc, curr) => acc + curr.matches.length, 0);

  return (
    <div className="vsc-sidebar-content-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="vsc-sidebar-header">
        <span className="vsc-sidebar-title">Search & Replace</span>
      </div>

      <div className="vsc-search-container">
        {/* Search Input */}
        <div className="vsc-input-group">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="vsc-input"
            placeholder="Search"
            title="Search query"
          />
          <div className="vsc-input-options">
            <button
              className={`vsc-input-option ${caseSensitive ? 'active' : ''}`}
              title="Match Case"
              onClick={() => setCaseSensitive(!caseSensitive)}
            >
              <CaseSensitive size={14} />
            </button>
            <button
              className={`vsc-input-option ${wholeWord ? 'active' : ''}`}
              title="Match Whole Word"
              onClick={() => setWholeWord(!wholeWord)}
            >
              <WholeWord size={14} />
            </button>
            <button
              className={`vsc-input-option ${isRegex ? 'active' : ''}`}
              title="Use Regular Expression"
              onClick={() => setIsRegex(!isRegex)}
            >
              <Regex size={14} />
            </button>
          </div>
        </div>

        {/* Replace Input */}
        <div className="vsc-input-group">
          <input
            value={replaceQuery}
            onChange={e => setReplaceQuery(e.target.value)}
            className="vsc-input"
            placeholder="Replace"
            title="Replace string"
          />
          <button
            className="vsc-input-option"
            style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)' }}
            title="Replace All"
            onClick={handleReplaceAll}
            disabled={results.length === 0}
          >
            <Replace size={14} />
          </button>
        </div>
      </div>

      <div className="vsc-search-results">
        {searchQuery && (
          <div style={{ padding: '0 8px 8px 8px', fontSize: '11px', color: 'var(--vsc-text-muted)' }}>
            Found {totalMatches} results in {results.length} files
          </div>
        )}

        {results.map(res => {
          const isExpanded = expandedFiles.has(res.path);
          return (
            <div key={res.path} className="vsc-search-result-item">
              <div 
                className="vsc-search-file-header"
                onClick={() => toggleFileExpand(res.path)}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span style={{ fontWeight: 600, color: 'var(--vsc-text-main)' }}>{res.name}</span>
                <span style={{ fontSize: '10px', color: 'var(--vsc-text-muted)' }}>{res.path}</span>
                <span className="vsc-panel-tab-badge">{res.matches.length}</span>
              </div>

              {isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {res.matches.map((match, idx) => {
                    const before = match.lineText.substring(0, match.matchIndex);
                    const matchedText = match.lineText.substring(match.matchIndex, match.matchIndex + match.matchLength);
                    const after = match.lineText.substring(match.matchIndex + match.matchLength);

                    return (
                      <div 
                        key={idx} 
                        className="vsc-search-match-item"
                        onClick={() => onFileSelect(res.path, match.lineIndex + 1)}
                      >
                        <span style={{ marginRight: '8px', color: 'var(--vsc-text-muted)' }}>
                          {match.lineIndex + 1}:
                        </span>
                        <span>
                          {before}
                          <mark className="vsc-match-highlight">{matchedText}</mark>
                          {after}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
