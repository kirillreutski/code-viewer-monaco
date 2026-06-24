import { useState } from 'react';
import { VSCodeReplica } from './components/VSCodeReplica';
import { Terminal, Code2, Layers, Cpu, CloudLightning } from './components/VSCodeReplica/components/icons';

export default function App() {
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  
  // Outer logs of interactions
  const [eventLogs, setEventLogs] = useState<string[]>([
    'System: VS Code Web Replica dashboard initialized.'
  ]);

  // Dynamic files registry containing initial virtual files
  const [customFiles, setCustomFiles] = useState<Record<string, string | { content?: string; isFolder?: boolean; isLazy?: boolean }>>({
    'README.md': `# VS Code Web Replica (Light / Dark Mode)

This is a premium, highly interactive React component replica of VS Code.

### Live Showcase Features:
- **Interactive File Explorer (Left sidebar)**: 
  - Hierarchical tree structure of files & folders.
  - Context Menu (Right Click): Inline Rename, Delete, Duplicate, or create new Files/Folders.
  - Active modification warning colors and badges.
- **Cross-File Search & Replace**:
  - Full-text search with regex, case, and whole word options.
  - Replace and Replace All actions instantly update VFS contents.
- **Events Logger**: Scroll down to see a live feed of \`onFileSelect\` and \`onFileChange\` events!
- **Lazy Loading (Files & Folders)**: 
  - **Files**: Double-click \`remote_assets/heavy_utility.js\` or \`remote_assets/schema.sql\`. A loading spinner appears instantly in the file explorer tree, tab header, and editor pane, resolving dynamically!
  - **Folders**: Expand \`remote_assets/lazy_folder\`. An inline loading indicator is displayed while dynamically compiling child files dynamically!
- **Default Theme Selection**: Use the custom buttons on the right to swap between **VS Dark** or **Light** theme instantly!`,
    
    'src/index.css': `body {
  background-color: var(--vsc-bg-editor);
  color: var(--vsc-text-main);
  transition: all 0.2s ease-in-out;
}`,
    // Lazy loaded placeholders (isLazy: true triggers dynamic lazy loading)
    'remote_assets/heavy_utility.js': { isFolder: false, isLazy: true },
    'remote_assets/schema.sql': { isFolder: false, isLazy: true },
    'remote_assets/lazy_folder': { isFolder: true, isLazy: true },
    'remote_assets': { isFolder: true }
  });

  const addLog = (msg: string) => {
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  // Mock lazy loading network callback
  const handleLazyLoadFile = async (path: string): Promise<string> => {
    addLog(`Lazy Load: Triggered callback for "${path}"`);
    
    // Simulate a 1-second network fetch delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (path === 'remote_assets/heavy_utility.js') {
      const code = `// Lazy Loaded Remote Script
// Fetched successfully on demand!

export function calculateFactorial(n) {
  if (n <= 1) return 1;
  return n * calculateFactorial(n - 1);
}

console.log("Calculated 5! = " + calculateFactorial(5));
`;
      addLog(`Lazy Load: Successfully fetched heavy_utility.js content.`);
      return code;
    } else if (path === 'remote_assets/schema.sql') {
      const code = `-- Lazy Loaded SQL Database Schema
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
      addLog(`Lazy Load: Successfully fetched schema.sql database schema.`);
      return code;
    } else if (path === 'remote_assets/lazy_folder/lazy_nested_data.json') {
      const code = `{\n  "message": "Recursive File Lazy Load Success!",\n  "lazySource": "remote_assets/lazy_folder",\n  "timestamp": "${new Date().toISOString()}"\n}\n`;
      addLog(`Lazy Load: Successfully fetched lazy_nested_data.json content recursively.`);
      return code;
    }
    
    return '// Empty remote assets catalog';
  };

  // Mock lazy loading folder contents callback
  const handleLazyLoadFolder = async (path: string) => {
    addLog(`Lazy Load Folder: Triggered callback for "${path}"`);
    
    // Simulate a 1.5-second network fetch delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (path === 'remote_assets/lazy_folder') {
      addLog(`Lazy Load Folder: Successfully fetched folder contents.`);
      return [
        {
          name: 'dynamic_utility.js',
          path: 'remote_assets/lazy_folder/dynamic_utility.js',
          content: `// Dynamic Utility Loaded Asynchronously!\n\nexport function calculatePower(base, exponent) {\n  return Math.pow(base, exponent);\n}\n\nconsole.log("Lazy computed 2^10 = " + calculatePower(2, 10));\n`,
          isFolder: false
        },
        {
          name: 'config.json',
          path: 'remote_assets/lazy_folder/config.json',
          content: `{\n  "name": "dynamic-lazy-module",\n  "status": "active",\n  "version": "1.4.2",\n  "lazyLoaded": true\n}\n`,
          isFolder: false
        },
        {
          name: 'lazy_nested_data.json',
          path: 'remote_assets/lazy_folder/lazy_nested_data.json',
          isFolder: false,
          isLazy: true,
          isLoaded: false
        }
      ];
    }
    
    return [];
  };

  const handleExternalFileInject = () => {
    const randomNum = Math.floor(Math.random() * 1000);
    const filename = `src/injected_module_${randomNum}.js`;
    const content = `// Externally Injected Module #${randomNum}\nconsole.log("Hello from the outside!");\n`;
    
    setCustomFiles(prev => ({
      ...prev,
      [filename]: content
    }));
    
    addLog(`Dashboard: Injected external file "${filename}" into state.`);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0c', 
      color: '#e4e4e7',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '24px 16px',
      boxSizing: 'border-box'
    }}>
      {/* Dashboard Top Header */}
      <header style={{ 
        maxWidth: '1200px', 
        margin: '0 auto 24px auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            margin: '0 0 6px 0', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            <Code2 size={28} style={{ stroke: '#38bdf8' }} />
            VS Code Web Component Replica
          </h1>
          <p style={{ fontSize: '13px', color: '#a1a1aa', margin: 0 }}>
            Lightweight, high-fidelity React VFS Explorer replica powered by Monaco Editor.
          </p>
        </div>

        {/* Outer Controllers Dashboard */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleExternalFileInject}
            style={{
              backgroundColor: '#18181b',
              color: '#f4f4f5',
              border: '1px solid #27272a',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#27272a'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#18181b'}
          >
            <CloudLightning size={14} color="#38bdf8" />
            Inject External File
          </button>
        </div>
      </header>

      {/* Main Showcase */}
      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'grid', 
        gridTemplateColumns: '1fr 300px', 
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Component Display Frame */}
        <div style={{ 
          backgroundColor: '#121214', 
          borderRadius: '12px', 
          border: '1px solid #27272a', 
          overflow: 'hidden', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          height: '620px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* Replica Embedded Frame */}
          <VSCodeReplica
            files={customFiles}
            defaultTheme={theme}
            lazyLoadFile={handleLazyLoadFile}
            lazyLoadFolder={handleLazyLoadFolder}
            onFileSelect={(path) => addLog(`IDE Event: Selected file "${path}"`)}
            onFileChange={(path) => addLog(`IDE Event: Modified content of "${path}"`)}
          />
          
        </div>

        {/* Dashboard Sidebar Settings Controller */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Prop controller card */}
          <div style={{ 
            backgroundColor: '#121214', 
            borderRadius: '12px', 
            border: '1px solid #27272a', 
            padding: '16px' 
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
              <Layers size={16} />
              Customize Props & Styles
            </h3>
            
            {/* Theme Select */}
            <div style={{ marginBottom: '6px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                Active Theme
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {(['vs-dark', 'light'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t);
                      addLog(`Dashboard: Theme prop toggled to "${t}"`);
                    }}
                    style={{
                      padding: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: theme === t ? '#38bdf8' : '#1e1e24',
                      color: theme === t ? '#000000' : '#e4e4e7',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    {t === 'vs-dark' ? 'VS Dark' : 'VS Light'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Event Logs logger pane */}
          <div style={{ 
            backgroundColor: '#121214', 
            borderRadius: '12px', 
            border: '1px solid #27272a', 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa' }}>
              <Terminal size={16} />
              Interactive Component Logger
            </h3>
            
            <div style={{ 
              backgroundColor: '#0a0a0c', 
              borderRadius: '6px', 
              padding: '10px', 
              height: '240px', 
              overflowY: 'auto',
              border: '1px solid #1f1f23',
              fontFamily: 'Consolas, monospace',
              fontSize: '11px',
              lineHeight: '1.5',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {eventLogs.map((log, idx) => {
                let color = '#a1a1aa';
                if (log.includes('Lazy Load')) color = '#38bdf8';
                else if (log.includes('IDE Event')) color = '#818cf8';
                else if (log.includes('Dashboard')) color = '#fb7185';
                else if (log.includes('System')) color = '#34d399';

                return (
                  <div key={idx} style={{ color, wordBreak: 'break-all' }}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Specifications card */}
          <div style={{ 
            backgroundColor: '#121214', 
            borderRadius: '12px', 
            border: '1px solid #27272a', 
            padding: '16px',
            fontSize: '12px',
            color: '#a1a1aa',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fb7185', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
              <Cpu size={15} />
              Sleek Specifications
            </div>
            <div>⚡ Monaco Editor version: <strong>0.40+</strong></div>
            <div>⚡ File system: <strong>Hierarchical VFS</strong></div>
            <div>⚡ Themes supported: <strong>VS Dark & VS Light</strong></div>
          </div>

        </div>

      </main>
    </div>
  );
}
