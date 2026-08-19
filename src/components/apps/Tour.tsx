'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ChevronRight, ChevronLeft, Sparkles, Bot, FileText, Languages, Settings, Layout, UserCircle, Wand2, Wrench, Gamepad2, Video, TerminalSquare, Paintbrush, Music } from 'lucide-react';
import { useWindowStore } from '@/store/useWindowStore';

const SLIDES = [
  {
    id: 'welcome',
    title: 'Welcome to My Portfolio!',
    description: 'This is not a normal website. It is a fully interactive, simulated computer desktop! Feel free to drag windows around, open apps, and explore.',
    icon: Sparkles,
    color: 'text-yellow-500'
  },
  {
    id: 'resume_projects',
    title: 'Get to Know Me',
    description: 'Check out the Resume app to see my professional experience, education, and skills in a beautifully formatted document.',
    icon: UserCircle,
    color: 'text-emerald-500'
  },
  {
    id: 'chatbot',
    title: 'Meet AI Rohit',
    description: 'Have a question? Open the Virtual Rohit app to chat with an AI assistant that knows all about me. You can even talk to it using your voice!',
    icon: Bot,
    color: 'text-pink-500'
  },
  {
    id: 'creative_tools',
    title: 'Creative Studio',
    description: 'Try the Image Studio to magically remove backgrounds from photos, or use QR Studio to create your own custom QR codes in seconds.',
    icon: Wand2,
    color: 'text-purple-500'
  },
  {
    id: 'utilities',
    title: 'Handy Utilities',
    description: 'Need to convert files, check the daily news, compress media, or manage passwords? Explore handy tools like Daily Hub, Format Factory, Compressor, and Password Hub right here!',
    icon: Wrench,
    color: 'text-orange-500'
  },
  {
    id: 'music_player',
    title: 'Listen to Music',
    description: 'Vibe while you work. Open the Music Player to listen to curated YouTube playlists instantly right inside the OS.',
    icon: Music,
    color: 'text-indigo-500'
  },
  {
    id: 'games',
    title: 'Time for a Break',
    description: 'Work hard, play hard. Open up 2048, Snake, or Tic Tac Toe for some quick fun without ever leaving the portfolio.',
    icon: Gamepad2,
    color: 'text-red-500'
  },
  {
    id: 'facetime',
    title: 'Say Hello',
    description: 'Click on the FaceTime app to start a simulated video call. It is a fun way to feel like we are having a real face-to-face chat!',
    icon: Video,
    color: 'text-green-500'
  },
  {
    id: 'developer',
    title: 'For the Techies',
    description: 'Are you a developer? Open the Terminal to see my actual code and interact with the site using command-line tools.',
    icon: TerminalSquare,
    color: 'text-slate-500'
  },
  {
    id: 'customization',
    title: 'Make it Yours',
    description: 'Open Settings to change the wallpaper, switch between Dark and Light mode, or pick a new accent color to personalize your experience.',
    icon: Paintbrush,
    color: 'text-blue-500'
  }
];

export default function Tour() {
  const { themeMode } = useSettingsStore();
  const { closeApp } = useWindowStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const isLight = themeMode === 'light';

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      closeApp('tour');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden transition-colors ${isLight ? 'bg-slate-50/90 text-slate-900' : 'bg-slate-900/90 text-white'}`}>
      
      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-8 text-center overflow-hidden">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col items-center max-w-md"
          >
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-black/50 border-white/10'}`}>
              <slide.icon size={48} className={slide.color} />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">{slide.title}</h2>
            <p className={`text-lg leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Footer Navigation */}
      <div className={`h-20 flex items-center justify-between px-8 border-t ${isLight ? 'bg-slate-100/50 border-slate-200/50' : 'bg-black/20 border-white/10'}`}>
        
        {/* Progress Dots */}
        <div className="flex gap-2">
          {SLIDES.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide 
                  ? (isLight ? 'w-8 bg-blue-500' : 'w-8 bg-blue-400') 
                  : (isLight ? 'w-2.5 bg-slate-300' : 'w-2.5 bg-white/20')
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`px-4 py-2 rounded-xl flex items-center gap-1 transition-colors disabled:opacity-30
              ${isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <ChevronLeft size={18} /> Back
          </button>
          
          <button 
            onClick={nextSlide}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center gap-1 font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'} <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
    </div>
  );
}
