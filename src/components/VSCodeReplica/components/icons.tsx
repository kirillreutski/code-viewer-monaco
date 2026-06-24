import React, { forwardRef, type SVGProps } from 'react';

/**
 * Props mirror the subset of the `lucide-react` icon API actually used by this
 * component (`size`, `color`, plus any standard SVG attribute), so the icons are
 * drop-in replacements at every call site.
 */
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  /** Width and height in px (or any CSS length). Default: 24 */
  size?: number | string;
  /** Stroke color. Default: currentColor */
  color?: string;
  /** Stroke width. Default: 2 */
  strokeWidth?: number | string;
}

/**
 * Factory for self-contained, stroke-based icons. Geometry is lifted verbatim
 * from lucide-static v1.21.0 (ISC licensed) so the visuals are identical to the
 * former `lucide-react` dependency — but with zero runtime dependencies, which
 * keeps this package free of any icon-library peer dependency.
 */
const createIcon = (name: string, paths: React.ReactNode) => {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function LucideIcon(
    { size = 24, color = 'currentColor', strokeWidth = 2, className, ...rest },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-${name}${className ? ` ${className}` : ''}`}
        {...rest}
      >
        {paths}
      </svg>
    );
  });
  Icon.displayName = name;
  return Icon;
};

// ── File explorer + workspace chrome ─────────────────────────────────────────
export const Files = createIcon(
  'files',
  <>
    <path d="M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
    <path d="M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z" />
    <path d="M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1" />
  </>,
);

export const Search = createIcon(
  'search',
  <>
    <path d="m21 21-4.34-4.34" />
    <circle cx="11" cy="11" r="8" />
  </>,
);

export const X = createIcon(
  'x',
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>,
);

export const Folder = createIcon(
  'folder',
  <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />,
);

export const FolderOpen = createIcon(
  'folder-open',
  <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />,
);

export const File = createIcon(
  'file',
  <>
    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
    <path d="M14 2v5a1 1 0 0 0 1 1h5" />
  </>,
);

export const ChevronRight = createIcon('chevron-right', <path d="m9 18 6-6-6-6" />);

export const ChevronDown = createIcon('chevron-down', <path d="m6 9 6 6 6-6" />);

export const FilePlus = createIcon(
  'file-plus',
  <>
    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
    <path d="M14 2v5a1 1 0 0 0 1 1h5" />
    <path d="M9 15h6" />
    <path d="M12 18v-6" />
  </>,
);

export const FolderPlus = createIcon(
  'folder-plus',
  <>
    <path d="M12 10v6" />
    <path d="M9 13h6" />
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </>,
);

export const Trash2 = createIcon(
  'trash-2',
  <>
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </>,
);

export const Copy = createIcon(
  'copy',
  <>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </>,
);

// ── Search & replace toolbar ─────────────────────────────────────────────────
export const Replace = createIcon(
  'replace',
  <>
    <path d="M14 4a1 1 0 0 1 1-1" />
    <path d="M15 10a1 1 0 0 1-1-1" />
    <path d="M21 4a1 1 0 0 0-1-1" />
    <path d="M21 9a1 1 0 0 1-1 1" />
    <path d="m3 7 3 3 3-3" />
    <path d="M6 10V5a2 2 0 0 1 2-2h2" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </>,
);

export const CaseSensitive = createIcon(
  'case-sensitive',
  <>
    <path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16" />
    <path d="M22 9v7" />
    <path d="M3.304 13h6.392" />
    <circle cx="18.5" cy="12.5" r="3.5" />
  </>,
);

export const WholeWord = createIcon(
  'whole-word',
  <>
    <circle cx="7" cy="12" r="3" />
    <path d="M10 9v6" />
    <circle cx="17" cy="12" r="3" />
    <path d="M14 7v8" />
    <path d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1" />
  </>,
);

export const Regex = createIcon(
  'regex',
  <>
    <path d="M17 3v10" />
    <path d="m12.67 5.5 8.66 5" />
    <path d="m12.67 10.5 8.66-5" />
    <path d="M9 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2z" />
  </>,
);

// ── Demo dashboard (src/App.tsx) ─────────────────────────────────────────────
export const Terminal = createIcon(
  'terminal',
  <>
    <path d="M12 19h8" />
    <path d="m4 17 6-6-6-6" />
  </>,
);

export const Code2 = createIcon(
  'code-2',
  <>
    <path d="m18 16 4-4-4-4" />
    <path d="m6 8-4 4 4 4" />
    <path d="m14.5 4-5 16" />
  </>,
);

export const Layers = createIcon(
  'layers',
  <>
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
  </>,
);

export const Cpu = createIcon(
  'cpu',
  <>
    <path d="M12 20v2" />
    <path d="M12 2v2" />
    <path d="M17 20v2" />
    <path d="M17 2v2" />
    <path d="M2 12h2" />
    <path d="M2 17h2" />
    <path d="M2 7h2" />
    <path d="M20 12h2" />
    <path d="M20 17h2" />
    <path d="M20 7h2" />
    <path d="M7 20v2" />
    <path d="M7 2v2" />
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="8" y="8" width="8" height="8" rx="1" />
  </>,
);

export const CloudLightning = createIcon(
  'cloud-lightning',
  <>
    <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
    <path d="m13 12-3 5h4l-3 5" />
  </>,
);
