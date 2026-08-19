'use client';
import { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { RotateCcw, Clock, Trophy, Target, Type } from 'lucide-react';

const WORD_LIST = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "I", "with", "as", "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which", "one", "would", "all", "will", "there", "say", "who", "make", "when", "can", "more", "if", "no", "man", "out", "other", "so", "what", "time", "up", "go", "about", "than", "into", "could", "state", "only", "new", "year", "some", "take", "come", "these", "know", "see", "use", "get", "like", "then", "first", "any", "work", "now", "may", "such", "give", "over", "think", "most", "even", "find", "day", "also", "after", "way", "many", "must", "look", "before", "great", "back", "through", "long", "where", "much", "should", "well", "people", "down", "own", "just", "because", "good", "each", "those", "feel", "seem", "how", "high", "too", "place", "little", "world", "very", "still", "nation", "hand", "old", "life", "tell", "write", "become", "here", "show", "house", "both", "between", "need", "mean", "call", "develop", "under", "last", "right", "move", "thing", "general", "school", "never", "same", "another", "begin", "while", "number", "part", "turn", "real", "leave", "might", "want", "point", "form", "off", "child", "few", "small", "since", "against", "ask", "late", "home", "interest", "large", "person", "end", "open", "public", "follow", "during", "present", "without", "again", "hold", "govern", "around", "possible", "head", "consider", "word", "program", "problem", "however", "lead", "system", "set", "order", "eye", "plan", "run", "keep", "face", "fact", "group", "play", "stand", "increase", "early", "course", "change", "help", "line"
];

const DEV_WORD_LIST = [
  "const", "let", "var", "function", "return", "if", "else", "for", "while", "class", "import", "export", "default", "yield", "await", "async", "try", "catch", "finally", "throw", "new", "this", "super", "extends", "implements", "interface", "type", "enum", "namespace", "declare", "module", "public", "private", "protected", "readonly", "static", "abstract", "console", "log", "error", "warn", "info", "fetch", "Promise", "resolve", "reject", "then", "Math", "Date", "JSON", "parse", "stringify", "Object", "keys", "values", "entries", "assign", "Array", "map", "filter", "reduce", "forEach", "some", "every", "find", "includes", "push", "pop", "shift", "unshift", "splice", "slice", "join", "split", "String", "Number", "Boolean", "Symbol", "RegExp", "Error", "Map", "Set", "React", "useState", "useEffect", "useContext", "useReducer", "useCallback", "useMemo", "useRef", "Component", "memo", "forwardRef", "lazy", "Suspense", "Fragment", "Next.js", "Link", "Image", "Head", "Script", "useRouter", "div", "span", "className", "style", "onClick", "onChange", "onSubmit", "preventDefault", "stopPropagation"
];

const generateText = (count: number, mode: 'normal' | 'dev') => {
  let text = [];
  const list = mode === 'dev' ? DEV_WORD_LIST : WORD_LIST;
  for (let i = 0; i < count; i++) {
    text.push(list[Math.floor(Math.random() * list.length)]);
  }
  return text.join(' ') + ' ';
};

type GameStatus = 'idle' | 'playing' | 'finished';
type Duration = 60 | 300 | 900;

