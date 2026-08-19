import React, { useState, useEffect, useRef, memo } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { Play, Pause, SkipForward, SkipBack, Shuffle, ListVideo, Music } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

// Playlist categories
const PLAYLISTS = [
  { id: 'PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i', name: 'Global Top 100', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80' },
  { id: 'PL4fGSI1pDJn4pTWyM3t61lOyZ6_4jcNOw', name: 'India Top 100', cover: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=500&q=80' },
  { id: 'PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4', name: 'Truck Wala (90s)', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' }
];

// --- Extracted ProgressBar to prevent main component from re-rendering every 1s ---
const ProgressBar = memo(({ player, duration }: { player: YouTubePlayer | null, duration: number }) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!player) return;
    const interval = setInterval(() => {
      // Poll YouTube player for current time
      const time = player.getCurrentTime();
      if (typeof time === 'number') {
        setCurrentTime(time);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [player]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (player) {
      player.seekTo(time, true);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-xs sm:max-w-md flex flex-col gap-2 mb-6 sm:mb-8 px-4">
      <input 
        type="range" 
        min="0" 
        max={duration || 100} 
        value={currentTime ?? 0} 
        onChange={handleSeek}
        className="w-full h-1.5 bg-slate-500/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full transition-all hover:[&::-webkit-slider-thumb]:scale-125"
      />
      <div className="flex justify-between text-xs opacity-60 font-medium">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
});
ProgressBar.displayName = 'ProgressBar';

const MusicPlayer: React.FC = () => {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState(PLAYLISTS[0]);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'categories' | 'queue'>('categories');
  const [trackInfo, setTrackInfo] = useState({ title: 'Loading...', artist: 'Please wait', videoId: '' });
  const [playlistTracks, setPlaylistTracks] = useState<string[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const { themeMode } = useSettingsStore();
  const isLight = themeMode === 'light';

  // YouTube player options - dynamically update based on current playlist
  const opts: YouTubeProps['opts'] = {
    height: '200',
    width: '200',
    playerVars: {
      autoplay: 1,
      listType: 'playlist',
      list: currentPlaylist.id,
    },
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
    event.target.setShuffle(isShuffle);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 1 is PLAYING, 2 is PAUSED, 0 is ENDED
    if (event.data === 1) {
      setIsPlaying(true);
      setDuration(event.target.getDuration());
      
      // Attempt to get video data
      const videoData = event.target.getVideoData();
      if (videoData) {
        setTrackInfo({
          title: videoData.title || 'Unknown Track',
          artist: videoData.author || 'Unknown Artist',
          videoId: videoData.video_id || ''
        });
      }

      // Update playlist queue info
      const tracks = event.target.getPlaylist() || [];
      if (tracks.length > 0 && tracks.length !== playlistTracks.length) {
        setPlaylistTracks(tracks);
      }
      setCurrentTrackIndex(event.target.getPlaylistIndex());
    } else {
      setIsPlaying(false);
    }
  };

  const onError: YouTubeProps['onError'] = (event) => {
    // 101 or 150 means the video cannot be embedded (copyright/permissions)
    if (event.data === 101 || event.data === 150) {
      console.warn('Video cannot be embedded, skipping to next...', event.data);
      event.target.nextVideo();
    } else {
      console.error('YouTube Player Error:', event.data);
      setTrackInfo({ title: 'Playback Error', artist: 'Please try another playlist' });
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const nextTrack = () => {
    if (player) player.nextVideo();
  };

  const prevTrack = () => {
    if (player) player.previousVideo();
  };

  const toggleShuffle = () => {
    const newShuffle = !isShuffle;
    setIsShuffle(newShuffle);
    if (player) {
      player.setShuffle(newShuffle);
    }
  };

  const selectPlaylist = (playlist: typeof PLAYLISTS[0]) => {
    setCurrentPlaylist(playlist);
    setShowPlaylists(false);
    setPlaylistTracks([]); // Clear the queue visually while it loads
    setTrackInfo({ title: 'Loading...', artist: 'Fetching tracks...', videoId: '' });
    setIsPlaying(false);
    // Note: We don't manually call player.loadPlaylist anymore.
    // Changing currentPlaylist.id forces the YouTube component to completely remount with the new playlist ID!
  };

  return (
    <div className={`relative w-full h-full flex overflow-hidden transition-colors duration-300 ${isLight ? 'bg-slate-100/80 text-slate-900' : 'bg-slate-900/80 text-white'} backdrop-blur-xl`}>
      {/* Hidden Player - Non-zero dimensions are CRITICAL to prevent YouTube anti-fraud pausing */}
      <div className="absolute opacity-0 pointer-events-none w-48 h-48 z-[-10] overflow-hidden">
        <YouTube key={currentPlaylist.id} opts={opts} onReady={onReady} onStateChange={onStateChange} onError={onError} />
      </div>

      {/* Main Player Area */}
      <div className="flex-1 w-full min-w-0 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        
        {/* Top bar with Toggle Playlist */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold tracking-tight opacity-80 flex items-center gap-2">
            <Music size={20} />
            {currentPlaylist.name}
          </h2>
          <button 
            onClick={() => { setShowPlaylists(!showPlaylists); setSidebarTab('categories'); }}
            className={`p-2 rounded-full transition-colors ${showPlaylists && sidebarTab === 'categories' ? 'bg-indigo-500 text-white' : 'hover:bg-slate-500/20'}`}
          >
            <ListVideo size={20} />
          </button>
        </div>

        {/* Spinning Disc */}
        <div className="relative mb-6 sm:mb-10 mt-12 sm:mt-8 flex-shrink-0">
          <div className={`w-48 h-48 sm:w-64 sm:h-64 rounded-full shadow-2xl overflow-hidden border-[6px] sm:border-8 ${isLight ? 'border-white/50' : 'border-black/50'} relative will-change-transform ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
            {/* Record grooves */}
            <div className="absolute inset-0 border-[30px] sm:border-[40px] border-black/80 rounded-full z-10 pointer-events-none box-border" style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}></div>
            {/* Inner sticker */}
            <img src={trackInfo.videoId ? `https://i.ytimg.com/vi/${trackInfo.videoId}/hqdefault.jpg` : currentPlaylist.cover} alt="Cover" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-40 sm:h-40 rounded-full object-cover z-0" />
            {/* Center hole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-slate-200 rounded-full z-20 shadow-inner"></div>
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-6 w-full max-w-[90%] sm:max-w-[80%] px-4">
          <h3 className="text-xl sm:text-2xl font-bold truncate">{trackInfo.title}</h3>
          <p className="text-sm sm:text-lg opacity-70 truncate mt-1">{trackInfo.artist}</p>
        </div>

        {/* Progress Bar */}
        <ProgressBar player={player} duration={duration} />

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleShuffle} 
            className={`p-3 rounded-full transition-colors ${isShuffle ? 'text-indigo-500' : 'opacity-60 hover:opacity-100 hover:bg-slate-500/10'}`}
          >
            <Shuffle size={20} />
          </button>
          
          <button 
            onClick={prevTrack}
            className="p-3 opacity-80 hover:opacity-100 hover:bg-slate-500/10 rounded-full transition-colors"
          >
            <SkipBack size={24} />
          </button>
          
          <button 
            onClick={togglePlay}
            className="p-5 bg-indigo-500 text-white hover:bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/30 transition-transform active:scale-95"
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          
          <button 
            onClick={nextTrack}
            className="p-3 opacity-80 hover:opacity-100 hover:bg-slate-500/10 rounded-full transition-colors"
          >
            <SkipForward size={24} />
          </button>
          
          <div className="w-[44px]"></div> {/* Spacer to balance shuffle button */}
        </div>

      </div>

      {/* Playlists Sidebar Overlay */}
      <div className={`absolute top-0 right-0 bottom-0 w-72 backdrop-blur-3xl shadow-2xl transition-transform duration-300 z-50 flex flex-col ${showPlaylists ? 'translate-x-0' : 'translate-x-full'} ${isLight ? 'bg-white/90 border-l border-slate-200' : 'bg-slate-950/90 border-l border-slate-800'}`}>
        <div className="p-4 border-b border-slate-500/20 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Menu</h3>
            <button onClick={() => setShowPlaylists(false)} className="opacity-60 hover:opacity-100">✕</button>
          </div>
          <div className="flex bg-slate-500/10 rounded-lg p-1">
            <button 
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${sidebarTab === 'categories' ? (isLight ? 'bg-white shadow' : 'bg-slate-800 shadow') : 'opacity-70'}`}
              onClick={() => setSidebarTab('categories')}
            >Categories</button>
            <button 
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${sidebarTab === 'queue' ? (isLight ? 'bg-white shadow' : 'bg-slate-800 shadow') : 'opacity-70'}`}
              onClick={() => setSidebarTab('queue')}
            >Queue</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {sidebarTab === 'categories' && PLAYLISTS.map(list => (
            <button 
              key={list.id}
              onClick={() => selectPlaylist(list)}
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors text-left ${currentPlaylist.id === list.id ? (isLight ? 'bg-indigo-100' : 'bg-indigo-900/40') : 'hover:bg-slate-500/10'}`}
            >
              <img src={list.cover} alt={list.name} className="w-12 h-12 rounded-md object-cover shadow-sm" />
              <div className="flex-1 overflow-hidden">
                <p className={`font-medium truncate ${currentPlaylist.id === list.id ? 'text-indigo-500' : ''}`}>{list.name}</p>
                <p className="text-xs opacity-60 truncate">YouTube Playlist</p>
              </div>
            </button>
          ))}

          {sidebarTab === 'queue' && playlistTracks.length > 0 && playlistTracks.map((videoId, idx) => (
            <button 
              key={`${videoId}-${idx}`}
              onClick={() => player?.playVideoAt(idx)}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${currentTrackIndex === idx ? (isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-900/40 text-indigo-300') : 'hover:bg-slate-500/10'}`}
            >
              <div className="w-6 text-xs opacity-50 text-right">{idx + 1}</div>
              <img src={`https://i.ytimg.com/vi/${videoId}/default.jpg`} alt={`Track ${idx + 1}`} className="w-10 h-10 rounded object-cover" />
              <div className="flex-1 overflow-hidden">
                <p className="font-medium text-sm truncate">Track {idx + 1}</p>
                <p className="text-[10px] opacity-60 truncate">YouTube</p>
              </div>
            </button>
          ))}

          {sidebarTab === 'queue' && playlistTracks.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-sm opacity-50 text-center px-4">
              Queue is empty or still loading from YouTube...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
