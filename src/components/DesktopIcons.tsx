'use client';
import { useWindowStore } from '@/store/useWindowStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { motion } from 'framer-motion';

const icons = [
  { id: 'tour', title: 'Take a Tour', iconUrl: '/icons/tour.png' },
];

export default function DesktopIcons() {
  const { openApp } = useWindowStore();
  const { themeMode } = useSettingsStore();
  
  const isLight = themeMode === 'light';

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-6 p-4 z-0">
      {icons.map((icon) => (
        <motion.div 
          key={icon.id}
          drag
          dragMomentum={false}
          whileDrag={{ scale: 1.05, opacity: 0.8 }}
          className="flex flex-col items-center gap-1.5 cursor-pointer group w-20"
          onDoubleClick={() => openApp(icon.id as any, icon.title)}
          onClick={(e) => {
            // Visual selection effect
            const target = e.currentTarget;
            target.classList.add('bg-white/20', 'rounded-md');
            setTimeout(() => target.classList.remove('bg-white/20', 'rounded-md'), 300);
            
            // Open app on single click for better web UX
            openApp(icon.id as any, icon.title);
          }}
        >
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-md ${isLight ? 'bg-white/40 border border-white/60' : 'bg-black/20 border border-white/10'}`}>
            <img src={icon.iconUrl} alt={icon.title} className="w-10 h-10 object-contain drop-shadow-lg" />
          </div>
          <span className={`text-xs text-center font-medium leading-tight px-1 py-0.5 rounded shadow-sm ${isLight ? 'text-slate-800 bg-white/40 backdrop-blur-md' : 'text-white bg-black/40 backdrop-blur-md'}`}>
            {icon.title}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
