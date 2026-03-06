/**
 * Foundational Canvas Utilities
 * 
 * Shared logic for image manipulation, cropping, and exporting.
 * Standardizes high-quality smoothing and async Blob conversion.
 */

/**
 * Calculate dimensions to fit into a max dimension while maintaining aspect ratio
 */
export function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxDimension: number
): { width: number; height: number } {
  // If image is smaller than max, don't upscale
  if (srcWidth <= maxDimension && srcHeight <= maxDimension) {
    return { width: srcWidth, height: srcHeight };
  }

  let width = srcWidth;
  let height = srcHeight;

  if (width > height) {
    if (width > maxDimension) {
      height = Math.round(height * (maxDimension / width));
      width = maxDimension;
    }
  } else {
    if (height > maxDimension) {
      width = Math.round(width * (maxDimension / height));
      height = maxDimension;
    }
  }

  return { width, height };
}

/**
 * Promisified Image loader
 */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('[CPIS-CANVAS] Failed to load image'));
    };
    img.src = url;
  });
}

/**
 * Resize an image using a canvas with high-quality smoothing
 */
export function drawImageToCanvas(
  img: HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('[CPIS-CANVAS] Could not get 2d canvas context');
  }

  // High quality scaling configuration
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return canvas;
}

/**
 * Crop an image to a 1:1 square from the center and draw to a canvas
 */
export function cropCenterToCanvas(
  source: HTMLImageElement | HTMLVideoElement,
  targetSize: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('[CPIS-CANVAS] Could not get 2d canvas context');
  }

  const srcWidth = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
  const srcHeight = source instanceof HTMLVideoElement ? source.videoHeight : source.height;

  const size = Math.min(srcWidth, srcHeight);
  const x = (srcWidth - size) / 2;
  const y = (srcHeight - size) / 2;

  // High quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(source, x, y, size, size, 0, 0, targetSize, targetSize);

  return canvas;
}

/**
 * Promisified canvas.toBlob
 */
export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('[CPIS-CANVAS] Canvas to Blob conversion failed'));
        }
      },
      type,
      quality
    );
  });
}
