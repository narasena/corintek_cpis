'use client';

import type React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';

type TSignaturePadProps = {
  disabled?: boolean;
  onChange?: (dataUrl: string | null) => void;
  clearTrigger?: number;
};

export function SignaturePad({
  disabled,
  onChange,
  clearTrigger,
}: TSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    // Match the resize logic for consistent clear
    let width: number;
    let height: number;
    if (containerWidth < containerHeight) {
      height = containerHeight;
      width = height * (3 / 2);
    } else {
      width = containerWidth;
      height = width * (9 / 16);
    }

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (onChange) onChange(null);
  }, [onChange]);

  // Handle external clear trigger
  useEffect(() => {
    if (clearTrigger === undefined) return;
    handleClear();
  }, [clearTrigger, handleClear]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;
      const ratio = Math.max(window.devicePixelRatio || 1, 2);

      // Use full container space - fit within container bounds
      let width: number;
      let height: number;

      if (containerWidth < containerHeight) {
        // Portrait: use full height, calculate width from height (3:2 ratio for better signature area)
        height = containerHeight;
        width = height * (3 / 2);
        // If width exceeds container, scale down to fit
        if (width > containerWidth) {
          width = containerWidth;
          height = width * (2 / 3);
        }
      } else {
        // Landscape: use full width, calculate height from width (16:9 ratio)
        width = containerWidth;
        height = width * (9 / 16);
        // If height exceeds container, scale down to fit
        if (height > containerHeight) {
          height = containerHeight;
          width = height * (16 / 9);
        }
      }

      const prev = canvas.toDataURL();

      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      if (prev && prev !== 'data:,') {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
        };
        img.src = prev;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const getPoint = (
    e: PointerEvent | React.PointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const point = getPoint(e);
    if (!point) return;

    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111827';

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const point = getPoint(e);
    if (!point) return;

    e.preventDefault();
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const finishStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);

    if (!onChange) return;

    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Pointer may not be captured or already released
      }
    }
    finishStroke();
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Pointer may not be captured or already released
      }
    }
    finishStroke();
  };

  return (
    <div className="h-full flex flex-col">
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[150px] border rounded-md bg-white overflow-hidden touch-none select-none flex items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        />
      </div>
    </div>
  );
}
