/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compressImageV2, processImagePipeline } from './image-compression';

// Mock Browser APIs
const mockBlob = new Blob(['dummy content'], { type: 'image/webp' });
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  })),
  toBlob: vi.fn((cb) => cb(mockBlob)),
};

describe('image-compression characterization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock document
    global.document = {
      createElement: vi.fn((tag) => {
        if (tag === 'canvas') return mockCanvas;
        return {};
      }),
    } as any;

    // Mock Image
    global.Image = class {
      onload: () => void = () => {};
      width = 2000;
      height = 1000;
      set src(_value: string) {
        setTimeout(() => this.onload(), 0);
      }
    } as any;

    // Mock URL
    global.URL.createObjectURL = vi.fn(() => 'blob:url');
    global.URL.revokeObjectURL = vi.fn();
  });

  describe('compressImageV2', () => {
    it('compresses to WebP by default', async () => {
      const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
      const result = await compressImageV2(file);

      expect(result.name).toBe('test.webp');
      expect(result.type).toBe('image/webp');
    });
  });

  describe('processImagePipeline', () => {
    it('crops and compresses an image element', async () => {
      const img = { width: 2000, height: 1000 } as HTMLImageElement;
      const result = await processImagePipeline(img, 'capture.jpg');

      expect(result.name).toBe('capture.webp');
      expect(mockCanvas.width).toBe(1000); // targetSize should be min(2000, 1000, 1600) = 1000
      expect(mockCanvas.height).toBe(1000); // Square crop
    });

    it('crops and compresses a video element', async () => {
      const video = { 
        videoWidth: 1000, 
        videoHeight: 2000 
      } as any;

      const result = await processImagePipeline(video, 'shot.jpg');

      expect(result.name).toBe('shot.webp');
      expect(mockCanvas.width).toBe(1000);
      expect(mockCanvas.height).toBe(1000);
    });
  });
});
