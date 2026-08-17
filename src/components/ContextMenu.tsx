'use client';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWindowStore, AppId } from '@/store/useWindowStore';
import { Terminal, Settings as SettingsIcon, Bot, Languages, Newspaper, FileText } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export default function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const { themeMode } = useSettingsStore();
  const { openApp } = useWindowStore();
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isLight = themeMode === 'light';

  // Ensure menu stays within screen bounds
  let adjustedX = x;
  let adjustedY = y;
  
  if (typeof window !== 'undefined') {
    const menuWidth = 220; // approximate width
    const menuHeight = 280; // approximate height
    
    if (x + menuWidth > window.innerWidth) {
      adjustedX = window.innerWidth - menuWidth - 10;
    }
    
    if (y + menuHeight > window.innerHeight) {
      adjustedY = window.innerHeight - menuHeight - 10;
    }
  }

  const handleOpenApp = (id: AppId, title: string) => {
    openApp(id, title);
    onClose();
  };

  return (
    <div 
      ref={menuRef}
      className={`absolute z-[99999] w-56 rounded-xl shadow-2xl overflow-hidden backdrop-blur-2xl border transition-colors animate-in fade-in zoom-in-95 duration-150 ${isLight ? 'bg-white/70 border-slate-200/50' : 'bg-slate-900/70 border-white/10'}`}
      style={{ left: adjustedX, top: adjustedY }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="p-1.5 flex flex-col">
        <div className={`px-2 py-1.5 mb-1 text-xs font-semibold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          Applications
        </div>
        
        <ContextMenuItem 
          icon={<Bot className="w-4 h-4" />} 
          label="Virtual Rohit" 
          onClick={() => handleOpenApp('chatbot', 'Virtual Rohit')}
          isLight={isLight}
        />
        <ContextMenuItem 
          icon={<SettingsIcon className="w-4 h-4" />} 
          label="Change Wallpaper" 
          onClick={() => handleOpenApp('settings', 'Settings')}
          isLight={isLight}
        />
        <ContextMenuItem 
          icon={<Terminal className="w-4 h-4" />} 
          label="Open Terminal" 
          onClick={() => handleOpenApp('terminal', 'Terminal')}
          isLight={isLight}
        />
        <ContextMenuItem 
          icon={<Languages className="w-4 h-4" />} 
          label="AI Translator" 
          onClick={() => handleOpenApp('translator', 'AI Translator')}
          isLight={isLight}
        />
        <ContextMenuItem 
          icon={<Newspaper className="w-4 h-4" />} 
          label="Daily Hub" 
          onClick={() => handleOpenApp('dailyhub', 'Daily Hub')}
          isLight={isLight}
        />
        <ContextMenuItem 
          icon={<FileText className="w-4 h-4" />} 
          label="Resume" 
          onClick={() => handleOpenApp('resume', 'Resume.pdf')}
          isLight={isLight}
        />
      </div>
    </div>
  );
}

function ContextMenuItem({ icon, label, onClick, isLight }: { icon: React.ReactNode, label: string, onClick: () => void, isLight: boolean }) {
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors cursor-default ${isLight ? 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
    >
      <span className="mr-3 opacity-70">{icon}</span>
      <span className="font-medium tracking-wide">{label}</span>
    </button>
  );
}
