'use client';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWindowStore, AppId } from '@/store/useWindowStore';
import { motion, AnimatePresence } from 'framer-motion';

const GAMES = [
  {
    id: 'game2048',
    title: '2048',
    icon: '/icons/2048.png',
  },
  {
    id: 'snake',
    title: 'Snake',
    icon: '/icons/snake.png',
  },
  {
    id: 'tictactoe',
    title: 'Tic Tac Toe',
    icon: '/icons/tictactoe.png',
  },
  {
    id: 'typinggame',
    title: 'DevType',
    icon: '/icons/typing.png',
  }
];

export default function GamesHub() {
  const { themeMode } = useSettingsStore();
  const { windows, openApp, closeApp } = useWindowStore();
  
  const isLight = themeMode === 'light';
  
  // Check if gameshub is open
  const isOpen = windows['gameshub']?.isOpen && !windows['gameshub']?.isMinimized;

  const handleGameClick = (id: AppId, title: string) => {
    openApp(id, title);
    closeApp('gameshub'); // Close the folder when a game is launched
  };

  const handleBackgroundClick = () => {
    closeApp('gameshub');
  };

  const handleFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicks inside the folder from closing it
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-[9998] flex flex-col items-center justify-center bg-black/10 backdrop-blur-md"
          onClick={handleBackgroundClick}
        >
          {/* iOS Folder Title */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`text-4xl font-normal tracking-tight mb-8 drop-shadow-md ${isLight ? 'text-white' : 'text-slate-100'}`}
          >
            Games
          </motion.h2>

          {/* iOS Folder Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={handleFolderClick}
            className={`w-80 h-80 rounded-[40px] p-8 grid grid-cols-2 gap-6 backdrop-blur-3xl shadow-2xl border ${
              isLight 
                ? 'bg-white/40 border-white/60' 
                : 'bg-white/10 border-white/20'
            }`}
          >
            {GAMES.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 cursor-pointer group"
                onClick={() => handleGameClick(game.id as AppId, game.title)}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                  <img 
                    src={game.icon} 
                    alt={game.title} 
                    className="w-full h-full object-contain drop-shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className={`text-xs font-medium text-center truncate w-full px-1 drop-shadow-sm ${
                  isLight ? 'text-slate-800' : 'text-white'
                }`}>
                  {game.title}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
