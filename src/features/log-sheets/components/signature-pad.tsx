'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type TSignaturePadProps = {
  disabled?: boolean;
  onChange?: (dataUrl: string | null) => void;
};

export function SignaturePad({ disabled, onChange }: TSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = width / (16 / 9);
      const ratio = window.devicePixelRatio || 1;

      const prev = canvas.toDataURL();

      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
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
    setHasStroke(true);
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
      canvas.releasePointerCapture(e.pointerId);
    }
    finishStroke();
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
    }
    finishStroke();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.width / (16 / 9));
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.width / (16 / 9));

    setHasStroke(false);
    if (onChange) onChange(null);
  };

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative w-full max-w-full border rounded-md bg-white overflow-hidden touch-none select-none"
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-auto"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        />
      </div>
      <div className="flex justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={disabled}
        >
          Ulangi
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={disabled || !hasStroke}
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas || !onChange) return;
            const dataUrl = canvas.toDataURL('image/png');
            onChange(dataUrl);
          }}
        >
          Simpan
        </Button>
      </div>
    </div>
  );
}
