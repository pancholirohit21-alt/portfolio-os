'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FileArchive, UploadCloud, AlertCircle, PlayCircle, Music, Settings, Download, Loader2, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import imageCompression from 'browser-image-compression';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp'];
const VIDEO_EXTS = ['mp4', 'webm', 'mov'];
const AUDIO_EXTS = ['mp3', 'wav', 'm4a', 'ogg', 'aac'];
const ALLOWED_EXTS = [...IMAGE_EXTS, ...VIDEO_EXTS, ...AUDIO_EXTS];

type QueueItem = {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio';
  extension: string;
  status: 'pending' | 'compressing' | 'done' | 'error';
  progress: number;
  error?: string;
  previewUrl: string;
  resultUrl?: string;
  resultName?: string;
  originalSize: number;
  resultSize?: number;
  originalAudioBitrate?: number;
  videoDimensions?: { width: number, height: number };
};

export default function Compressor() {
  const { themeMode } = useSettingsStore();
  const isLight = themeMode === 'light';

  const [queue, setQueue] = useState<QueueItem[]>([]);

  // Global Settings
  const [quality, setQuality] = useState<number>(0.7); // 0.1 to 1.0
  const [videoResolution, setVideoResolution] = useState<string>('1280x720');
  const [audioBitrate, setAudioBitrate] = useState<string>('128k');

  // Status
  const [isCompressing, setIsCompressing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  // Cleanup ObjectURLs on unmount
  useEffect(() => {
    return () => {
      queue.forEach(item => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
      });
    };
  }, [queue]);

  // Load FFmpeg automatically for videos/audio
  const loadFfmpeg = async () => {
    if (ffmpegLoaded) return;
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setFfmpegLoaded(true);
    } catch (err: any) {
      console.error("FFmpeg load error:", err);
      setGlobalError("Failed to load compression engine. " + err.message);
    }
  };

  const handleFilesSelect = (files: FileList | File[]) => {
    setGlobalError(null);
    const newItems: QueueItem[] = [];
    let hasVideoOrAudio = false;

    Array.from(files).forEach((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      if (!ALLOWED_EXTS.includes(ext)) return;

      let type: 'image' | 'video' | 'audio' | null = null;
      if (IMAGE_EXTS.includes(ext)) type = 'image';
      else if (VIDEO_EXTS.includes(ext)) { type = 'video'; hasVideoOrAudio = true; }
      else if (AUDIO_EXTS.includes(ext)) { type = 'audio'; hasVideoOrAudio = true; }

      if (type) {
        newItems.push({
          id: Math.random().toString(36).substring(7),
          file: f,
          type,
          extension: ext,
          status: 'pending',
          progress: 0,
          previewUrl: URL.createObjectURL(f),
          originalSize: f.size
        });
      }
    });

    if (newItems.length > 0) {
      setQueue(prev => [...prev, ...newItems]);
      if (hasVideoOrAudio) {
        loadFfmpeg();
      }
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const autoDownload = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const processQueue = async () => {
    if (isCompressing) return;
    setIsCompressing(true);
    setGlobalError(null);

    // Snapshot of the current pending items to process
    const itemsToProcess = queue.filter(q => q.status === 'pending');

    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      
      const updateItem = (updates: Partial<QueueItem>) => {
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, ...updates } : q));
      };

      updateItem({ status: 'compressing', progress: 0, error: undefined });

      try {
        const baseName = item.file.name.substring(0, item.file.name.lastIndexOf('.'));

        if (item.type === 'image') {
          const options = {
            maxSizeMB: Math.max(0.1, item.file.size / (1024 * 1024) * quality),
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: quality,
            onProgress: (p: number) => updateItem({ progress: p }),
          };
          const compressedFile = await imageCompression(item.file, options);
          const url = URL.createObjectURL(compressedFile);
          const outName = `${baseName}-compressed.${item.extension}`;

          updateItem({ status: 'done', progress: 100, resultUrl: url, resultName: outName, resultSize: compressedFile.size });
          autoDownload(url, outName);
        }
        else if (item.type === 'video') {
          if (!ffmpegLoaded) await loadFfmpeg();
          const ffmpeg = ffmpegRef.current;
          
          const progressHandler = ({ progress }: any) => {
            updateItem({ progress: Math.round(progress * 100) });
          };
          ffmpeg.on('progress', progressHandler);

          const inputName = `input_${item.id}.${item.extension}`;
          const outputName = `output_${item.id}.mp4`;

          await ffmpeg.writeFile(inputName, await fetchFile(item.file));
          const crf = Math.round(35 - (quality * 20));

          await ffmpeg.exec([
            '-i', inputName,
            '-vf', `scale=${videoResolution}`,
            '-vcodec', 'libx264',
            '-crf', crf.toString(),
            '-preset', 'ultrafast',
            outputName
          ]);

          ffmpeg.off('progress', progressHandler);

          const data = await ffmpeg.readFile(outputName);
          const blob = new Blob([data as any], { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
          const outName = `${baseName}-compressed.mp4`;

          updateItem({ status: 'done', progress: 100, resultUrl: url, resultName: outName, resultSize: blob.size });
          autoDownload(url, outName);

          await ffmpeg.deleteFile(inputName).catch(() => {});
          await ffmpeg.deleteFile(outputName).catch(() => {});
        }
        else if (item.type === 'audio') {
          if (!ffmpegLoaded) await loadFfmpeg();
          const ffmpeg = ffmpegRef.current;
          
          const progressHandler = ({ progress }: any) => {
            updateItem({ progress: Math.round(progress * 100) });
          };
          ffmpeg.on('progress', progressHandler);

          const inputName = `input_${item.id}.${item.extension}`;
          const outputName = `output_${item.id}.mp3`;

          await ffmpeg.writeFile(inputName, await fetchFile(item.file));
          const args = ['-i', inputName, '-b:a', audioBitrate];
          if (['64k', '32k', '16k'].includes(audioBitrate)) {
            args.push('-ac', '1');
            args.push('-ar', '22050');
          }
          args.push(outputName);

          await ffmpeg.exec(args);

          ffmpeg.off('progress', progressHandler);

          const data = await ffmpeg.readFile(outputName);
          const blob = new Blob([data as any], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(blob);
          const outName = `${baseName}-compressed.mp3`;

          updateItem({ status: 'done', progress: 100, resultUrl: url, resultName: outName, resultSize: blob.size });
          autoDownload(url, outName);

          await ffmpeg.deleteFile(inputName).catch(() => {});
          await ffmpeg.deleteFile(outputName).catch(() => {});
        }
      } catch (err: any) {
        console.error(err);
        updateItem({ status: 'error', error: err.message || 'Compression failed.' });
      }
    }

    setIsCompressing(false);
  };

  const removeItem = (id: string) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasPending = queue.some(q => q.status === 'pending');
  const hasVideoOrAudio = queue.some(q => q.type === 'video' || q.type === 'audio');

  return (
    <div className={`flex flex-col h-full w-full ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#0d1117] text-white'}`}>
      {/* Header */}
      <div className={`p-5 flex items-center gap-3 border-b ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-black/20'}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
          <FileArchive className="text-white" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Compressor</h2>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Batch Optimizer for Media Files</p>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
        {/* File Config Area (Global Settings) */}
        {queue.length > 0 && (
          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/10'}`}>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings size={18} className="text-amber-500" /> Compression Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quality Slider (Images & Video CRF) */}
              <div className="col-span-1">
                <div className="flex justify-between mb-2 items-end">
                  <label className={`block text-sm font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Quality Target</label>
                  <span className={`text-sm font-bold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1" max="1" step="0.1"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                  disabled={isCompressing}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Smallest Size</span>
                  <span>Highest Quality</span>
                </div>
              </div>

              {/* Video Resolution */}
              <div className="col-span-1">
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Video Max Resolution</label>
                <select
                  value={videoResolution}
                  onChange={(e) => setVideoResolution(e.target.value)}
                  disabled={isCompressing}
                  className={`w-full p-2.5 rounded-lg border outline-none font-medium appearance-none
                    ${isLight ? 'bg-slate-50 border-slate-300 focus:border-amber-500' : 'bg-black/40 border-white/20 focus:border-amber-500'}`}
                >
                  <option value="1920x1080">1080p (FHD)</option>
                  <option value="1280x720">720p (HD)</option>
                  <option value="854x480">480p (SD)</option>
                  <option value="640x360">360p (Low)</option>
                </select>
              </div>

              {/* Audio Bitrate */}
              <div className="col-span-1">
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Audio Bitrate</label>
                <select
                  value={audioBitrate}
                  onChange={(e) => setAudioBitrate(e.target.value)}
                  disabled={isCompressing}
                  className={`w-full p-2.5 rounded-lg border outline-none font-medium appearance-none
                    ${isLight ? 'bg-slate-50 border-slate-300 focus:border-amber-500' : 'bg-black/40 border-white/20 focus:border-amber-500'}`}
                >
                  <option value="320k">320 kbps (High)</option>
                  <option value="256k">256 kbps (Good)</option>
                  <option value="192k">192 kbps (Standard)</option>
                  <option value="128k">128 kbps (Compression)</option>
                  <option value="96k">96 kbps (High Comp)</option>
                  <option value="64k">64 kbps (Max Comp)</option>
                </select>
              </div>
            </div>
            
            {hasPending && (
              <button
                onClick={processQueue}
                disabled={isCompressing || (hasVideoOrAudio && !ffmpegLoaded)}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold flex justify-center items-center gap-2 disabled:opacity-50 transition-all shadow-md"
              >
                {isCompressing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing Queue...
                  </>
                ) : (
                  <>
                    <Settings size={20} />
                    {(hasVideoOrAudio && !ffmpegLoaded) ? 'Loading Engine...' : `Start Compression (${queue.filter(q => q.status === 'pending').length} files)`}
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Global Error */}
        {globalError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            <AlertCircle size={16} />
            {globalError}
          </div>
        )}

        {/* Upload Area (always visible at top when empty, below config otherwise) */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => !isCompressing && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all
            ${isCompressing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${isLight ? 'border-slate-300 hover:border-amber-500 hover:bg-amber-50' : 'border-slate-700 hover:border-amber-500 hover:bg-amber-500/10'}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*,audio/*"
            multiple
            onChange={(e) => e.target.files && handleFilesSelect(e.target.files)}
          />
          <UploadCloud size={40} className={`mb-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          <p className="text-lg font-medium mb-1">Add More Files</p>
          <p className={`text-sm text-center max-w-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Select multiple images, videos, or audio files.
          </p>
        </div>

        {/* Queue List */}
        {queue.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold px-1 flex justify-between items-center">
              <span>Compression Queue</span>
              {queue.length > 0 && !isCompressing && (
                <button 
                  onClick={() => setQueue([])}
                  className={`text-xs px-2 py-1 rounded border ${isLight ? 'border-slate-300 hover:bg-slate-200' : 'border-slate-700 hover:bg-slate-800'}`}
                >
                  Clear All
                </button>
              )}
            </h3>
            
            {queue.map((item) => (
              <div key={item.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-4 items-center relative overflow-hidden
                ${isLight ? 'bg-white border-slate-200' : 'bg-[#161b22] border-slate-800'}`}
              >
                {/* Progress background bar */}
                {item.status === 'compressing' && (
                  <div 
                    className="absolute inset-0 bg-amber-500/5 z-0 transition-all duration-300" 
                    style={{ width: `${item.progress}%` }} 
                  />
                )}

                <div className="z-10 w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center bg-black/10 border border-white/5 overflow-hidden">
                  {item.type === 'image' ? (
                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                  ) : item.type === 'video' ? (
                    <PlayCircle size={24} className="text-orange-500" />
                  ) : (
                    <Music size={24} className="text-emerald-500" />
                  )}
                </div>

                <div className="z-10 flex-1 min-w-0 w-full">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium truncate pr-4 text-sm" title={item.file.name}>{item.file.name}</p>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {item.status === 'pending' && <span className="text-xs text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded">Pending</span>}
                      {item.status === 'compressing' && <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> {item.progress}%</span>}
                      {item.status === 'done' && <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 size={12} /> Done</span>}
                      {item.status === 'error' && <span className="text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1"><XCircle size={12} /> Error</span>}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{formatSize(item.originalSize)} {item.resultSize ? `→ ${formatSize(item.resultSize)}` : ''}</span>
                    {item.status === 'done' && item.resultSize && (
                      <span className="text-emerald-500 font-medium">
                        Saved {Math.round((1 - item.resultSize / item.originalSize) * 100)}%
                      </span>
                    )}
                  </div>
                  
                  {item.error && <p className="text-red-500 text-xs mt-1 truncate">{item.error}</p>}
                </div>

                <div className="z-10 flex-shrink-0 flex items-center gap-2">
                  {item.status === 'done' && item.resultUrl && (
                    <a
                      href={item.resultUrl}
                      download={item.resultName}
                      className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                      title="Download manually"
                    >
                      <Download size={16} />
                    </a>
                  )}
                  {(!isCompressing || item.status === 'done' || item.status === 'error') && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className={`p-2 rounded-lg transition-colors
                        ${isLight ? 'hover:bg-red-50 text-slate-400 hover:text-red-500' : 'hover:bg-red-500/10 text-slate-500 hover:text-red-500'}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
