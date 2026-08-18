'use client';
import { useWindowStore, AppId } from '@/store/useWindowStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Terminal, FileText, Briefcase, Video, Settings as SettingsIcon, Code2, Languages, Bot } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const getApps = (isLight: boolean) => [
  { id: 'terminal' as AppId, iconUrl: '/icons/Terminal.png?v=2', title: 'Terminal' },
  { id: 'vscode' as AppId, iconUrl: `/icons/VS_Code-${isLight ? 'light' : 'dark'}.png?v=2`, title: 'VS Code' },
  { id: 'resume' as AppId, iconUrl: `/icons/Resume-${isLight ? 'light' : 'dark'}.png?v=2`, title: 'Resume' },
  { id: 'facetime' as AppId, iconUrl: '/icons/Facetime.png?v=2', title: 'FaceTime' },
  { id: 'settings' as AppId, iconUrl: '/icons/Settings.png?v=2', title: 'Settings' },
  { id: 'translator' as AppId, iconUrl: '/icons/Translate.png?v=2', title: 'Translator' },
  { id: 'converter' as AppId, iconUrl: '/icons/format.png?v=2', title: 'Format Factory' },
  { id: 'compressor' as AppId, iconUrl: '/icons/compressor.png?v=2', title: 'Compressor' },
  { id: 'exchange' as AppId, iconUrl: '/icons/currency_convert.png?v=2', title: 'Global Exchange' },
  { id: 'game2048' as AppId, iconUrl: '/icons/2048.png?v=2', title: '2048' },
  { id: 'tictactoe' as AppId, iconUrl: '/icons/tictactoe.png?v=2', title: 'Tic Tac Toe' },
  { id: 'snake' as AppId, iconUrl: '/icons/snake.png?v=2', title: 'Snake', scale: 1.15 },
  { id: 'aiassistant' as AppId, iconUrl: '/icons/AI_Chat.png?v=2', title: 'AI Assistant' },
  { id: 'dailyhub' as AppId, iconUrl: '/icons/daily-hub.png?v=2', title: 'Daily Hub' },
  { id: 'magiceraser' as AppId, iconUrl: '/icons/Image_editor.png?v=2', title: 'Image Studio' },
  { id: 'qrstudio' as AppId, iconUrl: '/icons/QR-generator.png?v=2', title: 'QR Studio' },
  { id: 'devtools' as AppId, iconUrl: '/icons/dev-tool.png?v=2', title: 'DevTools' },
  { id: 'cryptostudio' as AppId, iconUrl: `/icons/Passwords-${isLight ? 'light' : 'dark'}.png?v=2`, title: 'Password Hub' },
];

export default function Taskbar() {
  const { windows, openApp, minimizeApp, focusApp, highestZIndex } = useWindowStore();
  const { themeMode, accentColor, taskbarVisible, toggleTaskbar } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  
  const isLight = themeMode === 'light';
  const apps = getApps(isLight);
  
  const mouseX = useMotionValue(Infinity);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAppClick = (id: AppId, title: string) => {
    const win = windows[id];
    if (!win.isOpen) {
      openApp(id, title);
    } else if (win.isMinimized) {
      focusApp(id);
    } else if (win.zIndex === highestZIndex) {
      minimizeApp(id);
    } else {
      focusApp(id);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[40]">
        <AnimatePresence>
          {taskbarVisible && (
            <motion.div 
              initial={{ y: 150, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 150, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onMouseMove={(e) => mouseX.set(e.pageX)}
              onMouseLeave={() => mouseX.set(Infinity)}
              className={`flex items-end gap-2 px-3 pb-2 h-[72px] rounded-2xl backdrop-blur-3xl border shadow-2xl transition-colors
                ${isLight ? 'bg-white/40 border-white/60' : 'bg-black/40 border-white/10'}`}
            >
              {apps.map((app) => {
                const win = windows[app.id];
                const isOpen = win?.isOpen || false;
                const isFocused = isOpen && win.zIndex === highestZIndex && !win.isMinimized;
                
                return (
                  <DockIcon 
                    key={app.id} 
                    mouseX={mouseX} 
                    app={app}
                    isOpen={isOpen}
                    isFocused={isFocused}
                    isLight={isLight}
                    onClick={() => handleAppClick(app.id, app.title)}
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Taskbar Toggle Button */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-[50] w-full h-4 flex justify-center items-end group">
        <button 
          onClick={toggleTaskbar}
          className={`w-12 h-5 rounded-t-full backdrop-blur-md border border-b-0 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:h-6 hover:w-16
            ${isLight ? 'bg-white/60 border-white/80 text-slate-700' : 'bg-white/10 border-white/20 text-white/70'}`}
        >
          {taskbarVisible ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
    </>
  );
}

// Separate component for each Icon to calculate its own physics based on distance
function DockIcon({ 
  mouseX, 
  app, 
  isOpen, 
  isFocused, 
  isLight,
  onClick 
}: { 
  mouseX: MotionValue; 
  app: any; 
  isOpen: boolean; 
  isFocused: boolean; 
  isLight: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  // Calculate distance between mouse X and icon center X
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Map distance to size (closer = bigger)
  const widthSync = useTransform(distance, [-150, 0, 150], [50, 90, 50]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <div className="relative flex flex-col items-center justify-end h-full">
      <motion.button
        ref={ref}
        style={{ width, height: width }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="cursor-pointer relative group flex items-end justify-center focus:outline-none"
      >
        {/* Real App Icon */}
        <img 
          src={app.iconUrl} 
          alt={app.title}
          className="w-full h-full object-contain drop-shadow-xl"
          style={app.scale ? { transform: `scale(${app.scale})` } : {}}
        />
        
        {/* Tooltip */}
        <div className={`absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium px-3 py-1.5 rounded-md backdrop-blur-md pointer-events-none whitespace-nowrap shadow-xl z-50
          ${isLight ? 'bg-white/90 text-slate-800 border border-slate-200' : 'bg-black/70 text-white border border-white/10'}`}>
          {app.title}
        </div>
      </motion.button>
      
      {/* Active Indicator dot - perfectly aligned at the bottom of the glass pill */}
      <div className="absolute -bottom-1 w-full flex justify-center">
        <div className={`w-1 h-1 rounded-full transition-all ${isOpen ? 'opacity-100' : 'opacity-0'} 
          ${isFocused ? (isLight ? 'bg-slate-800' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]') : (isLight ? 'bg-slate-400' : 'bg-white/50')}`} 
        />
      </div>
    </div>
  );
}
