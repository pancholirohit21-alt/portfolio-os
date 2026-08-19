'use client';
import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { MousePointer2, Maximize2, XCircle, MinusCircle, PlusCircle, Settings as SettingsIcon, GripHorizontal, ArrowRight, Music } from 'lucide-react';

const GUIDE_SECTIONS = [
  {
    title: 'Opening Apps',
    icon: MousePointer2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    content: (
      <p>
        Just like a real computer, you can open apps by clicking their icons. Look for the <strong>Dock</strong> at the bottom of the screen, or click on the <strong>Desktop icons</strong>. You can also right-click on the desktop to find quick links!
      </p>
    )
  },
  {
    title: 'Managing Windows',
    icon: Maximize2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    content: (
      <div className="space-y-3">
        <p>At the top left of every app window, you will see three colored dots. These are your window controls:</p>
        <ul className="space-y-2 ml-2">
          <li className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center"><XCircle size={10} className="text-black/50" /></span>
            <strong>Red:</strong> Closes the app completely.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center"><MinusCircle size={10} className="text-black/50" /></span>
            <strong>Yellow:</strong> Minimizes the app to the Dock so you can open it later.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center"><PlusCircle size={10} className="text-black/50" /></span>
            <strong>Green:</strong> Maximizes the app to fill the entire screen.
          </li>
        </ul>
      </div>
    )
  },
  {
    title: 'Moving & Dragging',
    icon: GripHorizontal,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    content: (
      <p>
        Need to see something underneath an app? You can <strong>click and hold the title bar</strong> (the top part of the window next to the colored dots) and drag the window anywhere on your screen.
      </p>
    )
  },
  {
    title: 'Right-Click Menu',
    icon: MousePointer2,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    content: (
      <p>
        Try <strong>right-clicking</strong> anywhere on the empty desktop wallpaper. A menu will appear allowing you to quickly open Settings, change themes, or refresh the page.
      </p>
    )
  },
  {
    title: 'Personalization',
    icon: SettingsIcon,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    content: (
      <p>
        Want to make it yours? Open the <strong>Settings app</strong> to switch between Dark Mode and Light Mode, choose a new HD wallpaper, or pick a vibrant custom accent color for the whole system!
      </p>
    )
  },
  {
    title: 'Media & Entertainment',
    icon: Music,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    content: (
      <p>
        Need to focus or relax? Open the <strong>Music Player</strong> to listen to curated YouTube playlists in the background. You can also use the <strong>Compressor</strong> to quickly reduce the size of your images, videos, and audio files right in the browser!
      </p>
    )
  }
];

export default function Help() {
  const { themeMode } = useSettingsStore();
  const isLight = themeMode === 'light';

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#0d1117] text-slate-200'}`}>
      
      {/* Header */}
      <div className={`px-6 py-5 border-b flex-shrink-0 flex items-center gap-3 ${isLight ? 'bg-white border-slate-200' : 'bg-black/20 border-white/10'}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg text-white">
          <span className="text-2xl font-serif italic">?</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Help Center</h1>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>A quick guide to using Portfolio OS</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">New to macOS-style interfaces?</h2>
            <p className={`${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Don't worry! Here is a simple guide to help you navigate around like a pro.</p>
          </div>

          <div className="space-y-6">
            {GUIDE_SECTIONS.map((section, idx) => (
              <div 
                key={idx} 
                className={`p-6 rounded-2xl border transition-all hover:shadow-md
                  ${isLight ? 'bg-white border-slate-200 hover:border-blue-200' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
              >
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${section.bgColor} ${section.color}`}>
                    <section.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      {section.title}
                    </h3>
                    <div className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {section.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-8 p-6 rounded-2xl border flex items-center justify-between
            ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-blue-900/20 border-blue-800/30'}`}
          >
            <div>
              <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-1">Ready to explore?</h4>
              <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Close this window and start clicking around!</p>
            </div>
            <ArrowRight className="text-blue-500" />
          </div>

        </div>
      </div>
    </div>
  );
}
