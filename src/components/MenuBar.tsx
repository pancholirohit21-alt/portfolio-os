'use client';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWindowStore } from '@/store/useWindowStore';
import { Wifi, BatteryMedium, Search, Command } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MenuBar() {
  const { themeMode } = useSettingsStore();
  const { windows, highestZIndex } = useWindowStore();
  const [time, setTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  const isLight = themeMode === 'light';

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  // Determine active app name for the menu bar
  let activeAppName = 'Portfolio OS';
  const openWindows = Object.values(windows).filter(w => w.isOpen && !w.isMinimized);
  if (openWindows.length > 0) {
    const activeWindow = openWindows.find(w => w.zIndex === highestZIndex);
    if (activeWindow) {
      activeAppName = activeWindow.title;
    }
  }

  return (
    <div className={`w-full h-7 flex items-center justify-between px-3 select-none text-sm font-medium backdrop-blur-md z-[9999] relative
      ${isLight ? 'bg-white/30 text-slate-900 border-b border-white/40' : 'bg-black/30 text-slate-200 border-b border-white/10'}`}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-1.5 cursor-pointer opacity-80 hover:opacity-100">
          <Command size={14} />
        </div>
        <div className="font-bold tracking-wide cursor-pointer">{activeAppName}</div>
        <div className="hidden sm:flex space-x-4 opacity-80">
          <span className="cursor-pointer hover:opacity-100">File</span>
          <span className="cursor-pointer hover:opacity-100">Edit</span>
          <span className="cursor-pointer hover:opacity-100">View</span>
          <span className="cursor-pointer hover:opacity-100">Go</span>
          <span className="cursor-pointer hover:opacity-100">Window</span>
          <span className="cursor-pointer hover:opacity-100">Help</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 opacity-90">
        <div className="flex items-center space-x-3">
          <Search size={14} className="cursor-pointer" />
          <Wifi size={14} className="cursor-pointer" />
          <BatteryMedium size={14} className="cursor-pointer" />
        </div>
        <span className="text-xs">{time}</span>
      </div>
    </div>
  );
}
