import { useState } from 'react';
import {
  compressImageV2,
  ICompressionV2Options,
} from '@/lib/utils/image-compression';
import { toast } from 'sonner';

interface UseImageCompressionReturn {
  compress: (file: File) => Promise<File | null>;
  isCompressing: boolean;
  error: Error | null;
}

export function useImageCompression(
  defaultOptions: ICompressionV2Options = {}
): UseImageCompressionReturn {
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const compress = async (file: File): Promise<File | null> => {
    setIsCompressing(true);
    setError(null);

    try {
      // Default options for the project: WebP, 0.75 quality, 1600px max
      const options = {
        quality: 0.75,
        maxDimension: 1600,
        type: 'image/webp' as const,
        ...defaultOptions,
      };

      const compressedFile = await compressImageV2(file, options);
      return compressedFile;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Image compression failed');
      setError(error);
      toast.error('Gagal mengompres gambar', {
        description: 'Format gambar mungkin tidak didukung atau corrupt.',
      });
      return null;
    } finally {
      setIsCompressing(false);
    }
  };

  return { compress, isCompressing, error };
}
