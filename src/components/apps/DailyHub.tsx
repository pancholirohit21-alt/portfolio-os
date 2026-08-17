'use client';

import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudLightning, CloudRain, CloudSnow, Search, Sun, Wind, MapPin, RefreshCw, ExternalLink } from 'lucide-react';

type FeedCategory = 'Tech' | 'Business' | 'Global' | 'India';

const RSS_FEEDS: Record<FeedCategory, string> = {
  Tech: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
  Business: 'https://feeds.bbci.co.uk/news/business/rss.xml',
  Global: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  India: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml'
};

const getWeatherIcon = (code: number, size = 48) => {
  if (code <= 3) return <Sun size={size} className="text-amber-400 drop-shadow-md" />;
  if (code <= 48) return <Cloud size={size} className="text-slate-400 drop-shadow-md" />;
  if (code <= 67 || code >= 80 && code <= 82) return <CloudRain size={size} className="text-blue-400 drop-shadow-md" />;
  if (code <= 77 || code >= 85) return <CloudSnow size={size} className="text-cyan-300 drop-shadow-md" />;
  if (code >= 95) return <CloudLightning size={size} className="text-purple-400 drop-shadow-md" />;
  return <Sun size={size} className="text-amber-400" />;
};

const getWeatherDesc = (code: number) => {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67 || code >= 80 && code <= 82) return 'Rain showers';
  if (code <= 77 || code >= 85) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear sky';
};

export default function DailyHub() {
  const { themeMode, accentColor } = useSettingsStore();
  const isLight = themeMode === 'light';

  // Weather State
  const [weather, setWeather] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [city, setCity] = useState('Indore');
  const [searchQuery, setSearchQuery] = useState('');

  // News State
  const [activeTab, setActiveTab] = useState<FeedCategory>('Tech');
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // Fetch Weather
  const fetchWeather = async (lat: number, lon: number, cityName: string) => {
    try {
      setLoadingWeather(true);
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
      const data = await res.json();
      setWeather(data);
      setCity(cityName);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWeather(false);
    }
  };

  // Search City (using free geocoding API)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setLoadingWeather(true);
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const location = data.results[0];
        fetchWeather(location.latitude, location.longitude, location.name);
      } else {
        alert("City not found!");
        setLoadingWeather(false);
      }
    } catch (err) {
      console.error(err);
      setLoadingWeather(false);
    }
    setSearchQuery('');
  };

  // Fetch News
  const fetchNews = async (category: FeedCategory) => {
    try {
      setLoadingNews(true);
      const rssUrl = RSS_FEEDS[category];
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
      const data = await res.json();
      if (data.status === 'ok') {
        setNews(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    // Initial Load for Indore
    fetchWeather(22.7179, 75.8333, 'Indore');
  }, []);

  useEffect(() => {
    fetchNews(activeTab);
  }, [activeTab]);

  return (
    <div className={`flex flex-col h-full w-full ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-white'}`}>
      
      {/* Top Banner - Weather */}
      <div className={`relative p-8 border-b transition-colors flex-shrink-0 ${isLight ? 'bg-white border-slate-200' : 'bg-[#151c2c] border-white/10'}`}>
        {loadingWeather ? (
          <div className="h-32 flex items-center justify-center">
            <RefreshCw className="animate-spin text-slate-400" size={32} />
          </div>
        ) : weather ? (
          <div className="flex justify-between items-center h-32 relative z-10">
            <div className="flex items-center gap-6">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
              >
                {getWeatherIcon(weather.current_weather.weathercode, 80)}
              </motion.div>
              <div className="flex flex-col">
                <div className="flex items-end gap-3">
                  <h1 className="text-6xl font-extrabold tracking-tighter">
                    {Math.round(weather.current_weather.temperature)}°
                  </h1>
                  <span className={`text-xl font-medium pb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {getWeatherDesc(weather.current_weather.weathercode)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <MapPin size={16} className={`text-[var(--theme-accent,currentColor)]`} />
                  <h2 className="text-lg font-bold">{city}</h2>
                  <span className={`text-sm ml-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    H: {Math.round(weather.daily.temperature_2m_max[0])}° L: {Math.round(weather.daily.temperature_2m_min[0])}°
                  </span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex">
              <div className={`flex items-center px-4 py-2.5 rounded-2xl border backdrop-blur-md transition-shadow focus-within:ring-2 focus-within:ring-[var(--theme-accent,currentColor)] focus-within:ring-opacity-50
                ${isLight ? 'bg-slate-100 border-transparent text-slate-900' : 'bg-black/20 border-white/10 text-white'}
              `}>
                <Search size={18} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city..." 
                  className="bg-transparent border-none outline-none ml-2 text-sm w-40 font-medium placeholder:text-slate-400"
                />
              </div>
            </form>
          </div>
        ) : null}
        
        {/* Background Decorative Blur */}
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${accentColor} opacity-10 blur-[100px] rounded-full pointer-events-none`} />
      </div>

      {/* Main Content - News */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* Tabs */}
        <div className={`flex gap-6 px-8 pt-6 border-b flex-shrink-0 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
          {(['Tech', 'Business', 'Global', 'India'] as FeedCategory[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold relative transition-colors
                ${activeTab === tab 
                  ? (isLight ? 'text-slate-900' : 'text-white') 
                  : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300')}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-gradient-to-r ${accentColor}`}
                />
              )}
            </button>
          ))}
        </div>

        {/* News List */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            {loadingNews ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <RefreshCw className="animate-spin text-slate-400" size={32} />
              </motion.div>
            ) : (
              <motion.div 
                key="news"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {news.map((item, idx) => (
                  <a 
                    key={idx} 
                    href={item.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`block p-5 rounded-2xl border transition-all hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg
                      ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(item.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <ExternalLink size={14} className={isLight ? 'text-slate-300' : 'text-slate-600'} />
                    </div>
                    <h3 className="font-bold text-base leading-tight mb-3 line-clamp-2">{item.title}</h3>
                    
                    {/* The API sometimes returns HTML in description, we safely render a plain text version if possible or just hide it if messy */}
                    {/* BBC RSS uses basic html, line-clamp helps */}
                    <p 
                      className={`text-sm leading-relaxed line-clamp-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