export default function TypingGame() {
  const { themeMode, accentColor } = useSettingsStore();
  const isLight = themeMode === 'light';

  const [duration, setDuration] = useState<Duration>(60);
  const [mode, setMode] = useState<'normal' | 'dev'>('normal');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [status, setStatus] = useState<GameStatus>('idle');
  
  const [targetText, setTargetText] = useState(() => generateText(50, 'normal'));
  const [typedText, setTypedText] = useState('');
  
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when clicking anywhere on the game area
  const handleFocus = () => {
    if (status !== 'finished') {
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (status === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && status === 'playing') {
      setStatus('finished');
    }
  }, [timeLeft, status]);

  // Extend target text if user is typing fast
  useEffect(() => {
    if (typedText.length > targetText.length - 20) {
      setTargetText(prev => prev + generateText(30, mode));
    }
  }, [typedText, targetText, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === 'finished') return;
    
    if (status === 'idle') {
      setStatus('playing');
    }
    
    const value = e.target.value;
    const diff = value.length - typedText.length;
    
    let newTotalStrokes = totalKeystrokes;
    let newTotalErrors = totalErrors;

    if (diff > 0) {
      newTotalStrokes += diff;
      for (let i = typedText.length; i < value.length; i++) {
        if (value[i] !== targetText[i]) newTotalErrors++;
      }
      setTotalKeystrokes(newTotalStrokes);
      setTotalErrors(newTotalErrors);
    }
    
    setTypedText(value);
    
    // Calculate live accuracy
    const acc = newTotalStrokes === 0 ? 100 : Math.round(((newTotalStrokes - newTotalErrors) / newTotalStrokes) * 100);
    setAccuracy(Math.max(0, acc));
    
    // WPM calculation based on current valid string
    let currentErrors = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== targetText[i]) currentErrors++;
    }
    setMistakes(currentErrors);
    
    const correctChars = value.length - currentErrors;
    const timeElapsedInMinutes = (duration - timeLeft) / 60;
    if (timeElapsedInMinutes > 0) {
      const calculatedWpm = Math.round((correctChars / 5) / timeElapsedInMinutes);
      setWpm(calculatedWpm);
    }
  };

  const handleRestart = () => {
    setStatus('idle');
    setTimeLeft(duration);
    setTargetText(generateText(50, mode));
    setTypedText('');
    setWpm(0);
    setAccuracy(100);
    setMistakes(0);
    setTotalKeystrokes(0);
    setTotalErrors(0);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const changeDuration = (d: Duration) => {
    setDuration(d);
    setTimeLeft(d);
    setStatus('idle');
    setTargetText(generateText(50, mode));
    setTypedText('');
    setWpm(0);
    setAccuracy(100);
    setMistakes(0);
    setTotalKeystrokes(0);
    setTotalErrors(0);
    inputRef.current?.focus();
  };

  const changeMode = (m: 'normal' | 'dev') => {
    setMode(m);
    setTimeLeft(duration);
    setStatus('idle');
    setTargetText(generateText(50, m));
    setTypedText('');
    setWpm(0);
    setAccuracy(100);
    setMistakes(0);
    setTotalKeystrokes(0);
    setTotalErrors(0);
    inputRef.current?.focus();
  };

  const renderCharacters = () => {
    const chars = [];
    const maxRender = 150; // Render only the active block to prevent DOM lag
    const startIndex = Math.max(0, typedText.length - 20);
    const endIndex = startIndex + maxRender;
    
    for (let i = startIndex; i < Math.min(targetText.length, endIndex); i++) {
      const targetChar = targetText[i];
      const typedChar = typedText[i];
      let charClass = isLight ? 'text-slate-400' : 'text-slate-600';
      let isCaret = false;
      
      if (i === typedText.length && status !== 'finished') {
        isCaret = true;
      }
      
      if (typedChar !== undefined) {
        if (typedChar === targetChar) {
          charClass = isLight ? 'text-slate-900' : 'text-slate-200';
        } else {
          charClass = 'text-red-500 bg-red-500/20 rounded-sm';
        }
      }
      
      chars.push(
        <span key={i} className={`relative ${charClass}`}>
          {targetChar === ' ' && typedChar !== undefined && typedChar !== ' ' ? '_' : targetChar}
          {isCaret && (
            <span className={`absolute left-0 bottom-0 w-full h-[3px] rounded-full animate-pulse bg-gradient-to-r ${accentColor}`}></span>
          )}
        </span>
      );
    }
    return chars;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`h-full w-full flex flex-col p-6 transition-colors ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}
      onClick={handleFocus}
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${accentColor} text-white shadow-md`}>
            <Type className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">DevType</h2>
          
          {status === 'idle' && (
            <div className={`ml-4 flex rounded-lg overflow-hidden border ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); changeMode('normal'); }}
                className={`px-3 py-1 text-xs font-bold transition-all ${mode === 'normal' ? 'bg-slate-800 text-white dark:bg-white dark:text-black' : (isLight ? 'bg-white hover:bg-slate-100 text-slate-500' : 'bg-white/5 hover:bg-white/10 text-slate-400')}`}
              >
                Normal
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); changeMode('dev'); }}
                className={`px-3 py-1 text-xs font-bold transition-all ${mode === 'dev' ? 'bg-slate-800 text-white dark:bg-white dark:text-black' : (isLight ? 'bg-white hover:bg-slate-100 text-slate-500' : 'bg-white/5 hover:bg-white/10 text-slate-400')}`}
              >
                Dev Code
              </button>
            </div>
          )}
        </div>
        
        {status === 'idle' && (
          <div className={`flex rounded-lg overflow-hidden border ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
            {[
              { val: 60, label: 'Quick (1m)' },
              { val: 300, label: 'Session (5m)' },
              { val: 900, label: 'Practice (15m)' }
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={(e) => { e.stopPropagation(); changeDuration(opt.val as Duration); }}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${duration === opt.val ? 'bg-gradient-to-r ' + accentColor + ' text-white' : (isLight ? 'bg-white hover:bg-slate-100' : 'bg-white/5 hover:bg-white/10')}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full relative">
        
        <div className={`flex justify-around w-full mb-8 p-4 rounded-2xl border backdrop-blur-md shadow-sm ${isLight ? 'bg-white/60 border-slate-200' : 'bg-black/20 border-white/10'}`}>
          <div className="text-center w-24">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Time</p>
            <p className={`text-3xl font-extrabold flex items-center justify-center gap-2 ${timeLeft <= 10 && status === 'playing' ? 'text-red-500 animate-pulse' : ''}`}>
              <Clock className="w-5 h-5 opacity-50" />
              {formatTime(timeLeft)}
            </p>
          </div>
          <div className="text-center w-24">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>WPM</p>
            <p className="text-3xl font-extrabold flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 opacity-50" />
              {wpm}
            </p>
          </div>
          <div className="text-center w-24">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Accuracy</p>
            <p className="text-3xl font-extrabold flex items-center justify-center gap-2">
              <Target className="w-5 h-5 opacity-50" />
              {accuracy}%
            </p>
          </div>
        </div>

        <div className="relative w-full">
          <input
            ref={inputRef}
            type="text"
            value={typedText}
            onChange={handleChange}
            autoFocus
            disabled={status === 'finished'}
            className="absolute opacity-0 -z-10 h-0 w-0 pointer-events-none"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />

          <div 
            className={`text-2xl md:text-4xl leading-[1.6] font-medium tracking-wide text-center select-none transition-all duration-300 overflow-hidden break-words max-h-[160px] ${status === 'finished' ? 'opacity-20 blur-[2px]' : 'opacity-100'}`}
            style={{ wordSpacing: '0.25em' }}
          >
            {renderCharacters()}
          </div>
          
          {status === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none -mt-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold animate-bounce shadow-lg ${isLight ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>
                Start typing to begin...
              </span>
            </div>
          )}

          {status === 'finished' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 animate-in zoom-in duration-300">
              <div className={`p-8 rounded-3xl border shadow-2xl flex flex-col items-center text-center ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                <h3 className="text-3xl font-black mb-2">Time's Up!</h3>
                <p className={`mb-6 text-base ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>You typed <strong className={isLight ? 'text-slate-900' : 'text-white'}>{wpm} WPM</strong> with <strong className={isLight ? 'text-slate-900' : 'text-white'}>{accuracy}%</strong> accuracy.</p>
                
                <button
                  onClick={(e) => { e.stopPropagation(); handleRestart(); }}
                  className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 bg-gradient-to-r ${accentColor}`}
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
