'use client';

import { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Loader2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { processImagePipeline } from '@/lib/utils/image-compression';
import { loadImage } from '@/lib/utils/canvas';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useObjectURL } from '@/hooks/use-object-url';

interface CameraInputProps {
  value?: string | null;
  onChange: (url: string | null, file?: File | null) => void;
  disabled?: boolean;
}

export function CameraInput({ value, onChange, disabled }: CameraInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
   const videoRef = useRef<HTMLVideoElement>(null);
   const readyCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);
   const fallbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

   const isMounted = useRef(false);
  const { create: createObjectURL, revoke: revokeCurrentPreview } =
    useObjectURL();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopCamera();
    };
  }, []);

   const startCamera = async () => {
     // Clear any existing timers (defensive)
     if (readyCheckInterval.current) {
       clearInterval(readyCheckInterval.current);
       readyCheckInterval.current = null;
     }
     if (fallbackTimeout.current) {
       clearTimeout(fallbackTimeout.current);
       fallbackTimeout.current = null;
     }

     try {
       const mediaStream = await navigator.mediaDevices.getUserMedia({
         video: { facingMode: 'environment' },
       });

       // Prevent race condition if component unmounted
       if (!isMounted.current) {
         mediaStream.getTracks().forEach(track => track.stop());
         return;
       }

       setStream(mediaStream);
       setIsCameraReady(false);

       if (videoRef.current) {
         const video = videoRef.current;
         video.srcObject = mediaStream;
         // Ensure autoplay is allowed on all devices
         video.muted = true;
         video.playsInline = true;
         // Start playback immediately
         video.play().catch(e => console.error('Auto-play failed:', e));
         // Poll for readiness every 100ms
         readyCheckInterval.current = setInterval(() => {
           if (video.readyState >= 2) {
             setIsCameraReady(true);
             if (readyCheckInterval.current) {
               clearInterval(readyCheckInterval.current);
               readyCheckInterval.current = null;
             }
             if (fallbackTimeout.current) {
               clearTimeout(fallbackTimeout.current);
               fallbackTimeout.current = null;
             }
           }
         }, 100);
       }

       // Fallback: force enable after 2s regardless (prevents infinite disable)
       fallbackTimeout.current = setTimeout(() => {
         setIsCameraReady(true);
         fallbackTimeout.current = null;
       }, 2000);
     } catch (error) {
       console.error('Camera access error:', error);
       toast.error('Gagal mengakses kamera', {
         description: 'Pastikan izin kamera diberikan.',
       });
       setIsOpen(false);
     }
   };

   const stopCamera = () => {
     if (stream) {
       stream.getTracks().forEach(track => track.stop());
       setStream(null);
     }
     if (readyCheckInterval.current) {
       clearInterval(readyCheckInterval.current);
       readyCheckInterval.current = null;
     }
     if (fallbackTimeout.current) {
       clearTimeout(fallbackTimeout.current);
       fallbackTimeout.current = null;
     }
     setIsCameraReady(false);
   };

   // Sync camera state with Dialog open state
   useEffect(() => {
     if (isOpen) {
       startCamera();
     } else {
       stopCamera();
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    // stopCamera is triggered by useEffect when isOpen becomes false
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // Safety check - should rarely trigger since button is disabled until ready
    if (video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
      toast.error('Kamera belum siap', { description: 'Tunggu sebentar hingga kamera menyala sepenuhnya...' });
      return;
    }

    setIsProcessing(true);
    stopCamera(); // Freeze UX immediately

    try {
      // Use the unified pipeline: Crop 1:1 -> Compress WebP -> Return File
      const compressedFile = await processImagePipeline(video, 'photo.jpg', {
        quality: 0.75,
        maxDimension: 1600,
        type: 'image/webp',
      });

      const previewUrl = createObjectURL(compressedFile);

      onChange(previewUrl, compressedFile);
      handleClose();
    } catch (error) {
      console.error('[CPIS-CAMERA] Capture failed:', error);
      toast.error('Gagal memproses gambar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Load image
      const img = await loadImage(file);

      // 2. Use unified pipeline: Crop 1:1 -> Compress WebP -> Return File
      const compressedFile = await processImagePipeline(img, file.name, {
        quality: 0.75,
        maxDimension: 1600,
        type: 'image/webp',
      });

      const previewUrl = createObjectURL(compressedFile);

      onChange(previewUrl, compressedFile);
    } catch (error) {
      console.error('[CPIS-CAMERA] File processing failed:', error);
      toast.error('Gagal memproses gambar');
    } finally {
      setIsProcessing(false);
    }
  };

  if (value) {
    return (
      <div className="relative w-32 h-32 border rounded-md overflow-hidden group">
        <img src={value} alt="Value" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            type="button"
            onClick={() => {
              revokeCurrentPreview();
              onChange(null, null);
            }}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-32 w-32 flex flex-col gap-2 border-dashed"
          onClick={handleOpen}
          disabled={disabled || isProcessing}
        >
          <Camera className="h-8 w-8 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Ambil Foto</span>
        </Button>

        <div className="relative">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleFileChange}
            disabled={disabled || isProcessing}
          />
          <Button
            variant="outline"
            className="h-32 w-32 flex flex-col gap-2 border-dashed pointer-events-none"
            disabled={disabled || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {isProcessing ? 'Mengompresi...' : 'Upload Galeri'}
            </span>
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none text-white">
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
            <DialogTitle className="text-white flex justify-between items-center">
              <span>Ambil Foto</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
            {/* Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute min-w-full min-h-full object-cover"
            />

            {/* Overlay Guide (1:1) */}
            <div className="absolute inset-0 pointer-events-none border-[2px] border-white/50 z-10">
              {/* Corner markers for visual style */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
            </div>
          </div>

           <div className="p-6 flex justify-center bg-black">
             {isProcessing ? (
               <Button
                 disabled
                 className="rounded-full h-16 w-16 bg-white/20"
                 type="button"
               >
                 <Loader2 className="h-8 w-8 animate-spin text-white" />
               </Button>
             ) : (
               <Button
                 type="button"
                 className={`rounded-full h-16 w-16 border-4 transition-all ${
                   isCameraReady
                     ? 'bg-white hover:bg-gray-200 border-gray-300 ring-2 ring-white ring-offset-2 ring-offset-black cursor-pointer'
                     : 'bg-gray-600 border-gray-700 cursor-not-allowed opacity-50'
                 }`}
                 onClick={capturePhoto}
                 disabled={!isCameraReady}
                 title={isCameraReady ? 'Ambil foto' : 'Tunggu kamera menyala...'}
               />
             )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
