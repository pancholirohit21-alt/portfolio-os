'use client';
import { useState, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Bot, Send, User, Mic, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AIAssistant() {
  const { themeMode, accentColor } = useSettingsStore();
  const isLight = themeMode === 'light';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hi! I'm AI Assistant, your personal guide for this Portfolio OS. I can tell you all about Rohit's work experience, his projects, or how this custom OS works. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
      setInput(transcript);
    };
    
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        alert("Microphone access was denied. Please allow microphone access in your browser settings to use voice typing.");
      } else {
        console.warn("Speech recognition error:", event.error);
      }
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Skip the first initial greeting message from the model
          messages: [...messages.slice(1), userMessage],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      setMessages((prev) => [...prev, { role: 'model', content: data.response }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: `Error: ${error.message}. Please check your API key and connection.` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full transition-colors ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#1e1e1e] text-slate-200'}`}>
      {/* Header */}
      <div className={`flex items-center gap-3 p-4 border-b ${isLight ? 'bg-white border-slate-200' : 'bg-black/20 border-white/10'}`}>
        <div className={`p-2 rounded-xl bg-gradient-to-br ${accentColor} shadow-lg`}>
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg">AI Assistant</h2>
          <p className={`text-xs font-medium flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            This is a real AI chat bot powered by Google's AI model
          </p>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : `bg-gradient-to-br ${accentColor} text-white shadow-md`
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white rounded-tr-sm'
                : `${isLight ? 'bg-white shadow-sm border border-slate-100' : 'bg-[#2d2d2d] border border-white/5'} rounded-tl-sm`
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed text-sm">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${accentColor} text-white shadow-md`}>
              <Bot size={16} />
            </div>
            <div className={`rounded-2xl p-4 rounded-tl-sm flex items-center gap-1.5 ${isLight ? 'bg-white shadow-sm border border-slate-100' : 'bg-[#2d2d2d] border border-white/5'}`}>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${isLight ? 'bg-white border-slate-200' : 'bg-black/20 border-white/10'}`}>
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask me anything..."}
              className={`w-full py-3 pl-4 pr-12 rounded-xl border outline-none transition-all ${
                isLight 
                  ? 'bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100' 
                  : 'bg-[#1e1e1e] border-white/10 focus:border-blue-500 text-white placeholder-slate-500'
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={startListening}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'text-red-500 bg-red-50 dark:bg-red-500/10 animate-pulse' 
                  : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10'
              }`}
              disabled={isLoading}
            >
              <Mic size={18} />
            </button>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl transition-all ${
              !input.trim() || isLoading
                ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/5' 
                : `bg-gradient-to-r ${accentColor} text-white shadow-md hover:shadow-lg hover:opacity-90`
            }`}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
