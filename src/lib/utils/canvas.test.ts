import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateAspectRatioFit,
  drawImageToCanvas,
  canvasToBlob,
} from './canvas';

describe('Canvas Utilities', () => {
  describe('calculateAspectRatioFit', () => {
    it('should not upscale small images', () => {
      const result = calculateAspectRatioFit(100, 100, 500);
      expect(result).toEqual({ width: 100, height: 100 });
    });

    it('should scale landscape images to max width', () => {
      const result = calculateAspectRatioFit(2000, 1000, 1000);
      expect(result).toEqual({ width: 1000, height: 500 });
    });

    it('should scale portrait images to max height', () => {
      const result = calculateAspectRatioFit(1000, 2000, 1000);
      expect(result).toEqual({ width: 500, height: 1000 });
    });
  });

  describe('Canvas Browser APIs', () => {
    const createMockContext = () => ({
      drawImage: vi.fn(),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: '',
    });

    const mockCanvas = {
      getContext: vi.fn(() => createMockContext()),
      toBlob: vi.fn(cb => cb(new Blob())),
      width: 0,
      height: 0,
    };

    beforeEach(() => {
      vi.clearAllMocks();
      global.document = {
        createElement: vi.fn(tag => {
          if (tag === 'canvas') return mockCanvas;
          return {};
        }),
      } as any;
    });

    it('drawImageToCanvas should configure high quality smoothing', () => {
      const img = {} as any;
      const canvas = drawImageToCanvas(img, 100, 100);

      expect(canvas).toBe(mockCanvas);
      // Get the last context returned by the mock
      const ctx = vi.mocked(mockCanvas.getContext).mock.results[0].value;

      expect(ctx.imageSmoothingEnabled).toBe(true);
      expect(ctx.imageSmoothingQuality).toBe('high');
      expect(ctx.drawImage).toHaveBeenCalled();
    });

    it('canvasToBlob should return a promise with blob', async () => {
      const blob = await canvasToBlob(mockCanvas as any, 'image/webp', 0.8);
      expect(blob).toBeInstanceOf(Blob);
      expect(mockCanvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/webp',
        0.8
      );
    });
  });
});
