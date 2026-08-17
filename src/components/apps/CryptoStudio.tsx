'use client';

import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ShieldCheck, Lock, Hash, KeyRound, FileJson, Copy, CheckCircle2 } from 'lucide-react';
import CryptoJS from 'crypto-js';
import zxcvbn from 'zxcvbn';

type Tab = 'encrypt' | 'hash' | 'password' | 'jwt';
type EncryptMode = 'base64' | 'aes';

export default function CryptoStudio() {
  const { themeMode, accentColor } = useSettingsStore();
  const isLight = themeMode === 'light';

  const [activeTab, setActiveTab] = useState<Tab>('encrypt');
  const [copied, setCopied] = useState(false);

  // --- ENCRYPTION STATE ---
  const [encryptMode, setEncryptMode] = useState<EncryptMode>('aes');
  const [secretKey, setSecretKey] = useState('supersecret123');
  const [encryptInput, setEncryptInput] = useState('Hello World');
  const [encryptOutput, setEncryptOutput] = useState('');
  const [encryptAction, setEncryptAction] = useState<'encrypt' | 'decrypt'>('encrypt');

  // --- HASH STATE ---
  const [hashInput, setHashInput] = useState('Hello World');

  // --- PASSWORD STATE ---
  const [passwordInput, setPasswordInput] = useState('password123');

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*-=_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < 16; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setPasswordInput(retVal);
  };

  // --- JWT STATE ---
  const [jwtInput, setJwtInput] = useState('');
  const [jwtHeader, setJwtHeader] = useState('');
  const [jwtPayload, setJwtPayload] = useState('');
  const [jwtError, setJwtError] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run Encryption
  useEffect(() => {
    if (!encryptInput) {
      setEncryptOutput('');
      return;
    }
    try {
      if (encryptMode === 'base64') {
        if (encryptAction === 'encrypt') setEncryptOutput(btoa(encryptInput));
        else setEncryptOutput(atob(encryptInput));
      } else {
        if (!secretKey) {
          setEncryptOutput('Please enter a secret key for AES-256.');
          return;
        }
        if (encryptAction === 'encrypt') {
          setEncryptOutput(CryptoJS.AES.encrypt(encryptInput, secretKey).toString());
        } else {
          const bytes = CryptoJS.AES.decrypt(encryptInput, secretKey);
          const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
          if (!decryptedText && encryptInput) throw new Error("Invalid key or corrupted data");
          setEncryptOutput(decryptedText);
        }
      }
    } catch (e) {
      setEncryptOutput('Decryption Failed. Invalid input or wrong secret key.');
    }
  }, [encryptInput, encryptMode, secretKey, encryptAction]);

  // Run Password Analysis
  const pwdAnalysis = passwordInput ? zxcvbn(passwordInput) : null;
  const pwdScore = pwdAnalysis ? pwdAnalysis.score + 1 : 0; // Convert 0-4 to 1-5
  const pwdLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const pwdColors = [
    'text-red-500 bg-red-500/10 border-red-500/20',
    'text-orange-500 bg-orange-500/10 border-orange-500/20',
    'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    'text-blue-500 bg-blue-500/10 border-blue-500/20',
    'text-green-500 bg-green-500/10 border-green-500/20'
  ];

  // Run JWT Parsing
  useEffect(() => {
    if (!jwtInput.trim()) {
      setJwtHeader('');
      setJwtPayload('');
      setJwtError(null);
      return;
    }
    try {
      const parts = jwtInput.split('.');
      if (parts.length !== 3) throw new Error("Invalid JWT format. Must have 3 parts.");
      const headerStr = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
      const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      setJwtHeader(JSON.stringify(JSON.parse(headerStr), null, 2));
      setJwtPayload(JSON.stringify(JSON.parse(payloadStr), null, 2));
      setJwtError(null);
    } catch (e: any) {
      setJwtError(e.message || "Failed to decode token");
      setJwtHeader('');
      setJwtPayload('');
    }
  }, [jwtInput]);

  return (
    <div className={`flex flex-col h-full w-full ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-white'}`}>
      
      {/* Header */}
      <div className={`px-6 py-4 border-b flex-shrink-0 flex items-center justify-between
        ${isLight ? 'bg-white border-slate-200' : 'bg-[#151c2c] border-white/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${accentColor} text-white shadow-lg`}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Password Hub</h1>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Security & Cryptography Suite</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className={`flex p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/30 border-white/10'}`}>
          <button 
            onClick={() => setActiveTab('encrypt')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all
              ${activeTab === 'encrypt' ? (isLight ? 'bg-white shadow' : 'bg-slate-700 shadow') : 'opacity-60 hover:opacity-100'}`}
          >
            <Lock size={16} /> Encrypt
          </button>
          <button 
            onClick={() => setActiveTab('hash')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all
              ${activeTab === 'hash' ? (isLight ? 'bg-white shadow' : 'bg-slate-700 shadow') : 'opacity-60 hover:opacity-100'}`}
          >
            <Hash size={16} /> Hashes
          </button>
          <button 
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all
              ${activeTab === 'password' ? (isLight ? 'bg-white shadow' : 'bg-slate-700 shadow') : 'opacity-60 hover:opacity-100'}`}
          >
            <KeyRound size={16} /> Password
          </button>
          <button 
            onClick={() => setActiveTab('jwt')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all
              ${activeTab === 'jwt' ? (isLight ? 'bg-white shadow' : 'bg-slate-700 shadow') : 'opacity-60 hover:opacity-100'}`}
          >
            <FileJson size={16} /> JWT
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* ENCRYPT TAB */}
        {activeTab === 'encrypt' && (
          <div className="flex flex-col h-full p-6 space-y-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="font-bold text-xs uppercase tracking-wider opacity-50 mb-2 block">Algorithm Mode</label>
                <div className={`flex p-1 rounded-xl border inline-flex ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/30 border-white/10'}`}>
                  <button 
                    onClick={() => setEncryptMode('aes')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                      ${encryptMode === 'aes' ? 'bg-blue-500 text-white shadow' : 'opacity-60 hover:opacity-100'}`}
                  >AES-256 (Secure)</button>
                  <button 
                    onClick={() => setEncryptMode('base64')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                      ${encryptMode === 'base64' ? 'bg-purple-500 text-white shadow' : 'opacity-60 hover:opacity-100'}`}
                  >Base64 (Standard)</button>
                </div>
              </div>
              <div className="flex-1">
                <label className="font-bold text-xs uppercase tracking-wider opacity-50 mb-2 block">Action</label>
                <div className={`flex p-1 rounded-xl border inline-flex ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/30 border-white/10'}`}>
                  <button 
                    onClick={() => setEncryptAction('encrypt')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                      ${encryptAction === 'encrypt' ? (isLight ? 'bg-white shadow' : 'bg-slate-700 shadow') : 'opacity-60 hover:opacity-100'}`}
                  >Encrypt</button>
                  <button 
                    onClick={() => setEncryptAction('decrypt')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                      ${encryptAction === 'decrypt' ? (isLight ? 'bg-white shadow' : 'bg-slate-700 shadow') : 'opacity-60 hover:opacity-100'}`}
                  >Decrypt</button>
                </div>
              </div>
            </div>

            {encryptMode === 'aes' && (
              <div>
                <label className="font-bold text-xs uppercase tracking-wider opacity-50 mb-2 block">Secret Key (Password)</label>
                <input 
                  type="text" 
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter a strong secret key..."
                  className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-2 font-mono text-sm
                    ${isLight ? 'bg-white border-slate-300 focus:ring-blue-500/20' : 'bg-black/20 border-white/10 focus:ring-blue-500/50'}`}
                />
              </div>
            )}

            <div className="flex gap-6 h-full min-h-0">
              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <label className="font-bold text-xs uppercase tracking-wider opacity-50 block">Input Text</label>
                <textarea 
                  value={encryptInput}
                  onChange={(e) => setEncryptInput(e.target.value)}
                  className={`flex-1 p-4 rounded-xl border font-mono text-sm resize-none outline-none focus:ring-2
                    ${isLight ? 'bg-white border-slate-300 focus:ring-blue-500/20' : 'bg-black/20 border-white/10 focus:ring-blue-500/50'}`}
                  spellCheck={false}
                />
              </div>
              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-xs uppercase tracking-wider opacity-50 block">Output Text</label>
                  <button 
                    onClick={() => copyToClipboard(encryptOutput)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded border transition-colors
                      ${copied ? 'text-green-500 border-green-500/30 bg-green-500/10' : (isLight ? 'text-slate-500 hover:bg-slate-200 border-slate-300' : 'text-slate-400 hover:bg-white/10 border-white/20')}`}
                  >
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />} Copy
                  </button>
                </div>
                <div className={`flex-1 p-4 rounded-xl border font-mono text-sm overflow-auto whitespace-pre-wrap break-all shadow-inner
                  ${isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#1e1e1e] border-white/10 text-slate-200'}`}>
                  {encryptOutput}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HASH TAB */}
        {activeTab === 'hash' && (
          <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="font-bold text-xs uppercase tracking-wider opacity-50 block">String to Hash</label>
              <textarea 
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                className={`w-full h-24 p-4 rounded-xl border font-mono text-sm resize-none outline-none focus:ring-2
                  ${isLight ? 'bg-white border-slate-300 focus:ring-blue-500/20' : 'bg-black/20 border-white/10 focus:ring-blue-500/50'}`}
                spellCheck={false}
              />
            </div>
            
            <div className="flex-1 space-y-4">
              {[
                { label: 'MD5', val: hashInput ? CryptoJS.MD5(hashInput).toString() : '' },
                { label: 'SHA-1', val: hashInput ? CryptoJS.SHA1(hashInput).toString() : '' },
                { label: 'SHA-256', val: hashInput ? CryptoJS.SHA256(hashInput).toString() : '' },
                { label: 'SHA-512', val: hashInput ? CryptoJS.SHA512(hashInput).toString() : '' }
              ].map(h => (
                <div key={h.label} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs uppercase tracking-wider opacity-50">{h.label}</span>
                  </div>
                  <div className={`w-full p-3 rounded-xl border font-mono text-sm break-all
                    ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/40 border-white/10 text-slate-300'}`}>
                    {h.val || <span className="opacity-30">Waiting for input...</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASSWORD TAB */}
        {activeTab === 'password' && (
          <div className="flex flex-col h-full p-8 items-center max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2 w-full mt-4">
              <h2 className="text-2xl font-extrabold">Password Strength Analyzer</h2>
              <p className="opacity-60 text-sm">Test a password's resilience against brute-force attacks.</p>
            </div>
            
            <div className="w-full relative">
              <input 
                type="text" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Type a password..."
                className={`w-full p-5 pr-40 rounded-2xl border-2 text-xl focus:outline-none transition-colors
                  ${isLight ? 'bg-white border-slate-300 focus:border-blue-500' : 'bg-black/20 border-white/10 focus:border-blue-500'}`}
              />
              <button 
                onClick={generatePassword}
                className={`absolute right-3 top-3 bottom-3 px-4 rounded-xl text-sm font-bold transition-colors
                  ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                Auto-Generate
              </button>
            </div>

            {pwdAnalysis && passwordInput ? (
              <div className="w-full space-y-8">
                <div className="flex justify-center">
                  <div className={`px-8 py-4 rounded-2xl border-2 flex flex-col items-center gap-1 ${pwdColors[pwdScore - 1]}`}>
                    <span className="text-5xl font-black">{pwdScore} <span className="text-2xl opacity-50">/ 5</span></span>
                    <span className="font-bold uppercase tracking-widest text-sm">{pwdLabels[pwdScore - 1]}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-black/20 border-white/10'}`}>
                    <div className="text-xs font-bold uppercase opacity-50 mb-1">Crack Time (Offline)</div>
                    <div className="text-lg font-bold">{pwdAnalysis.crack_times_display.offline_fast_hashing_1e10_per_second}</div>
                  </div>
                  <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-black/20 border-white/10'}`}>
                    <div className="text-xs font-bold uppercase opacity-50 mb-1">Crack Time (Online)</div>
                    <div className="text-lg font-bold">{pwdAnalysis.crack_times_display.online_no_throttling_10_per_second}</div>
                  </div>
                </div>

                {pwdAnalysis.feedback.warning && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <div className="font-bold">Warning</div>
                      <div className="text-sm opacity-90">{pwdAnalysis.feedback.warning}</div>
                    </div>
                  </div>
                )}
                
                {pwdAnalysis.feedback.suggestions.length > 0 && (
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                      <div className="font-bold">Suggestions</div>
                      <ul className="text-sm opacity-90 list-disc list-inside">
                        {pwdAnalysis.feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="opacity-30 font-bold text-xl mt-10">Enter a password to begin</div>
            )}
          </div>
        )}

        {/* JWT TAB */}
        {activeTab === 'jwt' && (
          <div className="flex flex-col h-full">
            <div className={`h-1/3 p-6 border-b flex flex-col gap-2 ${isLight ? 'bg-white border-slate-200' : 'bg-transparent border-white/10'}`}>
              <label className="font-bold text-xs uppercase tracking-wider opacity-50 block">Encoded JWT Token</label>
              <textarea 
                value={jwtInput}
                onChange={(e) => setJwtInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                className={`flex-1 w-full p-4 rounded-xl border font-mono text-sm resize-none outline-none focus:ring-2 break-all leading-relaxed
                  ${isLight ? 'bg-slate-50 border-slate-300 focus:ring-blue-500/20' : 'bg-black/20 border-white/10 focus:ring-blue-500/50'}`}
                spellCheck={false}
              />
            </div>
            
            <div className="h-2/3 p-6 flex flex-col gap-4">
              {jwtError ? (
                <div className="h-full flex items-center justify-center text-red-500 font-bold gap-2">
                  <span>⚠️</span> {jwtError}
                </div>
              ) : !jwtInput ? (
                <div className="h-full flex items-center justify-center text-slate-400 opacity-50 font-bold">
                  Paste a JWT above to decode it
                </div>
              ) : (
                <div className="flex gap-6 h-full min-h-0">
                  <div className="flex-1 flex flex-col gap-2 min-h-0">
                    <label className="font-bold text-xs uppercase tracking-wider text-purple-500 block">Header</label>
                    <div className={`flex-1 rounded-xl border overflow-auto p-4 font-mono text-sm shadow-inner text-purple-500
                      ${isLight ? 'bg-purple-50 border-purple-200' : 'bg-purple-900/10 border-purple-500/30'}`}>
                      <pre>{jwtHeader}</pre>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2 min-h-0">
                    <label className="font-bold text-xs uppercase tracking-wider text-blue-500 block">Payload</label>
                    <div className={`flex-1 rounded-xl border overflow-auto p-4 font-mono text-sm shadow-inner text-blue-500
                      ${isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/10 border-blue-500/30'}`}>
                      <pre>{jwtPayload}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
