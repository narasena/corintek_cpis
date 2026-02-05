/**
 * Image Compression Engine V2
 *
 * Strategy:
 * 1. Format: WebP (Superior compression vs JPEG)
 * 2. Method: Canvas API (Native, no heavy libs)
 * 3. Logic: Smart Resizing + Quality iteration
 */

export interface CompressionV2Options {
  /**
   * Output quality (0.0 to 1.0)
   * @default 0.75
   */
  quality?: number;

  /**
   * Maximum width or height in pixels.
   * Maintains aspect ratio.
   * @default 1600
   */
  maxDimension?: number;

  /**
   * Output MIME type.
   * Note: Safari < 14 doesn't support WebP, but we target modern browsers.
   * @default 'image/webp'
   */
  type?: 'image/webp' | 'image/jpeg';
}

/**
 * Compress an image using the V2 engine.
 */
export async function compressImageV2(
  file: File,
  options: CompressionV2Options = {}
): Promise<File> {
  const {
    quality = 0.75,
    maxDimension = 1600,
    type = 'image/webp', // Default to WebP for V2
  } = options;

  // 1. Load Image
  const img = await loadImage(file);

  // 2. Calculate New Dimensions
  const { width, height } = calculateDimensions(
    img.width,
    img.height,
    maxDimension
  );

  // 3. Draw to Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // High quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // 4. Export Blob
  const blob = await new Promise<Blob | null>(resolve => {
    canvas.toBlob(resolve, type, quality);
  });

  if (!blob) throw new Error('Compression failed');

  // 5. Convert to File
  // Change extension if switching formats
  const newName =
    file.name.replace(/\.[^/.]+$/, '') +
    (type === 'image/webp' ? '.webp' : '.jpg');

  return new File([blob], newName, {
    type: type,
    lastModified: Date.now(),
  });
}

// --- Helpers ---

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

function calculateDimensions(
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
