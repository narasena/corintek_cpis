/**
 * Image Compression Engine V2
 *
 * Strategy:
 * 1. Format: WebP (Superior compression vs JPEG)
 * 2. Method: Canvas API (Native, no heavy libs)
 * 3. Logic: Smart Resizing + Quality iteration
 */

import {
  calculateAspectRatioFit,
  drawImageToCanvas,
  canvasToBlob,
  cropCenterToCanvas,
  loadImage,
} from './canvas';

/**
 * Standardized pipeline for processing images from Camera or File uploads
 * 1. Center crop to 1:1
 * 2. Compress to WebP
 * 3. Return File object
 */
export async function processImagePipeline(
  source: HTMLImageElement | HTMLVideoElement,
  fileName: string,
  options: ICompressionV2Options = {}
): Promise<File> {
  const { quality = 0.75, maxDimension = 1600, type = 'image/webp' } = options;

  // 1. Center Crop to square
  // We check for videoWidth first to distinguish between Video and Image
  const isVideo = 'videoWidth' in source;
  const srcWidth = isVideo ? (source as HTMLVideoElement).videoWidth : (source as HTMLImageElement).width;
  const srcHeight = isVideo ? (source as HTMLVideoElement).videoHeight : (source as HTMLImageElement).height;
  
  const targetSize = Math.min(Math.min(srcWidth || maxDimension, srcHeight || maxDimension), maxDimension);

  const croppedCanvas = cropCenterToCanvas(source, targetSize);

  // 2. Export to Blob
  const blob = await canvasToBlob(croppedCanvas, type, quality);

  // 3. Return File
  const newName =
    fileName.replace(/\.[^/.]+$/, '') + (type === 'image/webp' ? '.webp' : '.jpg');

  return new File([blob], newName, {
    type: type,
    lastModified: Date.now(),
  });
}

export interface ICompressionV2Options {
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
  options: ICompressionV2Options = {}
): Promise<File> {
  const {
    quality = 0.75,
    maxDimension = 1600,
    type = 'image/webp', // Default to WebP for V2
  } = options;

  // 1. Load Image
  const img = await loadImage(file);

  // 2. Calculate New Dimensions
  const { width, height } = calculateAspectRatioFit(
    img.width,
    img.height,
    maxDimension
  );

  // 3. Draw to Canvas
  const canvas = drawImageToCanvas(img, width, height);

  // 4. Export Blob
  const blob = await canvasToBlob(canvas, type, quality);

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
