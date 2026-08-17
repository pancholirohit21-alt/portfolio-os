'use client';
import { useState, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileCode, FileJson, FileType2, FileText, ChevronRight, ChevronDown, Search, GitBranch, Settings, Info } from 'lucide-react';
import codebaseDataRaw from '@/lib/codebase.json';

type CodebaseFile = {
  content: string;
  language: string;
};

const codebaseData = codebaseDataRaw as Record<string, CodebaseFile>;

const getFileIcon = (filename: string) => {
  if (filename.endsWith('.tsx')) return { icon: FileCode, color: 'text-blue-400' };
  if (filename.endsWith('.ts')) return { icon: FileType2, color: 'text-blue-500' };
  if (filename.endsWith('.js') || filename.endsWith('.mjs') || filename.endsWith('.cjs')) return { icon: FileCode, color: 'text-yellow-300' };
  if (filename.endsWith('.json') || filename.startsWith('.')) return { icon: FileJson, color: 'text-yellow-400' };
  if (filename.endsWith('.md')) return { icon: Info, color: 'text-blue-300' };
  if (filename.endsWith('.css')) return { icon: FileText, color: 'text-cyan-400' };
  return { icon: FileText, color: 'text-slate-400' };
};

export default function VSCode() {
  const filePaths = useMemo(() => Object.keys(codebaseData).sort(), []);
  
  // Set default active file and open tabs
  const defaultFile = 'src/app/page.tsx';
  const [activeFile, setActiveFile] = useState<string>(codebaseData[defaultFile] ? defaultFile : filePaths[0] || '');
  const [openFiles, setOpenFiles] = useState<string[]>(
    ['src/app/page.tsx', 'src/store/useWindowStore.ts', 'package.json'].filter(p => codebaseData[p])
  );
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: prev[folderPath] === undefined ? false : !prev[folderPath]
    }));
  };

  const handleFileClick = (path: string) => {
    if (!openFiles.includes(path)) {
      setOpenFiles([...openFiles, path]);
    }
    setActiveFile(path);
  };

  const closeFile = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(p => p !== path);
    setOpenFiles(newOpenFiles);
    if (activeFile === path) {
      setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[0] : '');
    }
  };

  // Helper to group files by directory for the sidebar
  const directoryTree = useMemo(() => {
    const tree: any = {
      '.git': {},
      '.next': {},
      'node_modules': {},
    };
    filePaths.forEach(path => {
      const parts = path.split('/');
      let current = tree;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = path; // store full path for leaf nodes
    });
    return tree;
  }, [filePaths]);

  const renderTree = (node: any, level = 0, currentPath = '') => {
    return Object.entries(node).map(([key, value]) => {
      const fullPath = currentPath ? `${currentPath}/${key}` : key;
      if (typeof value === 'string') {
        // It's a file
        const { icon: Icon, color } = getFileIcon(key);
        const isActive = activeFile === value;
        return (
          <div 
            key={value}
            onClick={() => handleFileClick(value)}
            className={`flex items-center px-4 py-1.5 cursor-pointer text-[13px] ${isActive ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e] text-[#cccccc]'}`}
            style={{ paddingLeft: `${(level + 1) * 12 + 12}px` }}
          >
            <Icon size={16} className={`mr-2 shrink-0 ${color}`} />
            <span className="truncate">{key}</span>
          </div>
        );
      } else {
        // It's a folder
        const isDummy = ['.git', '.next', 'node_modules'].includes(key) && level === 0;
        const isExpanded = isDummy ? false : expandedFolders[fullPath] !== false;
        
        return (
          <div key={fullPath} className="flex flex-col">
            <div 
              onClick={() => !isDummy && toggleFolder(fullPath)}
              className={`flex items-center px-1 py-1 text-[#cccccc] text-[13px] select-none ${isDummy ? 'cursor-default opacity-80' : 'cursor-pointer hover:bg-[#2a2d2e]'}`}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
              <ChevronRight size={16} className={`mr-1 shrink-0 ${isExpanded ? 'rotate-90' : ''} transition-transform`} /> {key}
            </div>
            {isExpanded && renderTree(value, level + 1, fullPath)}
          </div>
        );
      }
    });
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#1e1e1e] text-[#cccccc] font-sans">
      {/* Activity Bar & Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Activity Bar */}
        <div className="w-12 bg-[#333333] flex flex-col items-center py-4 border-r border-[#252526] shrink-0">
          <button className="p-3 text-white border-l-2 border-blue-500 hover:text-white transition-colors"><FileCode size={24} strokeWidth={1.5} /></button>
          <button className="p-3 text-[#858585] hover:text-white transition-colors"><Search size={24} strokeWidth={1.5} /></button>
          <button className="p-3 text-[#858585] hover:text-white transition-colors"><GitBranch size={24} strokeWidth={1.5} /></button>
          <button className="p-3 text-[#858585] hover:text-white transition-colors mt-auto"><Settings size={24} strokeWidth={1.5} /></button>
        </div>

        {/* Sidebar (File Explorer) */}
        <div className="w-64 bg-[#252526] flex flex-col shrink-0 border-r border-[#1e1e1e]">
          <div className="px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-[#bbbbbb]">Explorer</div>
          
          <div className="flex flex-col mt-2 flex-1 overflow-y-auto custom-scrollbar">
            <div 
              onClick={() => toggleFolder('root')}
              className="flex items-center px-1 py-1 cursor-pointer hover:bg-[#2a2d2e] font-bold text-sm text-white select-none"
            >
              {expandedFolders['root'] !== false ? <ChevronDown size={16} className="mr-1 shrink-0" /> : <ChevronRight size={16} className="mr-1 shrink-0" />}
              ROHIT-PORTFOLIO-OS
            </div>
            
            {expandedFolders['root'] !== false && (
              <div className="flex flex-col mt-1 pb-4">
                {renderTree(directoryTree)}
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden min-w-0">
          
          {/* Editor Tabs */}
          {openFiles.length > 0 ? (
            <div className="flex bg-[#252526] overflow-x-auto custom-scrollbar shrink-0">
              {openFiles.map((path) => {
                const isActive = activeFile === path;
                const filename = path.split('/').pop() || path;
                const { icon: Icon, color } = getFileIcon(filename);
                return (
                  <div 
                    key={path}
                    onClick={() => setActiveFile(path)}
                    className={`flex items-center px-3 py-2 cursor-pointer text-[13px] border-r border-[#1e1e1e] min-w-[120px] max-w-[200px] group ${isActive ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500' : 'bg-[#2d2d2d] text-[#858585] hover:bg-[#2a2d2e]'}`}
                  >
                    <Icon size={14} className={`mr-2 shrink-0 ${color}`} />
                    <span className="truncate flex-1">{filename}</span>
                    <div 
                      onClick={(e) => closeFile(e, path)}
                      className={`ml-2 w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      ×
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#858585]">
              <FileCode size={64} strokeWidth={1} className="mb-4 opacity-20" />
              <p>Select a file to view code</p>
            </div>
          )}
          
          {/* Editor Breadcrumbs */}
          {activeFile && codebaseData[activeFile] && (
            <div className="px-4 py-1.5 flex items-center text-[12px] text-[#858585] bg-[#1e1e1e] shadow-sm shrink-0 overflow-hidden whitespace-nowrap">
              <span className="hover:text-white cursor-pointer shrink-0">rohit-portfolio-os</span>
              {activeFile.split('/').map((part, index, arr) => (
                <div key={index} className="flex items-center">
                  <ChevronRight size={14} className="mx-1 opacity-50 shrink-0" />
                  <span className={`${index === arr.length - 1 ? 'text-[#cccccc]' : 'hover:text-white cursor-pointer'}`}>{part}</span>
                </div>
              ))}
            </div>
          )}

          {/* Syntax Highlighter */}
          {activeFile && codebaseData[activeFile] && (
            <div className="flex-1 overflow-auto bg-[#1e1e1e] custom-scrollbar pb-10">
              <SyntaxHighlighter
                language={codebaseData[activeFile].language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '24px 0',
                  background: 'transparent',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                }}
                showLineNumbers={true}
                lineNumberStyle={{ minWidth: '50px', paddingRight: '20px', color: '#6e7681', textAlign: 'right' }}
              >
                {codebaseData[activeFile].content}
              </SyntaxHighlighter>
            </div>
          )}
        </div>

      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] font-medium shrink-0 overflow-hidden">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1 hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer transition-colors whitespace-nowrap"><GitBranch size={12}/> main*</span>
          <span className="hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer transition-colors whitespace-nowrap">0 ⚠  0 ⛔</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer transition-colors hidden sm:block">UTF-8</span>
          {activeFile && codebaseData[activeFile] && (
            <span className="hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer transition-colors whitespace-nowrap">{codebaseData[activeFile].language.toUpperCase()}</span>
          )}
          <span className="hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer transition-colors hidden sm:block">Prettier</span>
        </div>
      </div>
    </div>
  );
}
