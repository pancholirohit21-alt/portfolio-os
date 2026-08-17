'use client';

import React, { useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Wrench, Braces, Search, FileDiff, Copy, CheckCircle2 } from 'lucide-react';
import * as Diff from 'diff';

type Tab = 'json' | 'regex' | 'diff';

export default function DevTools() {
  const { themeMode, accentColor } = useSettingsStore();
  const isLight = themeMode === 'light';

  const [activeTab, setActiveTab] = useState<Tab>('json');
  const [copied, setCopied] = useState(false);

  // JSON State
  const [jsonInput, setJsonInput] = useState('{\n  "hello": "world"\n}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Regex State
  const [regexPattern, setRegexPattern] = useState('[A-Za-z]+');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexText, setRegexText] = useState('Hello 123 world 456');
  const [regexError, setRegexError] = useState<string | null>(null);

  // Diff State
  const [diffOld, setDiffOld] = useState('Apple\nBanana\nOrange');
  const [diffNew, setDiffNew] = useState('Apple\nPear\nOrange');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ------------------ JSON FORMATTER ------------------
  const getFormattedJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (jsonError) setJsonError(null);
      const str = JSON.stringify(parsed, null, 2);
      
      // Simple syntax highlighting
      return str.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'text-blue-500';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-purple-500 font-medium'; // key
          } else {
            cls = 'text-green-500'; // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-orange-500 font-bold'; // boolean
        } else if (/null/.test(match)) {
          cls = 'text-red-500 font-bold'; // null
        }
        return `<span class="${cls}">${match}</span>`;
      });
    } catch (e: any) {
      if (!jsonError) setJsonError(e.message);
      return '';
    }
  };

  // ------------------ REGEX TESTER ------------------
  const getRegexHighlighted = () => {
    if (!regexPattern) return regexText;
    try {
      if (regexError) setRegexError(null);
      const re = new RegExp(regexPattern, regexFlags);
      // Split text by matches to highlight them
      let output = '';
      let lastIndex = 0;
      let match;
      
      // Avoid infinite loop on empty match with global flag
      if (re.global && re.source === '(?:)') return regexText;
      
      if (!re.global) {
        match = re.exec(regexText);
        if (match) {
          output += regexText.substring(0, match.index);
          output += `<mark class="bg-yellow-300 text-black px-0.5 rounded">${match[0]}</mark>`;
          output += regexText.substring(match.index + match[0].length);
          return output;
        }
        return regexText;
      }

      while ((match = re.exec(regexText)) !== null) {
        if (match.index === re.lastIndex) {
            re.lastIndex++; // Avoid infinite loops with zero-width matches
        }
        output += regexText.substring(lastIndex, match.index);
        output += `<mark class="bg-yellow-300 text-black px-0.5 rounded">${match[0]}</mark>`;
        lastIndex = match.index + match[0].length;
      }
      output += regexText.substring(lastIndex);
      return output;
    } catch (e: any) {
      if (!regexError) setRegexError(e.message);
      return regexText;
    }
  };

  // ------------------ DIFF TOOL ------------------
  const getDiffOutput = () => {
    const diff = Diff.diffLines(diffOld, diffNew);
    return diff.map((part, index) => {
      let bgColor = 'bg-transparent';
      let textColor = isLight ? 'text-slate-800' : 'text-slate-200';
      let symbol = ' ';
      
      if (part.added) {
        bgColor = isLight ? 'bg-green-100' : 'bg-green-900/30';
        textColor = isLight ? 'text-green-800' : 'text-green-300';
        symbol = '+';
      } else if (part.removed) {
        bgColor = isLight ? 'bg-red-100' : 'bg-red-900/30';
        textColor = isLight ? 'text-red-800' : 'text-red-300';
        symbol = '-';
      }

      return (
        <div key={index} className={`flex px-2 ${bgColor} ${textColor} font-mono text-sm leading-relaxed whitespace-pre-wrap`}>
          <span className="opacity-50 select-none mr-4 w-4 text-center">{symbol}</span>
          <span>{part.value}</span>
        </div>
      );
    });
  };

  return (
    <div className={`flex flex-col h-full w-full ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-white'}`}>
      
      {/* Header */}
      <div className={`px-6 py-4 border-b flex-shrink-0 flex items-center justify-between
        ${isLight ? 'bg-white border-slate-200' : 'bg-[#151c2c] border-white/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${accentColor} text-white shadow-lg`}>
            <Wrench size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">DevTools</h1>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Developer Utilities Suite</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className={`flex p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/30 border-white/10'}`}>
          <button 
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all
              ${activeTab === 'json' ? (isLight ? 'bg-white shadow' : 'bg-slate-700 shadow') : 'opacity-60 hover:opacity-100'}`}
          >
            <Braces size={16} /> JSON
          </button>
          <button 
            onClick={() => setActiveTab('regex')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all
              ${activeTab === 'regex' ? (isLight ? 'bg-white shadow' : 'bg-slate-700 shadow') : 'opacity-60 hover:opacity-100'}`}
          >
            <Search size={16} /> Regex
          </button>
          <button 
            onClick={() => setActiveTab('diff')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all
              ${activeTab === 'diff' ? (isLight ? 'bg-white shadow' : 'bg-slate-700 shadow') : 'opacity-60 hover:opacity-100'}`}
          >
            <FileDiff size={16} /> Diff
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* JSON TAB */}
        {activeTab === 'json' && (
          <div className="flex h-full">
            <div className={`w-1/2 p-4 border-r flex flex-col ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <div className="font-bold text-xs uppercase tracking-wider mb-2 opacity-50">Input (Raw JSON)</div>
              <textarea 
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className={`flex-1 w-full p-4 font-mono text-sm resize-none rounded-xl border focus:outline-none focus:ring-2
                  ${isLight ? 'bg-white border-slate-300 focus:ring-blue-500/20' : 'bg-black/20 border-white/10 focus:ring-blue-500/50'}`}
                spellCheck={false}
              />
            </div>
            <div className={`w-1/2 p-4 flex flex-col ${isLight ? 'bg-slate-100/50' : 'bg-black/10'}`}>
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold text-xs uppercase tracking-wider opacity-50">Output (Formatted)</div>
                <button 
                  onClick={() => {
                    try { copyToClipboard(JSON.stringify(JSON.parse(jsonInput), null, 2)); } catch(e){}
                  }}
                  className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded border transition-colors
                    ${copied ? 'text-green-500 border-green-500/30 bg-green-500/10' : (isLight ? 'text-slate-500 hover:bg-slate-200 border-slate-300' : 'text-slate-400 hover:bg-white/10 border-white/20')}`}
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className={`flex-1 w-full p-4 rounded-xl border overflow-auto font-mono text-sm leading-relaxed
                ${isLight ? 'bg-white border-slate-300' : 'bg-[#1e1e1e] border-white/10'}`}>
                {!jsonInput.trim() ? (
                  <div className="flex items-center justify-center h-full text-slate-400 font-bold opacity-50">
                    Paste JSON on the left to format
                  </div>
                ) : jsonError ? (
                  <div className="text-red-500 font-bold whitespace-pre-wrap flex items-start gap-2">
                    <span className="mt-0.5">⚠️</span> 
                    <div>
                      <div className="mb-1 uppercase tracking-wide text-xs">Invalid JSON Syntax</div>
                      <div className="font-normal opacity-80">{jsonError}</div>
                    </div>
                  </div>
                ) : (
                  <pre dangerouslySetInnerHTML={{ __html: getFormattedJson() }}></pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REGEX TAB */}
        {activeTab === 'regex' && (
          <div className="flex flex-col h-full p-6 space-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-xs uppercase tracking-wider opacity-50">Regular Expression</label>
              <div className="flex gap-2">
                <div className={`flex items-center px-4 rounded-xl border flex-1 shadow-sm
                  ${isLight ? 'bg-white border-slate-300' : 'bg-black/20 border-white/10'}`}>
                  <span className="text-slate-400 font-bold text-lg">/</span>
                  <input 
                    type="text" 
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none px-2 py-3 font-mono text-sm"
                    spellCheck={false}
                  />
                  <span className="text-slate-400 font-bold text-lg">/</span>
                </div>
                <input 
                  type="text" 
                  value={regexFlags}
                  onChange={(e) => setRegexFlags(e.target.value)}
                  placeholder="gmi"
                  className={`w-20 px-4 rounded-xl border shadow-sm font-mono text-sm outline-none focus:ring-2
                    ${isLight ? 'bg-white border-slate-300' : 'bg-black/20 border-white/10'}`}
                />
              </div>
              {regexError && <span className="text-red-500 text-xs font-bold">{regexError}</span>}
            </div>

            <div className="flex gap-6 h-full min-h-0">
              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <label className="font-bold text-xs uppercase tracking-wider opacity-50">Test String</label>
                <textarea 
                  value={regexText}
                  onChange={(e) => setRegexText(e.target.value)}
                  className={`flex-1 p-4 rounded-xl border font-mono text-sm resize-none outline-none focus:ring-2
                    ${isLight ? 'bg-white border-slate-300 focus:ring-blue-500/20' : 'bg-black/20 border-white/10 focus:ring-blue-500/50'}`}
                  spellCheck={false}
                />
              </div>
              
              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <label className="font-bold text-xs uppercase tracking-wider opacity-50">Matches</label>
                <div className={`flex-1 p-4 rounded-xl border font-mono text-sm overflow-auto whitespace-pre-wrap leading-relaxed shadow-inner
                  ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#1e1e1e] border-white/10'}`}>
                  {regexError ? (
                    <div className="text-red-500 font-bold flex items-center gap-2">⚠️ Invalid Regular Expression</div>
                  ) : !regexPattern.trim() ? (
                    <div className="text-slate-400 font-bold opacity-50 h-full flex items-center justify-center">Enter a pattern above</div>
                  ) : !regexText.trim() ? (
                    <div className="text-slate-400 font-bold opacity-50 h-full flex items-center justify-center">Enter test string to see matches</div>
                  ) : getRegexHighlighted() === regexText ? (
                    <div className="text-orange-500 font-bold opacity-80 h-full flex items-center justify-center">No matches found</div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: getRegexHighlighted() }}></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DIFF TAB */}
        {activeTab === 'diff' && (
          <div className="flex flex-col h-full">
            <div className="flex h-1/2 p-6 pb-3 gap-6">
              <div className="flex-1 flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-50">Original Text</label>
                <textarea 
                  value={diffOld}
                  onChange={(e) => setDiffOld(e.target.value)}
                  className={`flex-1 p-4 rounded-xl border font-mono text-sm resize-none outline-none focus:ring-2
                    ${isLight ? 'bg-white border-slate-300 focus:ring-red-500/20' : 'bg-black/20 border-white/10 focus:ring-red-500/50'}`}
                  spellCheck={false}
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-50">Modified Text</label>
                <textarea 
                  value={diffNew}
                  onChange={(e) => setDiffNew(e.target.value)}
                  className={`flex-1 p-4 rounded-xl border font-mono text-sm resize-none outline-none focus:ring-2
                    ${isLight ? 'bg-white border-slate-300 focus:ring-green-500/20' : 'bg-black/20 border-white/10 focus:ring-green-500/50'}`}
                  spellCheck={false}
                />
              </div>
            </div>
            
            <div className="h-1/2 p-6 pt-3 flex flex-col gap-2">
              <label className="font-bold text-xs uppercase tracking-wider opacity-50">Diff Result</label>
              <div className={`flex-1 rounded-xl border overflow-auto py-4 shadow-inner
                ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#1e1e1e] border-white/10'}`}>
                {!diffOld.trim() && !diffNew.trim() ? (
                  <div className="h-full flex items-center justify-center text-slate-400 font-bold opacity-50">
                    Enter text in both fields to compare
                  </div>
                ) : diffOld === diffNew ? (
                  <div className="h-full flex items-center justify-center text-green-500 font-bold opacity-80">
                    ✓ Texts are identical. No differences found.
                  </div>
                ) : (
                  getDiffOutput()
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
