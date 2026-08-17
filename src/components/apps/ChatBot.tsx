'use client';
import { useState, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Bot, Send, User, Mic } from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

export default function ChatBot() {
  const { themeMode, accentColor } = useSettingsStore();
  const isLight = themeMode === 'light';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hi! I'm Virtual Rohit. Ask me anything about Rohit's skills, experience, projects, or education!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setInputValue(transcript);
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const analyzeMessage = (text: string): string => {
    const lower = text.toLowerCase();

    if (lower.includes('skill') || lower.includes('tech') || lower.includes('stack')) {
      return "Rohit's tech stack includes Angular (v8-15), React, Next.js, Node.js, Spring Boot, MySQL, and PostgreSQL. He's highly skilled in building scalable frontends and managing complex state.";
    }

    if (lower.includes('experience') || lower.includes('work') || lower.includes('job') || lower.includes('company')) {
      return "Rohit is currently a Senior Software Developer at Iwin Labs (Nov 2025 - Present) leading a team of 5+ engineers building iGaming apps. Previously, he was at Centricity Wealth Tech (Apr 2024 - Oct 2025) building fintech platforms like One-Sure and One Digital, and ERP at Amstech Inc (Aug 2021 - Feb 2024).";
    }

    if (lower.includes('education') || lower.includes('degree') || lower.includes('college') || lower.includes('university')) {
      return "Rohit holds a Bachelor of Engineering in Information Technology from Swami Vivekananda College of Engineering, Indore (2016 - 2020).";
    }

    if (lower.includes('language') || lower.includes('speak')) {
      return "Rohit is fluent in both Hindi and English.";
    }

    if (lower.includes('project') || lower.includes('portfolio') || lower.includes('built')) {
      return "Rohit has built numerous major projects including: 'Learning 1080' (EdTech), 'OfferSA' (Multilingual Insurance app), 'CMS IIM Indore', 'HRMS', 'One Digital' (Fintech app with STT/TTS chatbot), 'One Sure' (Insurance platform), and iGaming platforms like 'Lady Lucka' and 'Rush of Gold'.";
    }

    if (lower.includes('contact') || lower.includes('email') || lower.includes('phone') || lower.includes('hire')) {
      return "You can reach Rohit via email at pancholirohit21@gmail.com, or call him at +91 7987228496. He's based in Indore, Madhya Pradesh.";
    }

    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      return "Hello there! How can I help you learn more about Rohit today?";
    }

    if (lower.includes('who are you') || lower.includes('what are you')) {
      return "I am a virtual AI assistant built by Rohit to answer questions about his professional background. I'm running right here in your browser!";
    }

    return "That's an interesting question! While I don't have a specific answer for that, I can definitely tell you about Rohit's skills, experience, or projects. What would you like to know?";
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate network delay and AI processing
    setTimeout(() => {
      const responseText = analyzeMessage(userText);
      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800); // 1.2s to 2s random delay
  };

  return (
    <div className={`flex flex-col h-full w-full font-sans transition-colors ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>

      {/* Header */}
      <div className={`flex items-center px-6 py-4 border-b ${isLight ? 'border-slate-200 bg-white/50' : 'border-white/10 bg-black/20'} backdrop-blur-md sticky top-0 z-10`}>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${accentColor} mr-4 shadow-md`}>
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Virtual Rohit</h2>
          <p className={`text-xs flex items-center ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            Online • Ask me anything
          </p>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex max-w-[85%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>

                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAi ? 'mr-3' : 'ml-3'} ${isAi ? `bg-gradient-to-br ${accentColor} text-white` : (isLight ? 'bg-slate-200 text-slate-500' : 'bg-slate-800 text-slate-400')}`}>
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div>
                  <div className={`px-4 py-3 rounded-2xl ${isAi
                    ? (isLight ? 'bg-white border border-slate-200 shadow-sm text-slate-700' : 'bg-white/10 border border-white/5 text-slate-200')
                    : `bg-gradient-to-br ${accentColor} text-white shadow-md`
                    }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <p className={`text-[10px] mt-1.5 px-2 ${isAi ? 'text-left' : 'text-right'} ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex max-w-[80%] flex-row">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3 bg-gradient-to-br ${accentColor} text-white`}>
                <Bot className="w-4 h-4" />
              </div>
              <div className={`px-4 py-4 rounded-2xl flex items-center gap-1.5 ${isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-white/10 border border-white/5'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
        <form onSubmit={handleSendMessage} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about my skills, experience, or projects..."
            className={`w-full pl-4 pr-24 py-3 rounded-xl outline-none text-sm transition-all ${isLight ? 'bg-slate-100 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200' : 'bg-slate-800 placeholder:text-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-slate-700'}`}
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={startListening}
              className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : (isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-black/5' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5')}`}
              title="Use microphone"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`p-2 rounded-lg transition-colors ${!inputValue.trim() || isTyping ? 'opacity-30 cursor-not-allowed text-slate-500' : (isLight ? 'text-indigo-600 hover:bg-indigo-50' : 'text-indigo-400 hover:bg-indigo-500/20')}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
