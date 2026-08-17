'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface CommandRecord {
  command: string;
  output: React.ReactNode;
  isError?: boolean;
}

const fileSystem: Record<string, any> = {
  'about.txt': 'Rohit Pancholi - Frontend Engineer\nPassionate about creating beautiful, intuitive, and highly functional user interfaces.',
  'skills.txt': 'Frameworks: React, Next.js, Vue\nLanguages: TypeScript, JavaScript, HTML, CSS\nTools: Tailwind CSS, Framer Motion, Git',
  'contact.txt': 'Email: contact@rohitpancholi.com\nGitHub: github.com/rohitpancholi\nLinkedIn: linkedin.com/in/rohitpancholi',
  'projects': {
    'portfolio.txt': 'macOS-style Portfolio built with Next.js, React, and Tailwind.',
    'format-factory.txt': 'In-browser media converter using FFmpeg WASM.',
    'compressor.txt': 'Smart image and video compressor tool.',
    'global-exchange.txt': 'Real-time multi-asset currency and metal converter.'
  }
};

export default function Terminal() {
  const { themeMode } = useSettingsStore();
  const isLight = themeMode === 'light';
  
  const [history, setHistory] = useState<CommandRecord[]>([
    { 
      command: '', 
      output: 'Welcome to Rohit OS v1.0.0.\nType "help" to see available commands.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [currentDir, setCurrentDir] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const getPrompt = () => {
    const dir = currentDir.length > 0 ? `~/${currentDir.join('/')}` : '~';
    return `rohit@portfolio:${dir}$ `;
  };

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();
      setInput('');
      
      if (!cmd) {
        setHistory(prev => [...prev, { command: cmd, output: '' }]);
        return;
      }
      
      const args = cmd.split(' ').filter(Boolean);
      const program = args[0].toLowerCase();
      
      let output: React.ReactNode = '';
      let isError = false;

      let currentDirObj = fileSystem;
      for (const dir of currentDir) {
        currentDirObj = currentDirObj[dir];
      }
      
      switch (program) {
        case 'help':
          output = (
            <div className="grid grid-cols-2 gap-x-4 max-w-sm">
              <span className="font-bold">help</span><span>Show this message</span>
              <span className="font-bold">whoami</span><span>Display current user info</span>
              <span className="font-bold">clear</span><span>Clear the terminal screen</span>
              <span className="font-bold">ls</span><span>List directory contents</span>
              <span className="font-bold">cd</span><span>Change directory</span>
              <span className="font-bold">cat</span><span>Concatenate and print files</span>
              <span className="font-bold">date</span><span>Print system date</span>
              <span className="font-bold">echo</span><span>Print arguments</span>
            </div>
          );
          break;
        case 'whoami':
          output = 'rohitpancholi - Frontend Engineer';
          break;
        case 'clear':
          setHistory([]);
          return;
        case 'date':
          output = new Date().toString();
          break;
        case 'echo':
          output = args.slice(1).join(' ');
          break;
        case 'ls':
          const keys = Object.keys(currentDirObj);
          if (keys.length === 0) {
            output = '';
          } else {
            output = (
              <div className="flex flex-wrap gap-4">
                {Object.entries(currentDirObj).map(([key, val]) => (
                  <span key={key} className={typeof val === 'object' ? 'text-blue-500 font-bold' : ''}>
                    {key}
                  </span>
                ))}
              </div>
            );
          }
          break;
        case 'cd':
          const target = args[1];
          if (!target || target === '~' || target === '/') {
            setCurrentDir([]);
          } else if (target === '..') {
            setCurrentDir(prev => prev.slice(0, -1));
          } else if (currentDirObj[target]) {
            if (typeof currentDirObj[target] === 'object') {
              setCurrentDir(prev => [...prev, target]);
            } else {
              output = `cd: ${target}: Not a directory`;
              isError = true;
            }
          } else {
            output = `cd: ${target}: No such file or directory`;
            isError = true;
          }
          break;
        case 'cat':
          const file = args[1];
          if (!file) {
            output = 'cat: missing file operand';
            isError = true;
          } else if (currentDirObj[file]) {
            if (typeof currentDirObj[file] === 'object') {
              output = `cat: ${file}: Is a directory`;
              isError = true;
            } else {
              output = currentDirObj[file];
            }
          } else {
            output = `cat: ${file}: No such file or directory`;
            isError = true;
          }
          break;
        default:
          output = `command not found: ${program}`;
          isError = true;
      }
      
      setHistory(prev => [...prev, { command: cmd, output, isError }]);
    }
  };

  return (
    <div 
      className={`h-full w-full p-4 font-mono text-sm overflow-y-auto cursor-text ${isLight ? 'bg-white/90 text-slate-800' : 'bg-black/90 text-green-400'}`}
      onClick={() => {
        const inputEl = document.getElementById('terminal-input');
        if (inputEl) inputEl.focus();
      }}
    >
      {history.map((record, idx) => (
        <div key={idx} className="mb-2">
          {record.command !== undefined && record.command !== '' && (
            <div className="flex gap-2">
              <span className={isLight ? 'text-indigo-600 font-bold whitespace-nowrap' : 'text-green-300 font-bold whitespace-nowrap'}>{getPrompt()}</span>
              <span>{record.command}</span>
            </div>
          )}
          {record.output && (
            <div className={`whitespace-pre-wrap mt-1 ${record.isError ? 'text-red-500' : ''}`}>
              {record.output}
            </div>
          )}
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <span className={isLight ? 'text-indigo-600 font-bold whitespace-nowrap' : 'text-green-300 font-bold whitespace-nowrap'}>{getPrompt()}</span>
        <input
          id="terminal-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="flex-1 bg-transparent outline-none border-none text-inherit caret-current"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      <div ref={bottomRef} className="pb-4" />
    </div>
  );
}
