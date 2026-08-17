'use client';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function DesktopWidgets() {
  const [time, setTime] = useState<Date | null>(null);
  const { themeMode, accentColor } = useSettingsStore();
  const isLight = themeMode === 'light';

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayName = days[time.getDay()];
  const monthName = months[time.getMonth()];
  const date = time.getDate();
  
  let hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  return (
    <div className="absolute top-8 right-8 flex flex-col gap-4 z-0 pointer-events-none select-none">
      
      {/* Clock Widget */}
      <div className={`p-6 rounded-3xl backdrop-blur-3xl border shadow-2xl transition-colors ${isLight ? 'bg-white/40 border-white/60' : 'bg-black/20 border-white/10'}`}>
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-baseline gap-2">
            <span className={`text-6xl font-black tracking-tighter ${isLight ? 'text-slate-800' : 'text-white'}`}>
              {hours}:{minutes}
            </span>
            <span className={`text-xl font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {ampm}
            </span>
          </div>
          <div className={`mt-2 text-sm font-medium uppercase tracking-widest ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            {dayName}, {monthName} {date}
          </div>
        </div>
      </div>

      {/* Mini Profile Widget */}
      <div className={`p-5 rounded-3xl backdrop-blur-3xl border shadow-xl flex items-center gap-4 transition-colors ${isLight ? 'bg-white/40 border-white/60' : 'bg-black/20 border-white/10'}`}>
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${accentColor} flex items-center justify-center shadow-lg`}>
          <span className="text-white font-bold text-lg">RP</span>
        </div>
        <div>
          <h3 className={`font-bold text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>Rohit Pancholi</h3>
          <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Senior Software Engineer</p>
        </div>
      </div>

    </div>
  );
}
