'use client';
import Taskbar from '@/components/Taskbar';
import DraggableWindow from '@/components/DraggableWindow';
import ContextMenu from '@/components/ContextMenu';
import MenuBar from '@/components/MenuBar';
import DesktopIcons from '@/components/DesktopIcons';
import FaceTime from '@/components/apps/FaceTime';
import Settings, { WALLPAPERS } from '@/components/apps/Settings';
import VSCode from '@/components/apps/VSCode';
import Resume from '@/components/apps/Resume';
import Translator from '@/components/apps/Translator';
import ChatBot from '@/components/apps/ChatBot';
import Game2048 from '@/components/apps/Game2048';
import TicTacToe from '@/components/apps/TicTacToe';
import Snake from '@/components/apps/Snake';
import DailyHub from '@/components/apps/DailyHub';
import MagicEraser from '@/components/apps/MagicEraser';
import QRStudio from '@/components/apps/QRStudio';
import DevTools from '@/components/apps/DevTools';
import CryptoStudio from '@/components/apps/CryptoStudio';
import Terminal from '@/components/apps/Terminal';
import Tour from '@/components/apps/Tour';
import Converter from '@/components/apps/Converter';
import Compressor from '@/components/apps/Compressor';
import Exchange from '@/components/apps/Exchange';
import Help from '@/components/apps/Help';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWindowStore } from '@/store/useWindowStore';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0 });
  const { themeMode, wallpaper, accentColor, customColorHex } = useSettingsStore();
  const { windows, openApp } = useWindowStore();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    if (contextMenu.isOpen) {
      setContextMenu({ ...contextMenu, isOpen: false });
    }
  };

  useEffect(() => {
    setMounted(true);

    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      localStorage.setItem('hasVisitedBefore', 'true');
      // Adding a slight delay makes the opening animation look smoother
      setTimeout(() => {
        openApp('tour', 'Take a Tour');
      }, 500);
    }
  }, [openApp]);

  if (!mounted) {
    // Return blank shell for first render to avoid hydration mismatch with localStorage
    return <main className="w-screen h-screen bg-black"></main>;
  }

  const isLight = themeMode === 'light';

  let selectedWp = WALLPAPERS.find(w => w.id === wallpaper);

  let bgElement = null;
  if (!selectedWp && wallpaper.includes('://')) {
    // Custom uploaded wallpaper via Blob URL or external URL
    bgElement = <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url(${wallpaper})` }}></div>;
  } else {
    selectedWp = selectedWp || WALLPAPERS[0];
    if (selectedWp.type === 'animated') {
      bgElement = <div className={`aurora-bg ${isLight ? 'opacity-20 mix-blend-multiply' : ''}`}></div>;
    } else if (selectedWp.type === 'solid') {
      bgElement = <div className={`absolute inset-0 ${selectedWp.bg} opacity-80`}></div>;
    } else {
      bgElement = <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url(${selectedWp.url})` }}></div>;
    }
  }

  return (
    <main 
      className={`relative w-full h-full overflow-hidden font-sans transition-colors duration-500
      ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-white'}`}
      style={{ '--theme-accent': customColorHex || '#6366f1' } as any}
      onContextMenu={handleContextMenu}
      onClick={closeContextMenu}
    >

      {bgElement}

      {/* Grain Overlay */}
      <div className={`absolute inset-0 pointer-events-none ${isLight ? 'opacity-[0.06]' : 'opacity-[0.03]'}`} style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png")' }}></div>

      {/* Light Mode Whitewash Overlay */}
      {isLight && <div className="absolute inset-0 bg-white/40 pointer-events-none backdrop-blur-[2px]"></div>}

      {/* Desktop Area */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between pt-7">
        <div className="absolute top-0 left-0 w-full">
          <MenuBar />
        </div>
        


        {contextMenu.isOpen && (
          <ContextMenu 
            x={contextMenu.x} 
            y={contextMenu.y} 
            onClose={closeContextMenu} 
          />
        )}
        
        <div className="flex-1 p-6 relative overflow-hidden">
          <DesktopIcons />

          {/* TERMINAL APP */}
          <DraggableWindow id="terminal" defaultWidth={700} defaultHeight={450}>
            <div className="p-6 text-white font-mono h-full bg-[#0d1117] flex flex-col shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
              <div className="flex-1">
                <p className="text-emerald-400">rohit@os:~$ <span className="text-white">whoami</span></p>
                <p className="text-slate-300 mt-1 ml-2 border-l-2 border-emerald-500/30 pl-3">Rohit Pancholi - Senior Angular/React Developer</p>
                <br />
                <p className="text-emerald-400">rohit@os:~$ <span className="text-white">cat skills.txt</span></p>
                <div className="text-slate-300 mt-1 ml-2 border-l-2 border-emerald-500/30 pl-3 flex flex-wrap gap-2">
                  <span className="text-blue-400">Angular</span> •
                  <span className="text-cyan-400">React</span> •
                  <span className="text-white">Next.js</span> •
                  <span className="text-pink-400">RxJS</span> •
                  <span className="text-teal-400">Tailwind</span>
                </div>
                <br />
                <p className="text-emerald-400">rohit@os:~$ <span className="animate-pulse block mt-2 w-2.5 h-5 bg-emerald-400"></span></p>
              </div>
            </div>
          </DraggableWindow>

          {/* RESUME APP */}
          <DraggableWindow id="resume" defaultWidth={900} defaultHeight={650}>
            <Resume />
          </DraggableWindow>

          {/* FACETIME APP */}
          <DraggableWindow id="facetime" defaultWidth={900} defaultHeight={600}>
            <FaceTime />
          </DraggableWindow>

          {/* SETTINGS APP */}
          <DraggableWindow id="settings" defaultWidth={800} defaultHeight={550}>
            <Settings />
          </DraggableWindow>

          {/* APPS */}
          <DraggableWindow id="terminal" title="Terminal" defaultWidth={700} defaultHeight={450}>
            <Terminal />
          </DraggableWindow>

          {/* VS CODE APP */}
          <DraggableWindow id="vscode" defaultWidth={1050} defaultHeight={700}>
            <VSCode />
          </DraggableWindow>

          <DraggableWindow id="translator" title="AI Translator" defaultWidth={700} defaultHeight={550}>
            <Translator />
          </DraggableWindow>

          <DraggableWindow id="tour" title="Take a Tour" defaultWidth={700} defaultHeight={500}>
            <Tour />
          </DraggableWindow>

          <DraggableWindow id="converter" title="Format Factory" defaultWidth={800} defaultHeight={600}>
            <Converter />
          </DraggableWindow>

          <DraggableWindow id="compressor" title="Compressor" defaultWidth={800} defaultHeight={600}>
            <Compressor />
          </DraggableWindow>
        
          <DraggableWindow id="exchange" title="Global Exchange" defaultWidth={900} defaultHeight={650}>
            <Exchange />
          </DraggableWindow>

          <DraggableWindow id="help" title="Help Center" defaultWidth={800} defaultHeight={600}>
            <Help />
          </DraggableWindow>

          <DraggableWindow id="game2048" title="2048" defaultWidth={600} defaultHeight={750}>
            <Game2048 />
          </DraggableWindow>

          <DraggableWindow id="tictactoe" title="Tic Tac Toe" defaultWidth={500} defaultHeight={650}>
            <TicTacToe />
          </DraggableWindow>

          <DraggableWindow id="snake" title="Snake" defaultWidth={500} defaultHeight={650}>
            <Snake />
          </DraggableWindow>

          <DraggableWindow id="dailyhub" title="Daily Hub" defaultWidth={800} defaultHeight={600}>
            <DailyHub />
          </DraggableWindow>

          <DraggableWindow id="magiceraser" title="Image Studio" defaultWidth={850} defaultHeight={650}>
            <MagicEraser />
          </DraggableWindow>

          <DraggableWindow id="qrstudio" title="QR Studio" defaultWidth={800} defaultHeight={600}>
            <QRStudio />
          </DraggableWindow>

          <DraggableWindow id="devtools" title="DevTools" defaultWidth={900} defaultHeight={650}>
            <DevTools />
          </DraggableWindow>

          <DraggableWindow id="cryptostudio" title="Password Hub" defaultWidth={850} defaultHeight={600}>
            <CryptoStudio />
          </DraggableWindow>

          {/* CHATBOT APP */}
          <DraggableWindow id="chatbot" defaultWidth={500} defaultHeight={700}>
            <ChatBot />
          </DraggableWindow>

        </div>

        <Taskbar />
      </div>
    </main>
  );
}
