'use client';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWindowStore } from '@/store/useWindowStore';
import { Wifi, BatteryMedium, Search, Command, Bot, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const TIMEZONES = [
  { label: 'Local Time', value: 'Local' },
  { label: 'New York (EST)', value: 'America/New_York' },
  { label: 'London (GMT)', value: 'Europe/London' },
  { label: 'Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'India (IST)', value: 'Asia/Kolkata' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
];

export default function MenuBar() {
  const { themeMode } = useSettingsStore();
  const { windows, highestZIndex, openApp } = useWindowStore();
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [now, setNow] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'wifi' | 'battery' | 'clock' | null>(null);
  const [timezone, setTimezone] = useState<string>('Local');
  const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean } | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  const [speedTestState, setSpeedTestState] = useState<'idle' | 'testing' | 'done'>('idle');
  const [speedResult, setSpeedResult] = useState({ down: 0, up: 0 });

  const runSpeedTest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (speedTestState === 'testing') return;
    setSpeedTestState('testing');
    
    setTimeout(() => {
      setSpeedResult({
        down: Math.floor(Math.random() * 250) + 100,
        up: Math.floor(Math.random() * 80) + 20
      });
      setSpeedTestState('done');
      setTimeout(() => setSpeedTestState('idle'), 5000);
    }, 2000);
  };

  const isLight = themeMode === 'light';

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const currentDate = new Date();
      setNow(currentDate);
      setTime(currentDate.toLocaleTimeString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
      setDateStr(currentDate.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Battery
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryInfo({ level: Math.round(battery.level * 100), charging: battery.charging });
        battery.addEventListener('levelchange', () => {
          setBatteryInfo((prev: any) => ({ ...prev, level: Math.round(battery.level * 100) }));
        });
        battery.addEventListener('chargingchange', () => {
          setBatteryInfo((prev: any) => ({ ...prev, charging: battery.charging }));
        });
      });
    } else {
      setBatteryInfo({ level: 100, charging: false });
    }

    // Network
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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

  let displayNow = now;
  if (now && timezone !== 'Local') {
    try {
      displayNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    } catch (e) {
      displayNow = now;
    }
  }

  return (
    <div className={`w-full h-7 flex items-center justify-between px-3 select-none text-sm font-medium backdrop-blur-md z-[9999] relative
      ${isLight ? 'bg-white/30 text-slate-900 border-b border-white/40' : 'bg-black/30 text-slate-200 border-b border-white/10'}`}
    >
      <div className="flex items-center space-x-4">
        <div 
          className="flex items-center gap-1.5 cursor-pointer opacity-80 hover:opacity-100"
          onClick={() => useWindowStore.getState().toggleLaunchpad()}
        >
          <Command size={14} />
        </div>
        <div className="font-bold tracking-wide cursor-pointer">{activeAppName}</div>
        <div className="hidden sm:flex space-x-4 opacity-80">
          <span className="cursor-pointer hover:opacity-100" onClick={() => { openApp('resume', 'Resume.pdf'); setTimeout(() => window.dispatchEvent(new CustomEvent('navigate-resume', { detail: 'summary' })), 150); }}>About</span>
          <span className="cursor-pointer hover:opacity-100" onClick={() => { openApp('resume', 'Resume.pdf'); setTimeout(() => window.dispatchEvent(new CustomEvent('navigate-resume', { detail: 'projects' })), 150); }}>Projects</span>
          <span className="cursor-pointer hover:opacity-100" onClick={() => { openApp('resume', 'Resume.pdf'); setTimeout(() => window.dispatchEvent(new CustomEvent('navigate-resume', { detail: 'experience' })), 150); }}>Experience</span>
          <span className="cursor-pointer hover:opacity-100" onClick={() => { openApp('resume', 'Resume.pdf'); setTimeout(() => window.dispatchEvent(new CustomEvent('navigate-resume', { detail: 'skills' })), 150); }}>Skills</span>
          <span className="cursor-pointer hover:opacity-100" onClick={() => { openApp('resume', 'Resume.pdf'); setTimeout(() => window.dispatchEvent(new CustomEvent('navigate-resume', { detail: 'contact' })), 150); }}>Contact</span>
          <span className="cursor-pointer hover:opacity-100 font-semibold text-emerald-400" onClick={() => openApp('chatbot', 'Virtual Rohit')}>Virtual Rohit</span>
          <span className="cursor-pointer hover:opacity-100" onClick={() => openApp('help', 'Help Center')}>Help</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 opacity-90">
        <div className="flex items-center space-x-3 relative">
          {/* Wi-Fi Icon */}
          <div className="relative">
            <Wifi 
              size={14} 
              className={`cursor-pointer ${!isOnline ? 'opacity-50' : ''}`}
              onClick={() => setActiveMenu(activeMenu === 'wifi' ? null : 'wifi')} 
            />
            {activeMenu === 'wifi' && (
              <div className={`absolute top-full right-0 mt-2 w-48 p-2 rounded-xl shadow-xl border text-sm backdrop-blur-3xl z-50
                ${isLight ? 'bg-white/80 border-slate-200 text-slate-800' : 'bg-[#1e1e1e]/90 border-slate-800 text-slate-200'}`}>
                <div className="flex flex-col space-y-2">
                  <div className="font-semibold px-2 py-1 border-b border-white/10">Network</div>
                  <div className="px-2 py-1 rounded-md flex items-center justify-between">
                    <span>Status</span>
                    <div className="flex items-center gap-1.5">
                      {isOnline ? <span className="text-emerald-500 font-medium">Online</span> : <span className="text-red-500 font-medium">Offline</span>}
                      {isOnline && <Wifi size={14} className="text-emerald-500" />}
                    </div>
                  </div>
                  
                  {isOnline && (
                    <div className="px-2 pb-1">
                      {speedTestState === 'idle' && (
                        <button 
                          onClick={runSpeedTest}
                          className="w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          Run Speed Test
                        </button>
                      )}
                      
                      {speedTestState === 'testing' && (
                        <div className="w-full py-1.5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium flex items-center justify-center gap-2">
                          <Loader2 size={12} className="animate-spin" /> Testing...
                        </div>
                      )}
                      
                      {speedTestState === 'done' && (
                        <div className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md text-xs flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-slate-400">Download</span>
                            <span className="font-bold text-emerald-500">{speedResult.down} Mbps</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-slate-400">Upload</span>
                            <span className="font-bold text-blue-500">{speedResult.up} Mbps</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Battery Icon */}
          <div className="relative">
            <BatteryMedium 
              size={14} 
              className="cursor-pointer"
              onClick={() => setActiveMenu(activeMenu === 'battery' ? null : 'battery')} 
            />
            {activeMenu === 'battery' && (
              <div className={`absolute top-full right-0 mt-2 w-48 p-2 rounded-xl shadow-xl border text-sm backdrop-blur-3xl z-50
                ${isLight ? 'bg-white/80 border-slate-200 text-slate-800' : 'bg-[#1e1e1e]/90 border-slate-800 text-slate-200'}`}>
                <div className="flex flex-col space-y-1">
                  <div className="font-semibold px-2 py-1">Battery</div>
                  <div className="px-2 py-1 rounded-md flex items-center justify-between">
                    <span>Power Source</span>
                    <span className="text-xs text-slate-500">{batteryInfo?.charging ? 'Power Adapter' : 'Battery'}</span>
                  </div>
                  <div className="px-2 py-1 rounded-md flex items-center justify-between">
                    <span>Level</span>
                    <span className="font-medium">{batteryInfo?.level || 100}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="relative flex items-center">
          <span 
            className="text-xs cursor-pointer"
            onClick={() => setActiveMenu(activeMenu === 'clock' ? null : 'clock')}
          >
            {time}
          </span>
          {activeMenu === 'clock' && displayNow && (
            <div className={`absolute top-full right-0 mt-2 w-72 p-8 rounded-3xl shadow-2xl z-50
              ${isLight ? 'bg-[#f0f2f5] border border-white/50' : 'bg-[#222327] border border-black/50'}`}>
              <div className="flex flex-col items-center justify-center space-y-10">
                {/* Neumorphic Clock */}
                <div className={`relative w-48 h-48 rounded-full flex items-center justify-center
                  ${isLight 
                    ? 'bg-[#f0f2f5] shadow-[-10px_-10px_20px_#ffffff,10px_10px_20px_#d1d5db]' 
                    : 'bg-[#222327] shadow-[-8px_-8px_16px_#2c2d33,8px_8px_16px_#18191b]'}`}>
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* 4 Ticks */}
                    <line x1="50" y1="12" x2="50" y2="18" className={`stroke-[1] ${isLight ? 'stroke-slate-400' : 'stroke-slate-500'}`} />
                    <line x1="50" y1="88" x2="50" y2="82" className={`stroke-[1] ${isLight ? 'stroke-slate-400' : 'stroke-slate-500'}`} />
                    <line x1="12" y1="50" x2="18" y2="50" className={`stroke-[1] ${isLight ? 'stroke-slate-400' : 'stroke-slate-500'}`} />
                    <line x1="88" y1="50" x2="82" y2="50" className={`stroke-[1] ${isLight ? 'stroke-slate-400' : 'stroke-slate-500'}`} />

                    {/* Hour Hand */}
                    <line 
                      x1="50" y1="50" x2="50" y2="28"
                      transform={`rotate(${(displayNow.getHours() % 12) * 30 + displayNow.getMinutes() * 0.5} 50 50)`}
                      className={`stroke-[3.5] ${isLight ? 'stroke-[#474c5c]' : 'stroke-[#c1c4cd]'}`}
                      strokeLinecap="round"
                    />

                    {/* Minute Hand */}
                    <line 
                      x1="50" y1="50" x2="50" y2="16"
                      transform={`rotate(${displayNow.getMinutes() * 6} 50 50)`}
                      className={`stroke-[2.5] ${isLight ? 'stroke-[#474c5c]' : 'stroke-[#c1c4cd]'}`}
                      strokeLinecap="round"
                    />

                    {/* Second Hand */}
                    <line 
                      x1="50" y1="58" x2="50" y2="16"
                      transform={`rotate(${displayNow.getSeconds() * 6} 50 50)`}
                      className="stroke-[#375ee3] stroke-[1.5]"
                      strokeLinecap="round"
                    />

                    {/* Center Pin */}
                    <circle cx="50" cy="50" r="3" className="fill-[#375ee3]" />
                  </svg>
                </div>
                
                {/* Digital Time & Date */}
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-start">
                    <span className={`text-6xl font-medium tracking-tight leading-none ${isLight ? 'text-[#1a1b26]' : 'text-white'}`}>
                      {`${displayNow.getHours() % 12 || 12}:${displayNow.getMinutes().toString().padStart(2, '0')}`}
                    </span>
                    <span className={`text-base font-semibold mt-1 ml-1 ${isLight ? 'text-[#1a1b26]' : 'text-white'}`}>
                      {displayNow.getHours() >= 12 ? 'PM' : 'AM'}
                    </span>
                  </div>
                  <div className={`text-base font-medium mt-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {displayNow.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>

                  <div className="w-full mt-8">
                    <select 
                      className={`w-full outline-none text-sm font-medium py-2 px-3 rounded-xl cursor-pointer transition-colors appearance-none text-center
                        ${isLight 
                          ? 'bg-[#e4e6e9] hover:bg-[#d9dbde] text-[#1a1b26]' 
                          : 'bg-[#2c2d33] hover:bg-[#32333a] text-white'}`}
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      {TIMEZONES.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
