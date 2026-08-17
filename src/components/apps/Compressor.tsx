'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FileArchive, UploadCloud, AlertCircle, PlayCircle, Music, Settings, Download, Loader2 } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import imageCompression from 'browser-image-compression';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp'];
const VIDEO_EXTS = ['mp4', 'webm', 'mov'];
const AUDIO_EXTS = ['mp3', 'wav', 'm4a', 'ogg', 'aac'];
const ALLOWED_EXTS = [...IMAGE_EXTS, ...VIDEO_EXTS, ...AUDIO_EXTS];

export default function Compressor() {
  const { themeMode } = useSettingsStore();
  const isLight = themeMode === 'light';

  const [file, setFile] = useState<File | null>(null);
  const [extension, setExtension] = useState<string>('');
  const [type, setType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number, height: number } | null>(null);
  const [originalAudioBitrate, setOriginalAudioBitrate] = useState<number | null>(null);

  // Settings
  const [quality, setQuality] = useState<number>(0.7); // 0.1 to 1.0
  const [videoResolution, setVideoResolution] = useState<string>('1280x720');
  const [audioBitrate, setAudioBitrate] = useState<string>('128k');

  // Status
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Results
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState<string>('');
  const [resultSize, setResultSize] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  // Load FFmpeg automatically for videos
  const loadFfmpeg = async () => {
    if (ffmpegLoaded) return;
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on('progress', ({ progress, time }) => {
        setProgress(Math.round(progress * 100));
      });
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setFfmpegLoaded(true);
    } catch (err: any) {
      console.error("FFmpeg load error:", err);
      setError("Failed to load video compression engine. " + err.message);
    }
  };

  const handleFileSelect = (f: File) => {
    setError(null);
    setResultUrl(null);
    setProgress(0);
    setVideoDimensions(null);
    setOriginalAudioBitrate(null);

    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTS.includes(ext)) {
      setError(`Format .${ext} is not supported. Use Images, Video, or Audio.`);
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(f);
    setExtension(ext);
    setPreviewUrl(URL.createObjectURL(f));

    if (IMAGE_EXTS.includes(ext)) {
      setType('image');
    } else if (VIDEO_EXTS.includes(ext)) {
      setType('video');
      loadFfmpeg();
    } else if (AUDIO_EXTS.includes(ext)) {
      setType('audio');
      loadFfmpeg();
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleCompress = async () => {
    if (!file || !type) return;
    setIsCompressing(true);
    setError(null);
    setProgress(0);
    setResultUrl(null);

    try {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.'));

      if (type === 'image') {
        const options = {
          maxSizeMB: Math.max(0.1, file.size / (1024 * 1024) * quality),
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: quality,
          onProgress: (p: number) => setProgress(p),
        };
        const compressedFile = await imageCompression(file, options);

        const url = URL.createObjectURL(compressedFile);
        const outName = `${baseName}-compressed.${extension}`;
        setResultUrl(url);
        setResultName(outName);
        setResultSize(compressedFile.size);
      }
      else if (type === 'video') {
        if (!ffmpegLoaded) await loadFfmpeg();

        const ffmpeg = ffmpegRef.current;
        const inputName = `input.${extension}`;
        const outputName = `output.mp4`; // Always compress to mp4 for best web size

        await ffmpeg.writeFile(inputName, await fetchFile(file));

        // Build FFmpeg command
        // -vf scale: resize, -vcodec libx264: encoding, -crf: constant rate factor (lower=better, 28 is high compression)
        const crf = Math.round(35 - (quality * 20)); // quality 0.1 -> crf 33 (high comp), quality 1.0 -> crf 15 (high qual)

        await ffmpeg.exec([
          '-i', inputName,
          '-vf', `scale=${videoResolution}`,
          '-vcodec', 'libx264',
          '-crf', crf.toString(),
          '-preset', 'ultrafast',
          outputName
        ]);

        const data = await ffmpeg.readFile(outputName);
        const blob = new Blob([data], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);

        setResultUrl(url);
        setResultName(`${baseName}-compressed.mp4`);
        setResultSize(blob.size);
      }
      else if (type === 'audio') {
        if (!ffmpegLoaded) await loadFfmpeg();

        const ffmpeg = ffmpegRef.current;
        const inputName = `input.${extension}`;
        const outputName = `output.mp3`; // Always compress to mp3

        await ffmpeg.writeFile(inputName, await fetchFile(file));
        
        const args = ['-i', inputName, '-b:a', audioBitrate];
        
        // For aggressive compression, downmix to mono and reduce sample rate
        if (['64k', '32k', '16k'].includes(audioBitrate)) {
          args.push('-ac', '1'); // Mono
        }
        if (['32k', '16k'].includes(audioBitrate)) {
          args.push('-ar', '22050'); // Halve the sample rate
        }
        args.push(outputName);

        await ffmpeg.exec(args);

        const data = await ffmpeg.readFile(outputName);
        const blob = new Blob([data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);

        setResultUrl(url);
        setResultName(`${baseName}-compressed.mp3`);
        setResultSize(blob.size);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Compression failed.');
    } finally {
      setIsCompressing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`flex flex-col h-full w-full ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#0d1117] text-white'}`}>

      {/* Header */}
      <div className={`p-5 flex items-center gap-3 border-b ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-black/20'}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
          <FileArchive className="text-white" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Compressor</h2>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Image & Video Optimizer</p>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">

        {/* Dropzone */}
        {!file && (
          <>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-10 cursor-pointer transition-all
                ${isLight ? 'border-slate-300 hover:border-amber-500 hover:bg-amber-50' : 'border-slate-700 hover:border-amber-500 hover:bg-amber-500/10'}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*,audio/*"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              />
              <UploadCloud size={48} className={`mb-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
              <p className="text-lg font-medium mb-1">Upload Media to Compress</p>
              <p className={`text-sm text-center max-w-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Click to browse or drag and drop a file here.
              </p>
            </div>

            {/* Supported Formats List */}
            <div className={`p-5 rounded-2xl border text-sm mt-2 ${isLight ? 'bg-slate-100/50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileArchive size={16} className="text-amber-500" />
                Supported Formats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <strong className={`block mb-1 flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <FileArchive size={14} className="text-amber-500" /> Images
                  </strong>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>JPG, JPEG, PNG, WEBP</p>
                </div>
                <div>
                  <strong className={`block mb-1 flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <PlayCircle size={14} className="text-orange-500" /> Videos
                  </strong>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>MP4, WEBM, MOV</p>
                </div>
                <div>
                  <strong className={`block mb-1 flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <Music size={14} className="text-emerald-500" /> Audio
                  </strong>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>MP3, WAV, M4A, OGG, AAC</p>
                </div>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* File Config Area */}
        {file && (
          <div className={`p-6 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/10'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 pb-6 border-b border-white/10 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                <div className={`${type === 'video' ? 'w-full sm:w-80 aspect-video' : (type === 'audio' ? 'w-full sm:w-80 h-24' : 'w-24 h-24')} rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-black/10 border ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                  {previewUrl ? (
                    type === 'image' ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : type === 'video' ? (
                      <video
                        src={previewUrl}
                        className="w-full h-full object-contain bg-black"
                        controls
                        onLoadedMetadata={(e) => {
                          const target = e.currentTarget as HTMLVideoElement;
                          setVideoDimensions({ width: target.videoWidth, height: target.videoHeight });
                        }}
                      />
                    ) : (
                      <audio 
                        src={previewUrl} 
                        controls 
                        className="w-full px-4"
                        onLoadedMetadata={(e) => {
                          const target = e.currentTarget as HTMLAudioElement;
                          if (target.duration > 0 && file) {
                            const kbps = Math.round((file.size * 8) / target.duration / 1000);
                            setOriginalAudioBitrate(kbps);
                          }
                        }}
                      />
                    )
                  ) : (
                    type === 'image' ? <FileArchive size={32} className="text-amber-500" /> : type === 'video' ? <PlayCircle size={32} className="text-orange-500" /> : <Music size={32} className="text-emerald-500" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-lg truncate" title={file.name}>{file.name}</p>
                  <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Original Size: {formatSize(file.size)}</p>
                  {type === 'video' && file.size > 50 * 1024 * 1024 && (
                    <p className="text-amber-500 text-xs mt-1 font-medium flex items-center gap-1">
                      <AlertCircle size={12} className="flex-shrink-0" /> Large videos may take time.
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setFile(null); setResultUrl(null); setPreviewUrl(null); }}
                className={`text-sm px-3 py-1 rounded border flex-shrink-0 ${isLight ? 'border-slate-300 hover:bg-slate-100' : 'border-white/20 hover:bg-white/10'}`}
              >
                Discard
              </button>
            </div>

            <div className="space-y-6">
              {type !== 'audio' && (
                <div>
                  <div className="flex justify-between mb-2 items-end">
                    <div>
                      <label className={`block text-sm font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Quality vs Compression</label>
                      <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Estimated Size: <span className="font-semibold">{formatSize(file.size * quality)}</span>
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1" max="1" step="0.1"
                    value={quality}
                    onChange={(e) => {
                      setQuality(parseFloat(e.target.value));
                      setResultUrl(null); // Reset result when settings change
                    }}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Smallest Size</span>
                    <span>Highest Quality</span>
                  </div>
                </div>
              )}

              {type === 'video' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Output Resolution</label>
                  <select
                    value={videoResolution}
                    onChange={(e) => setVideoResolution(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-none font-medium appearance-none
                      ${isLight ? 'bg-slate-50 border-slate-300 focus:border-amber-500' : 'bg-black/40 border-white/20 focus:border-amber-500'}`}
                  >
                    {(() => {
                      const options = [
                        { val: '1920x1080', label: '1080p (FHD)', h: 1080 },
                        { val: '1280x720', label: '720p (HD)', h: 720 },
                        { val: '854x480', label: '480p (SD)', h: 480 },
                        { val: '640x360', label: '360p (Low)', h: 360 }
                      ];

                      // Filter options strictly smaller than original video height
                      let validOptions = options;
                      if (videoDimensions) {
                        validOptions = options.filter(opt => opt.h < videoDimensions.height);
                        // If video is super small, at least offer the smallest option
                        if (validOptions.length === 0) validOptions = [options[options.length - 1]];
                      }

                      // Ensure selected resolution is valid
                      if (videoDimensions && !validOptions.find(o => o.val === videoResolution)) {
                        setTimeout(() => setVideoResolution(validOptions[0].val), 0);
                      }

                      return validOptions.map(opt => (
                        <option key={opt.val} value={opt.val}>{opt.label}</option>
                      ));
                    })()}
                  </select>
                </div>
              )}

              {type === 'audio' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Output Audio Bitrate</label>
                  <select
                    value={audioBitrate}
                    onChange={(e) => {
                      setAudioBitrate(e.target.value);
                      setResultUrl(null);
                    }}
                    className={`w-full p-2.5 rounded-lg border outline-none font-medium appearance-none
                      ${isLight ? 'bg-slate-50 border-slate-300 focus:border-amber-500' : 'bg-black/40 border-white/20 focus:border-amber-500'}`}
                  >
                    {(() => {
                      const options = [
                        { val: '320k', label: '320 kbps (High Quality)', num: 320 },
                        { val: '256k', label: '256 kbps (Good Quality)', num: 256 },
                        { val: '192k', label: '192 kbps (Standard)', num: 192 },
                        { val: '128k', label: '128 kbps (Good Compression)', num: 128 },
                        { val: '96k', label: '96 kbps (High Compression)', num: 96 },
                        { val: '64k', label: '64 kbps (Max Compression)', num: 64 },
                        { val: '32k', label: '32 kbps (Radio Quality)', num: 32 },
                        { val: '16k', label: '16 kbps (Extreme Compression)', num: 16 }
                      ];

                      let validOptions = options;
                      if (originalAudioBitrate) {
                        // Filter options strictly smaller than original bitrate
                        validOptions = options.filter(opt => opt.num < originalAudioBitrate);
                        if (validOptions.length === 0) validOptions = [options[options.length - 1]];
                      }

                      // Ensure selected bitrate is valid
                      if (originalAudioBitrate && !validOptions.find(o => o.val === audioBitrate)) {
                        setTimeout(() => setAudioBitrate(validOptions[0].val), 0);
                      }

                      return validOptions.map(opt => (
                        <option key={opt.val} value={opt.val}>{opt.label}</option>
                      ));
                    })()}
                  </select>
                </div>
              )}

              {/* Compress Button */}
              {!resultUrl && (
                <button
                  onClick={handleCompress}
                  disabled={isCompressing || ((type === 'video' || type === 'audio') && !ffmpegLoaded)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold flex justify-center items-center gap-2 disabled:opacity-50 transition-all shadow-md"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {(type === 'video' || type === 'audio') ? `Compressing (${progress}%)...` : 'Optimizing Image...'}
                    </>
                  ) : (
                    <>
                      <Settings size={20} />
                      {(type === 'video' || type === 'audio') && !ffmpegLoaded ? 'Loading Engine...' : 'Start Compression'}
                    </>
                  )}
                </button>
              )}

              {/* Result Area */}
              {resultUrl && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-emerald-500 font-bold flex items-center gap-2">
                      Success!
                      <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/20">
                        Saved {formatSize(file.size - resultSize)}
                      </span>
                    </p>
                    <p className={`text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>New Size: {formatSize(resultSize)}</p>
                  </div>

                  <a
                    href={resultUrl}
                    download={resultName}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md"
                  >
                    <Download size={18} /> Download
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
