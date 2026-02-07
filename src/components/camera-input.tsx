'use client';

import { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Loader2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { compressImageV2 } from '@/lib/utils/image-compression';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CameraInputProps {
  value?: string | null;
  onChange: (url: string | null, file?: File | null) => void;
  disabled?: boolean;
}

export function CameraInput({ value, onChange, disabled }: CameraInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
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
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Explicitly play to avoid black screen on some devices
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .catch(e => console.error('Auto-play failed:', e));
        };
      }
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
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Video dimensions
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (videoWidth === 0 || videoHeight === 0) {
      toast.error('Kamera belum siap', { description: 'Tunggu sebentar...' });
      return;
    }

    // Calculate the square crop (center of the video)
    const size = Math.min(videoWidth, videoHeight);
    const x = (videoWidth - size) / 2;
    const y = (videoHeight - size) / 2;

    // Set canvas size to the cropped size
    canvas.width = size;
    canvas.height = size;

    // Draw the cropped image
    context.drawImage(video, x, y, size, size, 0, 0, size, size);

    // Convert to blob and return file
    canvas.toBlob(
      async blob => {
        if (!blob) {
          toast.error('Gagal mengambil gambar');
          return;
        }

        setIsProcessing(true);
        stopCamera(); // Freeze UX immediately

        try {
          // 1. Create initial file from canvas
          const rawFile = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

          // 2. Compress using V2 Engine (WebP)
          const compressedFile = await compressImageV2(rawFile, {
            quality: 0.75,
            maxDimension: 1600,
            type: 'image/webp',
          });

          const previewUrl = URL.createObjectURL(compressedFile);
          onChange(previewUrl, compressedFile);
          handleClose();
        } catch {
          toast.error('Gagal memproses gambar');
        } finally {
          setIsProcessing(false);
        }
      },
      'image/jpeg',
      0.8
    );
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

    // Create a 1:1 crop from the uploaded file (center crop)
    // We need to load it into an image, then draw to canvas
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;

      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.drawImage(img, x, y, size, size, 0, 0, size, size);

      canvas.toBlob(
        async blob => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }

          try {
            const croppedFile = new File([blob], file.name, {
              type: file.type,
            });

            // COMPRESSION V2
            const compressedFile = await compressImageV2(croppedFile, {
              quality: 0.75,
              maxDimension: 1600,
              type: 'image/webp',
            });

            const previewUrl = URL.createObjectURL(compressedFile);
            onChange(previewUrl, compressedFile);
          } catch {
            toast.error('Gagal memproses gambar');
          } finally {
            URL.revokeObjectURL(objectUrl);
            setIsProcessing(false);
          }
        },
        file.type,
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setIsProcessing(false);
      toast.error('Gagal membaca file gambar');
    };

    img.src = objectUrl;
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
            onClick={() => onChange(null, null)}
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
      <div className="flex gap-2">
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

            <canvas ref={canvasRef} className="hidden" />
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
                className="rounded-full h-16 w-16 bg-white hover:bg-gray-200 border-4 border-gray-300 ring-2 ring-white ring-offset-2 ring-offset-black"
                onClick={capturePhoto}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
