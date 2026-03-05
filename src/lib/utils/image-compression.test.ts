import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compressImageV2 } from './image-compression';

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

describe('compressImageV2 characterization', () => {
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

  it('compresses to WebP by default', async () => {
    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
    const result = await compressImageV2(file);

    expect(result.name).toBe('test.webp');
    expect(result.type).toBe('image/webp');
    expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.75);
  });

  it('respects maxDimension for aspect ratio scaling', async () => {
    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
    await compressImageV2(file, { maxDimension: 1000 });

    // Source was 2000x1000, maxDimension 1000 -> should scale to 1000x500
    expect(mockCanvas.width).toBe(1000);
    expect(mockCanvas.height).toBe(500);
  });

  it('compresses to JPEG if specified', async () => {
    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
    const result = await compressImageV2(file, { type: 'image/jpeg', quality: 0.8 });

    expect(result.name).toBe('test.jpg');
    expect(result.type).toBe('image/jpeg');
    expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.8);
  });

  it('does not upscale small images', async () => {
    // Override Image mock for this test
    global.Image = class {
      onload: () => void = () => {};
      width = 500;
      height = 250;
      set src(_value: string) {
        setTimeout(() => this.onload(), 0);
      }
    } as any;

    const file = new File(['dummy'], 'small.png', { type: 'image/png' });
    await compressImageV2(file, { maxDimension: 1000 });

    expect(mockCanvas.width).toBe(500);
    expect(mockCanvas.height).toBe(250);
  });
});
