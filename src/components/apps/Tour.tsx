'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ChevronRight, ChevronLeft, Sparkles, Bot, FileText, Languages, Settings, Layout } from 'lucide-react';
import { useWindowStore } from '@/store/useWindowStore';

const SLIDES = [
  {
    id: 'welcome',
    title: 'Welcome to Portfolio OS',
    description: 'Experience a fully interactive, web-based operating system designed to showcase my skills, projects, and personality in a unique way.',
    icon: Sparkles,
    color: 'text-yellow-500'
  },
  {
    id: 'chatbot',
    title: 'Virtual Rohit',
    description: 'An intelligent AI assistant built right into the OS. You can even use Voice Commands to interact with it directly!',
    icon: Bot,
    color: 'text-pink-500'
  },
  {
    id: 'resume',
    title: 'Interactive Resume',
    description: 'View my professional experience, skills, and education in a clean, beautifully formatted document viewer.',
    icon: FileText,
    color: 'text-emerald-500'
  },
  {
    id: 'translate',
    title: 'Real-time Translation',
    description: 'Test out the built-in translation app that dynamically translates text across multiple languages with a sleek interface.',
    icon: Languages,
    color: 'text-blue-500'
  },
  {
    id: 'settings',
    title: 'Deep Customization',
    description: 'Make the OS yours. Change themes, pick vibrant accent colors, and choose from gorgeous ultra-HD macOS wallpapers.',
    icon: Settings,
    color: 'text-slate-500'
  },
  {
    id: 'windows',
    title: 'Window Management',
    description: 'Drag windows around, minimize them to the dock, or maximize them. Enjoy the fluid, physics-based Framer Motion animations.',
    icon: Layout,
    color: 'text-purple-500'
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
