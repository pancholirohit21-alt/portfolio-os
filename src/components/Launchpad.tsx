'use client';
import { useWindowStore } from '@/store/useWindowStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllApps } from '@/data/apps';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function Launchpad() {
  const { isLaunchpadOpen, closeLaunchpad, openApp } = useWindowStore();
  const { themeMode } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const isLight = themeMode === 'light';
  const apps = getAllApps(isLight).filter(app => app.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Prevent clicks inside the launchpad content from closing it
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleAppClick = (id: any, title: string) => {
    openApp(id, title);
    closeLaunchpad();
    setSearchQuery('');
  };

  return (
    <AnimatePresence>
      {isLaunchpadOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className={`absolute inset-0 z-[9998] flex flex-col items-center pt-24 px-10 pb-20 overflow-hidden backdrop-blur-2xl ${
            isLight ? 'bg-white/40' : 'bg-black/40'
          }`}
          onClick={() => {
            closeLaunchpad();
            setSearchQuery('');
          }}
        >
          {/* Optional Search Bar mimicking macOS */}
          <div 
            className="w-full max-w-sm mb-12 relative"
            onClick={handleContentClick}
          >
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 border-transparent rounded-xl text-center text-sm focus:outline-none focus:ring-2 transition-all ${
                isLight 
                  ? 'bg-black/10 text-slate-800 placeholder-slate-500 focus:bg-white focus:ring-black/20' 
                  : 'bg-white/10 text-slate-200 placeholder-slate-400 focus:bg-white/20 focus:ring-white/30'
              }`}
            />
          </div>

          <div 
            className="w-full max-w-5xl mx-auto grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-12"
            onClick={handleContentClick}
          >
            {apps.map((app) => (
              <motion.div
                key={app.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 cursor-pointer group"
                onClick={() => handleAppClick(app.id, app.title)}
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-transform shadow-lg ${
                  isLight ? 'bg-white/60 border border-white/80' : 'bg-white/10 border border-white/20'
                }`}>
                  <img 
                    src={app.iconUrl} 
                    alt={app.title} 
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-lg transition-transform group-hover:scale-105"
                    style={{ transform: app.scale ? 'scale(' + app.scale + ')' : 'scale(1)' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className={`text-xs sm:text-sm font-medium text-center truncate w-full px-1 drop-shadow-sm ${
                  isLight ? 'text-slate-800' : 'text-slate-100'
                }`}>
                  {app.title}
                </span>
              </motion.div>
            ))}
          </div>

          {apps.length === 0 && (
            <div className={`mt-20 text-lg ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              No applications found
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
