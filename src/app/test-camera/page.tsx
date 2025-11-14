'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Image from 'next/image';

export default function TestCameraPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setCroppedImage(null);
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const cropImage = () => {
    if (!completedCrop || !imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = imageRef.current;

    // Calculate scale factors
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = 500;
    canvas.height = 500;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      500,
      500
    );

    setCroppedImage(canvas.toDataURL('image/jpeg', 0.8));
  };

  if (croppedImage) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 pt-8 flex flex-col">
        <div className="flex-1 flex items-center justify-center mb-4">
          <img
            src={croppedImage}
            alt="Cropped"
            className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg"
          />
        </div>
        <div className="flex gap-4 justify-center pb-4">
          <Button onClick={() => setCroppedImage(null)} variant="outline">
            Edit Again
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Use Photo</Button>
        </div>
      </div>
    );
  }

  if (selectedImage) {
    return (
      <div className="h-screen bg-gray-400 flex flex-col">
        <div className="flex-1 h-[85%] self-center overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            onComplete={c => setCompletedCrop(c)}
            aspect={1}
          >
            <Image
              ref={imageRef}
              src={selectedImage}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: 'auto', height: 'auto' }}
              alt="Selected"
              className="max-w-full"
              onLoad={() => {
                if (imageRef.current) {
                  const rect = imageRef.current.getBoundingClientRect();
                  const size = Math.min(rect.width, rect.height) * 0.5;
                  const x = (rect.width - size) / 2;
                  const y = (rect.height - size) / 2;
                  const initialCrop: Crop = {
                    unit: 'px',
                    x,
                    y,
                    width: size,
                    height: size,
                  };
                  setCrop(initialCrop);
                  setCompletedCrop({
                    x,
                    y,
                    width: size,
                    height: size,
                    unit: 'px',
                  });
                }
              }}
            />
          </ReactCrop>
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="h-[10%] flex gap-4 justify-center items-center px-4">
          <Button onClick={() => setSelectedImage(null)} variant="outline">
            Choose Different Photo
          </Button>
          <Button onClick={cropImage} className="bg-blue-600 hover:bg-blue-700">
            Crop Image
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="text-center">
        <div className="mb-4 text-6xl">📷</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Take or Choose Photo
        </h1>
        <input
          ref={fileInputRef}
          style={{ display: 'none' }}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        <input
          ref={cameraInputRef}
          style={{ display: 'none' }}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
        />
        <div className="flex gap-4">
          <Button
            onClick={handleCameraClick}
            className="bg-blue-600 hover:bg-blue-700"
          >
            📷 Camera
          </Button>
          <Button onClick={handleGalleryClick} variant="outline">
            🖼️ Gallery
          </Button>
        </div>
      </div>
    </div>
  );
}
