'use client';
import { useSettingsStore, ThemeMode } from '@/store/useSettingsStore';
import { Monitor, Moon, Sun, Palette } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export const ACCENT_COLORS = [
  { name: 'Midnight Purple', class: 'from-indigo-500/80 to-purple-500/80', dot: 'bg-purple-500' },
  { name: 'Emerald Hack', class: 'from-emerald-500/80 to-teal-500/80', dot: 'bg-emerald-500' },
  { name: 'Ocean Blue', class: 'from-blue-500/80 to-cyan-500/80', dot: 'bg-blue-500' },
  { name: 'Sunset Orange', class: 'from-orange-500/80 to-red-500/80', dot: 'bg-orange-500' },
  { name: 'Rose Gold', class: 'from-rose-400/80 to-pink-500/80', dot: 'bg-pink-400' },
  { name: 'Neon Pink', class: 'from-fuchsia-600/80 to-pink-600/80', dot: 'bg-fuchsia-500' },
  { name: 'Lime Green', class: 'from-lime-400/80 to-green-500/80', dot: 'bg-lime-400' },
  { name: 'Deep Crimson', class: 'from-red-600/80 to-rose-700/80', dot: 'bg-red-600' },
  { name: 'Electric Yellow', class: 'from-yellow-400/80 to-amber-500/80', dot: 'bg-yellow-400' },
  { name: 'Slate Monochrome', class: 'from-slate-500/80 to-slate-700/80', dot: 'bg-slate-500' },
];

export const WALLPAPERS = [
  { id: 'macos-sequoia', name: 'Sequoia Abstract', type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' },
  { id: 'glass-waves', name: 'Glass Waves', type: 'image', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2670&auto=format&fit=crop' },
  { id: 'dark-fluid', name: 'Dark Fluid', type: 'image', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop' },
  { id: 'aurora', name: 'Animated Aurora', type: 'animated' },
  { id: 'vibrant-mesh', name: 'Vibrant Mesh', type: 'image', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop' },
  { id: 'neon-glass', name: 'Neon Glass', type: 'image', url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2564&auto=format&fit=crop' },
  { id: 'minimal', name: 'Minimalist Black', type: 'solid', bg: 'bg-black' },
  { id: 'liquid-gold', name: 'Liquid Gold', type: 'image', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2564&auto=format&fit=crop' },
  { id: 'deep-space', name: 'Deep Space', type: 'image', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2564&auto=format&fit=crop' },
];

export default function Settings() {
  const { themeMode, accentColor, wallpaper, customColorHex, setThemeMode, setAccentColor, setCustomColorHex, setWallpaper } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isLight = themeMode === 'light';

  return (
    <div className={`flex h-full w-full relative overflow-hidden flex-col md:flex-row transition-colors ${isLight ? 'bg-slate-50/90 text-slate-900' : 'bg-slate-900/90 text-white'}`}>
      
      {/* Sidebar */}
      <div className={`w-full md:w-64 border-r p-6 flex flex-col shrink-0 transition-colors ${isLight ? 'border-slate-200/50 bg-white/50' : 'border-white/10 bg-black/40'}`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Monitor className="text-indigo-500" /> Settings
        </h2>
        
        <nav className="space-y-2 text-sm font-medium">
          <button className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all ${isLight ? 'bg-indigo-100 text-indigo-700 shadow-inner' : 'bg-white/10 text-white shadow-inner'}`}>
            <Palette size={16} /> Appearance
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h3 className="text-xl font-bold mb-6">Appearance Settings</h3>
        
        {/* Theme Mode */}
        <div className="mb-10">
          <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>System Theme</p>
          <div className="flex gap-4">
            <button 
              onClick={() => setThemeMode('dark')}
              className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${!isLight ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent bg-white hover:bg-slate-100 shadow-sm'}`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-inner"><Moon size={20} /></div>
              <span className="font-semibold">Dark Mode</span>
            </button>
            <button 
              onClick={() => setThemeMode('light')}
              className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${isLight ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-transparent bg-white/10 hover:bg-white/20'}`}
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-md"><Sun size={20} /></div>
              <span className="font-semibold">Light Mode</span>
            </button>
          </div>
        </div>

        {/* Accent Color */}
        <div className="mb-10">
          <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Accent Color</p>
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map(color => (
              <button 
                key={color.name}
                onClick={() => setAccentColor(color.class)}
                className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-all 
                ${accentColor === color.class 
                  ? (isLight ? 'border-indigo-500 bg-white shadow-md scale-105' : 'border-indigo-500 bg-white/10 shadow-md scale-105') 
                  : (isLight ? 'border-transparent bg-white hover:bg-slate-100 shadow-sm' : 'border-transparent bg-black/20 hover:bg-black/30')}`}
              >
                <div className={`w-3 h-3 rounded-full ${color.dot}`}></div>
                <span className="text-sm font-medium">{color.name}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-4 flex items-center gap-3">
            <span className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Custom Color:</span>
            <input 
              type="color" 
              value={customColorHex || '#6366f1'}
              onChange={(e) => {
                setAccentColor('from-[var(--theme-accent)] to-[var(--theme-accent)]');
                setCustomColorHex(e.target.value);
              }}
              className="w-10 h-10 p-0 border-0 rounded cursor-pointer bg-transparent"
            />
            <input
               type="text"
               value={customColorHex || ''}
               placeholder="#6366f1"
               onChange={(e) => {
                 const hex = e.target.value;
                 setCustomColorHex(hex);
                 if (/^#[0-9A-F]{6}$/i.test(hex) || /^#[0-9A-F]{3}$/i.test(hex)) {
                   setAccentColor('from-[var(--theme-accent)] to-[var(--theme-accent)]');
                 }
               }}
               className={`px-3 py-2 border rounded-lg text-sm w-28 outline-none transition-colors uppercase font-mono
                ${isLight ? 'bg-white border-slate-200 focus:border-indigo-500' : 'bg-black/20 border-white/10 focus:border-indigo-500'}`}
            />
          </div>
        </div>

        {/* Wallpapers */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Desktop Wallpaper</p>
            <label className="cursor-pointer text-xs font-bold bg-indigo-500 text-white px-3 py-1.5 rounded hover:bg-indigo-600 transition-colors shadow-sm">
              Upload Custom
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setWallpaper(url);
                  }
                }}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {WALLPAPERS.map(wp => (
              <button 
                key={wp.id}
                onClick={() => setWallpaper(wp.id)}
                className={`relative h-28 rounded-xl border-2 overflow-hidden flex items-end p-3 transition-all 
                ${wallpaper === wp.id 
                  ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                  : (isLight ? 'border-transparent shadow-sm' : 'border-transparent hover:border-white/30')}`}
              >
                {wp.type === 'animated' && <div className="absolute inset-0 aurora-bg opacity-50"></div>}
                {wp.type === 'image' && <img src={wp.url} alt={wp.name} className="absolute inset-0 w-full h-full object-cover opacity-50" />}
                {wp.type === 'solid' && <div className={`absolute inset-0 ${wp.bg} opacity-80`}></div>}
                <span className="relative z-10 font-semibold text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight text-left">{wp.name}</span>
              </button>
            ))}
            {wallpaper.startsWith('blob:') && (
               <div className="relative h-28 rounded-xl border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] overflow-hidden flex items-end p-3">
                 <img src={wallpaper} alt="Custom" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                 <span className="relative z-10 font-semibold text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight text-left">Custom Upload</span>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
