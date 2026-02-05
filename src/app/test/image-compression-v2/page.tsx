'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Upload,
  ImageIcon,
  Zap,
  Smartphone,
  FileText,
  FileIcon,
  CheckCircle2,
} from 'lucide-react';
import { formatBytes } from '@/lib/utils/image-compression';
import { compressImageV2 } from '@/lib/utils/image-compression-v2';
import { toast } from 'sonner';

interface ImageMetadata {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  url: string;
}

const PRESETS = {
  aggressive: {
    label: 'Aggressive',
    quality: 0.5,
    maxDimension: 1024,
    desc: 'Max size reduction. Good for thumbnails.',
  },
  balanced: {
    label: 'Balanced (Recommended)',
    quality: 0.75,
    maxDimension: 1600,
    desc: 'Best for documents & reports.',
  },
  high: {
    label: 'High Detail',
    quality: 0.9,
    maxDimension: 1920,
    desc: 'Retains fine details.',
  },
};

export default function ImageCompressionV2Page() {
  const [original, setOriginal] = useState<ImageMetadata | null>(null);
  const [compressed, setCompressed] = useState<ImageMetadata | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Settings
  const [mode, setMode] = useState<keyof typeof PRESETS>('balanced');
  const [customQuality, setCustomQuality] = useState(0.75);
  const [customMaxDim, setCustomMaxDim] = useState(1600);
  const [isCustom, setIsCustom] = useState(false);

  // --- Handlers ---

  const getImageDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    const { width, height } = await getImageDimensions(file);
    setOriginal({
      name: file.name,
      size: file.size,
      type: file.type,
      width,
      height,
      url: URL.createObjectURL(file),
    });
    setCompressed(null);
  };

  const handlePresetChange = (val: string) => {
    setMode(val as keyof typeof PRESETS);
    setIsCustom(false);
    // Update custom values to match preset for smooth transition if they switch to custom later
    const p = PRESETS[val as keyof typeof PRESETS];
    setCustomQuality(p.quality);
    setCustomMaxDim(p.maxDimension);
  };

  const handleCompress = async () => {
    if (!original) return;
    setIsCompressing(true);

    try {
      const response = await fetch(original.url);
      const blob = await response.blob();
      const file = new File([blob], original.name, { type: original.type });

      const quality = isCustom ? customQuality : PRESETS[mode].quality;
      const maxDimension = isCustom ? customMaxDim : PRESETS[mode].maxDimension;

      console.time('Compression V2');
      const resultFile = await compressImageV2(file, {
        quality,
        maxDimension,
        type: 'image/webp', // Force WebP for V2
      });
      console.timeEnd('Compression V2');

      const { width, height } = await getImageDimensions(resultFile);

      setCompressed({
        name: resultFile.name,
        size: resultFile.size,
        type: resultFile.type,
        width,
        height,
        url: URL.createObjectURL(resultFile),
      });
      toast.success('Compression complete!');
    } catch (error) {
      console.error(error);
      toast.error('Compression failed');
    } finally {
      setIsCompressing(false);
    }
  };

  // --- Derived Metrics ---
  const savedBytes =
    original && compressed ? original.size - compressed.size : 0;
  const savedPercent =
    original && compressed
      ? ((savedBytes / original.size) * 100).toFixed(1)
      : 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
              ENGINE V2
            </span>
            <span className="text-muted-foreground text-xs font-mono">
              WebP • Canvas • Smart Resize
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Next-Gen Image Compression
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Optimized for document reporting using WebP format. Targets 70-90%
            reduction while maintaining text readability.
          </p>
        </div>

        {compressed && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-green-100 p-2 rounded-full">
              <Zap className="w-5 h-5 text-green-600 fill-current" />
            </div>
            <div>
              <div className="text-green-900 font-bold text-2xl leading-none">
                {savedPercent}%
              </div>
              <div className="text-green-700 text-xs font-medium">
                Reduction Achieved
              </div>
            </div>
            <Separator orientation="vertical" className="h-8 bg-green-200" />
            <div className="text-right">
              <div className="text-green-900 font-mono text-sm font-semibold">
                {formatBytes(savedBytes)}
              </div>
              <div className="text-green-700 text-[10px] uppercase tracking-wider">
                Space Saved
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="col-span-1 shadow-sm border-gray-200 lg:sticky lg:top-4 h-fit">
          <CardHeader className="bg-gray-50/50 pb-4">
            <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Upload Area */}
            <div className="relative group">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={handleFileUpload}
                accept="image/*"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center group-hover:border-blue-400 group-hover:bg-blue-50/30 transition-all">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                {original ? (
                  <>
                    <p className="font-medium text-gray-900 truncate max-w-[200px]">
                      {original.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to replace
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-gray-900">Upload Image</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports JPG, PNG, WEBP
                    </p>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Presets */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-900">
                Optimization Mode
              </label>
              <Tabs
                value={isCustom ? 'custom' : mode}
                onValueChange={v =>
                  v === 'custom' ? setIsCustom(true) : handlePresetChange(v)
                }
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-4 w-full">
                  <TabsTrigger value="aggressive">Small</TabsTrigger>
                  <TabsTrigger value="balanced">Balanced</TabsTrigger>
                  <TabsTrigger value="high">HD</TabsTrigger>
                </TabsList>

                <div className="space-y-4">
                  {!isCustom && (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border border-gray-100">
                      <p className="font-medium text-gray-900 mb-1">
                        {PRESETS[mode].label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {PRESETS[mode].desc}
                      </p>
                      <div className="mt-2 flex gap-2 text-[10px] font-mono text-gray-500">
                        <span className="bg-white px-1.5 py-0.5 rounded border">
                          Q: {PRESETS[mode].quality * 100}%
                        </span>
                        <span className="bg-white px-1.5 py-0.5 rounded border">
                          Max: {PRESETS[mode].maxDimension}px
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="custom-mode"
                      checked={isCustom}
                      onChange={e => setIsCustom(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <label
                      htmlFor="custom-mode"
                      className="text-sm text-gray-600 cursor-pointer select-none"
                    >
                      Enable Advanced Settings
                    </label>
                  </div>

                  {isCustom && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Quality</span>
                          <span className="font-mono font-medium">
                            {Math.round(customQuality * 100)}%
                          </span>
                        </div>
                        <Slider
                          value={[customQuality * 100]}
                          min={10}
                          max={100}
                          step={5}
                          onValueChange={v => setCustomQuality(v[0] / 100)}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Max Dimension</span>
                          <span className="font-mono font-medium">
                            {customMaxDim}px
                          </span>
                        </div>
                        <Slider
                          value={[customMaxDim]}
                          min={500}
                          max={3000}
                          step={100}
                          onValueChange={v => setCustomMaxDim(v[0])}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Tabs>
            </div>

            <Button
              size="lg"
              className="w-full font-semibold shadow-md shadow-blue-500/20"
              disabled={!original || isCompressing}
              onClick={handleCompress}
            >
              {isCompressing ? 'Crunching Pixels...' : 'Compress Image'}
            </Button>
          </CardContent>
        </Card>

        {/* Viewport */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Original Card */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileIcon className="w-4 h-4 text-gray-400" />
                Original
              </div>
              {original && (
                <div className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded border">
                  {formatBytes(original.size)} • {original.width}×
                  {original.width} • {original.type.split('/')[1].toUpperCase()}
                </div>
              )}
            </div>
            <div className="relative min-h-[300px] bg-[url('/grid.svg')] bg-gray-50 flex items-center justify-center p-4">
              {original ? (
                <div className="w-full h-full relative group">
                  <img
                    src={original.url}
                    alt="Original"
                    className="max-h-[500px] w-auto mx-auto object-contain shadow-sm rounded-sm"
                  />
                </div>
              ) : (
                <div className="text-center text-gray-300">
                  <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-20" />
                  <p>No image selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Compressed Card */}
          <div
            className="bg-white rounded-xl border shadow-sm overflow-hidden ring-1 ring-transparent data-[active=true]:ring-blue-500/20 data-[active=true]:shadow-lg transition-all duration-300"
            data-active={!!compressed}
          >
            <div className="px-4 py-3 border-b bg-blue-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                <Smartphone className="w-4 h-4" />
                Compressed Result
              </div>
              {compressed && (
                <div className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                  {formatBytes(compressed.size)} • {compressed.width}×
                  {compressed.width} •{' '}
                  {compressed.type.split('/')[1].toUpperCase()}
                </div>
              )}
            </div>
            <div className="relative min-h-[300px] bg-[url('/grid.svg')] bg-gray-50 flex items-center justify-center p-4">
              {compressed ? (
                <div className="w-full h-full relative group">
                  <img
                    src={compressed.url}
                    alt="Compressed"
                    className="max-h-[500px] w-auto mx-auto object-contain shadow-md rounded-sm"
                  />
                </div>
              ) : (
                <div className="text-center text-gray-300">
                  <FileText className="w-16 h-16 mx-auto mb-2 opacity-20" />
                  <p>Run compression to see result</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
