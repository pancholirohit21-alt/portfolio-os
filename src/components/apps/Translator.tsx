'use client';
import { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ArrowRightLeft, Languages, Loader2, Volume2, Copy, Check, Mic } from 'lucide-react';

const LANGUAGES = {
  auto: 'Detect Language',
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ar: 'Arabic',
  ja: 'Japanese',
  zh: 'Chinese',
  it: 'Italian',
  ru: 'Russian',
  pt: 'Portuguese',
  ko: 'Korean',
};

export default function Translator() {
  const { themeMode, accentColor } = useSettingsStore();
  const isLight = themeMode === 'light';
  
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('hi'); // Default translate to Hindi
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [detectedLang, setDetectedLang] = useState('');
  const [isListening, setIsListening] = useState(false);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = sourceLang !== 'auto' ? sourceLang : 'en-US';
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setSourceText(transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const speakText = (text: string, lang: string) => {
    if (!text) return;
    window.speechSynthesis.cancel(); // Stop any currently playing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const handleTranslate = async (text: string, source: string, target: string) => {
    if (!text.trim()) {
      setTranslatedText('');
      setDetectedLang('');
      return;
    }

    setIsTranslating(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      
      let finalTranslation = '';
      if (data && data[0]) {
        data[0].forEach((item: any) => {
          if (item[0]) finalTranslation += item[0];
        });
      }
      
      setTranslatedText(finalTranslation);

      // data[2] contains detected language if source was 'auto'
      if (source === 'auto' && data[2]) {
        setDetectedLang(data[2]);
      } else {
        setDetectedLang('');
      }

    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Error translating text. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Debounce the translation input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(() => {
      handleTranslate(sourceText, sourceLang, targetLang);
    }, 600);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [sourceText, sourceLang, targetLang]);

  const swapLanguages = () => {
    if (sourceLang === 'auto') {
      if (detectedLang) {
        setSourceLang(targetLang);
        setTargetLang(detectedLang);
      } else {
        // Can't really swap auto if we haven't detected anything, default to English
        setSourceLang(targetLang);
        setTargetLang('en');
      }
    } else {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
    }
    setSourceText(translatedText);
  };

  const copyToClipboard = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col h-full w-full font-sans transition-colors ${isLight ? 'bg-slate-50/90 text-slate-900' : 'bg-slate-900/90 text-slate-100'}`}>
      
      {/* Header */}
      <div className={`flex items-center px-6 py-4 border-b ${isLight ? 'border-slate-200 bg-white/50' : 'border-white/10 bg-black/20'}`}>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${accentColor} mr-4 shadow-md`}>
          <Languages className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">AI Translator</h2>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Powered by Neural Machine Translation</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row p-6 gap-4 overflow-hidden">
        
        {/* Source Panel */}
        <div className={`flex-1 flex flex-col rounded-2xl border shadow-sm overflow-hidden transition-colors ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950/50 border-white/10'}`}>
          {/* Controls */}
          <div className={`flex items-center p-3 border-b ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-white/5 bg-black/20'}`}>
            <select 
              value={sourceLang} 
              onChange={(e) => setSourceLang(e.target.value)}
              className={`font-semibold bg-transparent outline-none px-2 py-1 rounded-md text-sm cursor-pointer hover:bg-black/5 dark:hover:bg-white/5`}
            >
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <option key={code} value={code} className="text-black">{name}</option>
              ))}
            </select>
            {sourceLang === 'auto' && detectedLang && LANGUAGES[detectedLang as keyof typeof LANGUAGES] && (
              <span className={`text-xs ml-2 px-2 py-1 rounded-full font-medium ${isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-300'}`}>
                Detected: {LANGUAGES[detectedLang as keyof typeof LANGUAGES]}
              </span>
            )}
          </div>
          
          {/* Text Area */}
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Enter text to translate..."
            className="flex-1 w-full resize-none bg-transparent p-5 outline-none text-lg placeholder:text-slate-400/60"
            spellCheck="false"
          />
          
          {/* Footer actions */}
          <div className="p-3 flex justify-between items-center text-slate-400">
            <span className="text-xs font-medium px-2">{sourceText.length} characters</span>
            <button 
              onClick={startListening}
              className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse scale-110' : (isLight ? 'hover:bg-black/5 text-slate-500' : 'hover:bg-white/5 text-slate-400')}`}
              title="Speak to translate"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Swap Button (Desktop) */}
        <div className="hidden md:flex items-center justify-center -mx-8 z-10">
          <button 
            onClick={swapLanguages}
            className={`p-3 rounded-full shadow-lg border backdrop-blur-md transition-transform hover:scale-110 active:scale-95 ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-600 text-white'}`}
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Target Panel */}
        <div className={`flex-1 flex flex-col rounded-2xl border shadow-sm overflow-hidden transition-colors ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'}`}>
          {/* Controls */}
          <div className={`flex items-center p-3 border-b ${isLight ? 'border-slate-200 bg-slate-100/50' : 'border-white/5 bg-black/40'}`}>
            <select 
              value={targetLang} 
              onChange={(e) => setTargetLang(e.target.value)}
              className={`font-semibold bg-transparent outline-none px-2 py-1 rounded-md text-sm cursor-pointer hover:bg-black/5 dark:hover:bg-white/5`}
            >
              {Object.entries(LANGUAGES).filter(([code]) => code !== 'auto').map(([code, name]) => (
                <option key={code} value={code} className="text-black">{name}</option>
              ))}
            </select>
            {isTranslating && (
              <div className="ml-auto flex items-center text-xs text-indigo-500 font-medium">
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Translating...
              </div>
            )}
          </div>
          
          {/* Text Area */}
          <div className="flex-1 w-full relative">
            <textarea
              value={translatedText}
              readOnly
              placeholder="Translation will appear here..."
              className={`w-full h-full resize-none bg-transparent p-5 outline-none text-lg ${isTranslating ? 'opacity-50' : 'opacity-100'}`}
            />
          </div>
          
          {/* Footer actions */}
          <div className="p-3 flex justify-end items-center gap-2">
            <button 
              onClick={() => speakText(translatedText, targetLang)}
              disabled={!translatedText}
              className={`p-2 rounded-full transition-all ${translatedText ? (isLight ? 'hover:bg-black/5 text-indigo-600' : 'hover:bg-white/5 text-indigo-400') : 'opacity-30 cursor-not-allowed text-slate-500'}`}
              title="Listen to translation"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <div className={`w-px h-4 mx-1 ${isLight ? 'bg-slate-300' : 'bg-white/10'}`}></div>
            <button 
              onClick={copyToClipboard}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${copied ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'}`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
