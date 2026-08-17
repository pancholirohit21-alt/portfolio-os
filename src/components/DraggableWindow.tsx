'use client';
import { motion } from 'framer-motion';
import { useWindowStore, AppId } from '@/store/useWindowStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import React, { useEffect, useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface Props {
  id: AppId;
  children: React.ReactNode;
  defaultWidth?: number | string;
  defaultHeight?: number | string;
}

export default function DraggableWindow({ id, children, defaultWidth = 750, defaultHeight = 500 }: Props) {
  const windowState = useWindowStore((state) => state.windows[id]);
  const { closeApp, minimizeApp, maximizeApp, focusApp } = useWindowStore();
  const { themeMode, taskbarVisible } = useSettingsStore();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !windowState || !windowState.isOpen || windowState.isMinimized) return null;

  const isLight = themeMode === 'light';

  return (
    <motion.div
      drag={!windowState.isMaximized}
      dragMomentum={false}
      onMouseDown={() => focusApp(id)}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: 0,
        width: windowState.isMaximized ? '100vw' : defaultWidth,
        height: windowState.isMaximized ? (taskbarVisible ? 'calc(100vh - 110px)' : '100vh') : defaultHeight,
        top: windowState.isMaximized ? 0 : '10%',
        left: windowState.isMaximized ? 0 : '20%',
      }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      style={{ zIndex: windowState.zIndex }}
      className={`absolute flex flex-col overflow-hidden backdrop-blur-[40px] transition-colors
      ${isLight 
        ? 'bg-white/40 border border-white/60 shadow-[0_30px_60px_rgba(0,0,0,0.12)]' 
        : 'bg-white/10 border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.1)]'}
      ${windowState.isMaximized ? 'rounded-none' : 'rounded-2xl'}`}
    >
      {/* Premium Mac-style Title Bar */}
      <div 
        className={`h-12 flex items-center justify-between px-4 transition-colors
        ${isLight ? 'bg-white/20' : 'bg-white/[0.02]'}
        ${windowState.isMaximized ? '' : 'cursor-grab active:cursor-grabbing'}`}
        onPointerDown={(e) => focusApp(id)}
      >
        <div className="flex space-x-2 w-20 group">
          <button title="Close" onClick={(e) => { e.stopPropagation(); closeApp(id); }} className="w-4 h-4 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:bg-[#ff5f56]/80 flex items-center justify-center shadow-inner relative text-black/70">
            <X size={10} className="opacity-0 group-hover:opacity-100 transition-opacity stroke-[3]" />
          </button>
          <button title="Minimize" onClick={(e) => { e.stopPropagation(); minimizeApp(id); }} className="w-4 h-4 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:bg-[#ffbd2e]/80 flex items-center justify-center shadow-inner relative text-black/70">
            <Minus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity stroke-[3]" />
          </button>
          <button title="Maximize" onClick={(e) => { e.stopPropagation(); maximizeApp(id); }} className="w-4 h-4 rounded-full bg-[#27c93f] border border-[#1aab29] hover:bg-[#27c93f]/80 flex items-center justify-center shadow-inner relative text-black/60">
            {windowState.isMaximized 
              ? <Minus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity stroke-[3]" /> 
              : <Plus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity stroke-[3]" />}
          </button>
        </div>
        <div className={`text-xs font-bold tracking-[0.2em] select-none flex-1 text-center pr-20 uppercase transition-colors
          ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
          {windowState.title}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto relative rounded-b-2xl">
        {children}
      </div>
    </motion.div>
  );
}
