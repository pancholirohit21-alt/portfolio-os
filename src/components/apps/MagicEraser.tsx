'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Download, Loader2, Sparkles, RefreshCcw, Image as ImageIcon, Wand2, Crop, RotateCcw } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import FilerobotImageEditor from './FilerobotWrapper';

export default function MagicEraser() {
  const { themeMode, accentColor } = useSettingsStore();
  const isLight = themeMode === 'light';

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('image.png');
  
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      // Suppress the known 'active' attribute warning from react-filerobot-image-editor
      const originalError = console.error;
      console.error = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('for a non-boolean attribute `active`')) {
          return;
        }
        originalError.call(console, ...args);
      };
      return () => {
        console.error = originalError;
      };
    }
  }, [isEditing]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG)');
      return;
    }
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setOriginalImage(url);
    setCurrentImage(url);
  };

  const processBackgroundRemoval = async () => {
    if (!currentImage) return;
    try {
      setIsProcessingBg(true);
      setProgressText('Downloading AI model (first time only)...');
      
      const config = {
        progress: (key: string, current: number, total: number) => {
          if (key === 'compute:inference') {
            setProgressText(`Processing pixels... ${Math.round((current / total) * 100)}%`);
          } else {
            setProgressText(`Loading AI... ${key}`);
          }
        }
      };

      // We need to convert the object URL back to a blob to feed into imgly
      const response = await fetch(currentImage);
      const blobToProcess = await response.blob();

      const resultBlob = await removeBackground(blobToProcess, config);
      const url = URL.createObjectURL(resultBlob);
      setCurrentImage(url);
    } catch (err) {
      console.error(err);
      alert('Failed to process image. Please try another image.');
    } finally {
      setIsProcessingBg(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const reset = () => {
    setCurrentImage(null);
    setOriginalImage(null);
    setIsEditing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const revertToOriginal = () => {
    if (originalImage) {
      setCurrentImage(originalImage);
    }
  };

  return (
    <div className={`flex flex-col h-full w-full ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-white'}`}>
      
      {/* Header */}
      <div className={`px-6 py-4 border-b flex-shrink-0 flex items-center justify-between
        ${isLight ? 'bg-white border-slate-200' : 'bg-[#151c2c] border-white/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${accentColor} text-white shadow-lg`}>
            <Wand2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Image Studio</h1>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>AI Eraser & Advanced Editor</p>
          </div>
        </div>
        {currentImage && !isEditing && !isProcessingBg && (
          <div className="flex gap-2">
            <button 
              onClick={revertToOriginal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <RotateCcw size={16} /> Revert
            </button>
            <button 
              onClick={reset}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <RefreshCcw size={16} /> New
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center">
        
        <AnimatePresence mode="wait">
          {!currentImage ? (
            // Dropzone
            <motion.div 
              key="dropzone"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full max-w-2xl aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all m-8
                ${isDragging 
                  ? 'border-[var(--theme-accent,currentColor)] bg-[var(--theme-accent,currentColor)]/10 scale-105' 
                  : (isLight ? 'border-slate-300 hover:border-slate-400 bg-white' : 'border-white/20 hover:border-white/30 bg-black/20')}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
                accept="image/*" 
                className="hidden" 
              />
              <UploadCloud size={48} className={`mb-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
              <h2 className="text-xl font-bold mb-2">Drop an image here to start</h2>
              <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>or click to browse from your computer</p>
            </motion.div>
          ) : isProcessingBg ? (
            // Processing Background
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center max-w-md p-8"
            >
              <div className="relative mb-8">
                <div className={`absolute inset-0 blur-xl opacity-50 bg-gradient-to-r ${accentColor} animate-pulse rounded-full`}></div>
                <Loader2 size={64} className="animate-spin relative z-10 text-white mix-blend-difference" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Removing Background...</h2>
              <p className={`text-sm font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{progressText}</p>
              <p className={`text-xs mt-6 max-w-xs leading-relaxed ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                Running entirely in your browser using local AI WebAssembly.
              </p>
            </motion.div>
          ) : isEditing ? (
            // Filerobot Editor
            <motion.div 
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <FilerobotImageEditor
                source={currentImage}
                onSave={(editedImageObject, designState) => {
                  setCurrentImage(editedImageObject.imageBase64 as string);
                  setIsEditing(false);
                }}
                onClose={() => setIsEditing(false)}
                annotationsCommon={{
                  fill: '#ff0000',
                }}
                Text={{ text: 'Filerobot...' }}
                Rotate={{ angle: 90, componentType: 'slider' }}
                Crop={{
                  presetsItems: [
                    {
                      titleKey: 'classicTv',
                      descriptionKey: '4:3',
                      ratio: 4 / 3,
                    },
                    {
                      titleKey: 'cinemascope',
                      descriptionKey: '21:9',
                      ratio: 21 / 9,
                    },
                  ],
                }}
                tabsIds={['Adjust', 'Annotate', 'Watermark', 'Filters', 'Finetune']} 
                defaultTabId="Adjust"
                defaultToolId="Crop"
              />
            </motion.div>
          ) : (
            // Studio Workspace View
            <motion.div 
              key="workspace"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col h-full"
            >
              {/* Toolbar */}
              <div className={`flex gap-4 p-4 border-b justify-center items-center shadow-sm z-10
                ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/20 border-white/5'}`}>
                
                <button 
                  onClick={processBackgroundRemoval}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 bg-gradient-to-r ${accentColor}`}
                >
                  <Sparkles size={18} /> Remove Background
                </button>

                <div className={`w-px h-8 ${isLight ? 'bg-slate-300' : 'bg-white/20'}`}></div>

                <button 
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-md transition-transform hover:scale-105 active:scale-95 border
                    ${isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-600 text-white'}`}
                >
                  <Crop size={18} /> Edit Image
                </button>

                <div className={`w-px h-8 ${isLight ? 'bg-slate-300' : 'bg-white/20'}`}></div>

                <a 
                  href={currentImage} 
                  download={`edited-${fileName}`}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-md transition-transform hover:scale-105 active:scale-95 border
                    ${isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-600 text-white'}`}
                >
                  <Download size={18} /> Download
                </a>
              </div>

              {/* Canvas Preview */}
              <div className="flex-1 p-8 flex items-center justify-center overflow-auto relative">
                {/* Checkerboard pattern so transparency is visible */}
                <div className="absolute inset-8 z-0 rounded-2xl opacity-50" style={{
                  backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}></div>
                <img 
                  src={currentImage} 
                  alt="Current Workspace" 
                  className="max-w-full max-h-full object-contain relative z-10 drop-shadow-2xl rounded-lg border border-white/20" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
