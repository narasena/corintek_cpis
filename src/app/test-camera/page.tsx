'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function TestCameraPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setCroppedImage(null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - cropArea.x,
      y: e.clientY - rect.top - cropArea.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const newX = Math.max(
      0,
      Math.min(e.clientX - rect.left - dragStart.x, rect.width - cropArea.width)
    );
    const newY = Math.max(
      0,
      Math.min(
        e.clientY - rect.top - dragStart.y,
        rect.height - cropArea.height
      )
    );

    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const cropImage = () => {
    if (!selectedImage || !imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    // Calculate scale factors
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    // Set canvas size to crop area
    canvas.width = cropArea.width * scaleX;
    canvas.height = cropArea.height * scaleY;

    // Draw cropped image
    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    setCroppedImage(canvas.toDataURL('image/jpeg', 0.8));
  };

  if (croppedImage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <img
          src={croppedImage}
          alt="Cropped"
          className="max-w-sm max-h-96 object-contain rounded-lg mb-4"
        />
        <div className="flex gap-4">
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="relative mb-4">
          <img
            ref={imageRef}
            src={selectedImage}
            alt="Selected"
            className="max-w-md max-h-96 object-contain"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20 cursor-move"
            style={{
              left: cropArea.x,
              top: cropArea.y,
              width: cropArea.width,
              height: cropArea.height,
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nw-resize" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-ne-resize" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-sw-resize" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize" />
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-4">
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
        <label>
          <input
            ref={fileInputRef}
            style={{ display: 'none' }}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
          />
          <Button
            onClick={handleButtonClick}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Open Camera / Choose Photo
          </Button>
        </label>
      </div>
    </div>
  );
}
