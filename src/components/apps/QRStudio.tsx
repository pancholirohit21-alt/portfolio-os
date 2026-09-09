'use client';

import React, { useState, useRef } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { QrCode, Download, Link, Type, Palette, Image as ImageIcon, Layers } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function QRStudio() {
  const { themeMode, accentColor } = useSettingsStore();
  const isLight = themeMode === 'light';

  const [qrValue, setQrValue] = useState('https://rohitpancholi.com');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // Bulk generation state
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://rai2.me/c/');
  const [startSeries, setStartSeries] = useState<number>(1200);
  const [endSeries, setEndSeries] = useState<number>(1299);
  const [isGenerating, setIsGenerating] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // Create padding for the downloaded image
      const padding = 40;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;
      
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, padding, padding);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "QR_Code.png";
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleBulkDownload = async () => {
    if (!baseUrl || startSeries > endSeries) return;
    setIsGenerating(true);
    try {
      const zip = new JSZip();
      
      const generateQRCanvas = async (text: string): Promise<HTMLCanvasElement> => {
        return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          QRCode.toCanvas(canvas, text, {
            color: { dark: fgColor, light: bgColor },
            width: 800,
            margin: 2
          }, (error) => {
            if (error) return reject(error);
            if (logoUrl) {
              const ctx = canvas.getContext('2d');
              const img = new Image();
              img.onload = () => {
                const logoSize = 160;
                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;
                if (ctx) {
                  ctx.fillStyle = bgColor;
                  ctx.fillRect(x - 10, y - 10, logoSize + 20, logoSize + 20);
                  ctx.drawImage(img, x, y, logoSize, logoSize);
                }
                resolve(canvas);
              };
              img.onerror = () => resolve(canvas);
              img.src = logoUrl;
            } else {
              resolve(canvas);
            }
          });
        });
      };

      for (let i = startSeries; i <= endSeries; i++) {
        const url = `${baseUrl}${i}`;
        const canvas = await generateQRCanvas(url);
        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.split(',')[1];
        zip.file(`${i}.png`, base64Data, { base64: true });
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `QRCodes_${startSeries}_to_${endSeries}.zip`);
    } catch (e) {
      console.error('Failed to generate zip', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  return (
    <div className={`flex flex-col h-full w-full ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-white'}`}>
      
      {/* Header */}
      <div className={`px-6 py-4 border-b flex-shrink-0 flex items-center justify-between
        ${isLight ? 'bg-white border-slate-200' : 'bg-[#151c2c] border-white/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${accentColor} text-white shadow-lg`}>
            <QrCode size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">QR Studio</h1>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Custom QR Code Generator</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side: Controls */}
        <div className={`w-full md:w-1/2 p-6 overflow-y-auto border-r ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
          <div className="space-y-6">
            
            {/* Mode Toggle */}
            <div className={`p-1 rounded-xl flex ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
              <button
                onClick={() => setIsBulkMode(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${!isBulkMode ? (isLight ? 'bg-white shadow' : 'bg-[#151c2c] text-white shadow-lg') : 'text-slate-500 hover:text-slate-700'}`}
              >
                <QrCode size={16} /> Single
              </button>
              <button
                onClick={() => setIsBulkMode(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${isBulkMode ? (isLight ? 'bg-white shadow' : 'bg-[#151c2c] text-white shadow-lg') : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Layers size={16} /> Bulk
              </button>
            </div>

            {/* Input Data */}
            {!isBulkMode ? (
              <div>
                <label className="flex items-center gap-2 text-sm font-bold mb-2">
                  <Link size={16} /> Enter URL or Text
                </label>
                <textarea 
                  value={qrValue}
                  onChange={(e) => setQrValue(e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full p-4 rounded-xl border focus:ring-2 focus:outline-none transition-shadow resize-none h-32
                    ${isLight 
                      ? 'bg-white border-slate-300 focus:ring-blue-500/20' 
                      : 'bg-black/20 border-white/10 focus:ring-blue-500/50'}`}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-2">
                    <Link size={16} /> Base URL
                  </label>
                  <input 
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://rai2.me/c/"
                    className={`w-full p-3 rounded-xl border focus:ring-2 focus:outline-none transition-shadow
                      ${isLight 
                        ? 'bg-white border-slate-300 focus:ring-blue-500/20' 
                        : 'bg-black/20 border-white/10 focus:ring-blue-500/50'}`}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="flex items-center gap-2 text-sm font-bold mb-2">
                      Start Series
                    </label>
                    <input 
                      type="number"
                      value={startSeries}
                      onChange={(e) => setStartSeries(Number(e.target.value))}
                      placeholder="1200"
                      className={`w-full p-3 rounded-xl border focus:ring-2 focus:outline-none transition-shadow
                        ${isLight 
                          ? 'bg-white border-slate-300 focus:ring-blue-500/20' 
                          : 'bg-black/20 border-white/10 focus:ring-blue-500/50'}`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center gap-2 text-sm font-bold mb-2">
                      End Series
                    </label>
                    <input 
                      type="number"
                      value={endSeries}
                      onChange={(e) => setEndSeries(Number(e.target.value))}
                      placeholder="1299"
                      className={`w-full p-3 rounded-xl border focus:ring-2 focus:outline-none transition-shadow
                        ${isLight 
                          ? 'bg-white border-slate-300 focus:ring-blue-500/20' 
                          : 'bg-black/20 border-white/10 focus:ring-blue-500/50'}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Colors */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold mb-3">
                <Palette size={16} /> Customize Colors
              </label>
              <div className="flex gap-4">
                <div className={`flex-1 p-3 rounded-xl border flex items-center justify-between
                  ${isLight ? 'bg-white border-slate-200' : 'bg-black/20 border-white/10'}`}>
                  <span className="text-sm font-medium">Foreground</span>
                  <input 
                    type="color" 
                    value={fgColor} 
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                </div>
                <div className={`flex-1 p-3 rounded-xl border flex items-center justify-between
                  ${isLight ? 'bg-white border-slate-200' : 'bg-black/20 border-white/10'}`}>
                  <span className="text-sm font-medium">Background</span>
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold mb-3">
                <ImageIcon size={16} /> Center Logo (Optional)
              </label>
              <div className={`p-4 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2
                ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-white/5 border-white/20'}`}>
                {logoUrl ? (
                  <div className="flex items-center justify-between w-full">
                    <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain bg-white rounded p-1" />
                    <button 
                      onClick={() => setLogoUrl(null)}
                      className="text-xs text-red-500 hover:underline font-medium"
                    >
                      Remove Logo
                    </button>
                  </div>
                ) : (
                  <>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleLogoUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors
                        ${isLight ? 'bg-slate-200 hover:bg-slate-300' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      Upload Image
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Preview & Download */}
        <div className={`w-full md:w-1/2 p-8 flex flex-col items-center justify-center relative
          ${isLight ? 'bg-slate-100/50' : 'bg-black/20'}`}>
          
          <div className={`p-8 rounded-3xl shadow-2xl transition-all hover:scale-105 relative group
            ${isLight ? 'bg-white' : 'bg-white'}`}>
            <QRCodeSVG 
              value={isBulkMode ? `${baseUrl}${startSeries}` : (qrValue || ' ')} 
              size={250} 
              fgColor={fgColor} 
              bgColor={bgColor}
              level="H"
              includeMargin={false}
              ref={svgRef}
              imageSettings={logoUrl ? {
                src: logoUrl,
                x: undefined,
                y: undefined,
                height: 50,
                width: 50,
                excavate: true,
              } : undefined}
            />
          </div>

          <button 
            onClick={isBulkMode ? handleBulkDownload : handleDownload}
            disabled={isBulkMode ? (isGenerating || !baseUrl || startSeries > endSeries) : !qrValue}
            className={`mt-10 flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition-all 
              ${(isBulkMode ? (isGenerating || !baseUrl || startSeries > endSeries) : !qrValue) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95 hover:shadow-2xl'} 
              bg-gradient-to-r ${accentColor}`}
          >
            {isBulkMode ? (
              isGenerating ? (
                <>Generating Zip...</>
              ) : (
                <><Download size={20} /> Download {endSeries - startSeries + 1 > 0 ? endSeries - startSeries + 1 : 0} QRs (ZIP)</>
              )
            ) : (
              <><Download size={20} /> Download PNG</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
