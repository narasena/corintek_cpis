'use client'

import apiInstance from "@/utils/apiInstance";
import { useState } from "react";

export default function useImageUpload () {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<string>('');

    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const img = new Image();
          
          img.onload = () => {
            canvas.width = Math.min(img.width, 1024);
            canvas.height = (img.height * canvas.width) / img.width;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              resolve(blob!);
            }, 'image/jpeg', 0.8);
          };
          
          img.src = URL.createObjectURL(file);
        });
      };
    
      const handleUpload = async (prefix: string = 'default'): Promise<string | null> => {
        if (!file) return null;
        
        setUploading(true);
        const originalSize = file.size;
        
        try {
          let uploadBody: Blob = file;
          
          // Compress images only
          if (file.type.startsWith('image/')) {
            uploadBody = await compressImage(file);
          }
          
          const compressedSize = uploadBody.size;
          
          const formData = new FormData();
          formData.append('file', uploadBody, file.name);
          formData.append('prefix', prefix);
          
          const response = await apiInstance.post('/upload', formData );
          
          const data = await response.data
          const compression = file.type.startsWith('image/')
            ? `Original: ${(originalSize/1024/1024).toFixed(2)}MB → Compressed: ${(compressedSize/1024/1024).toFixed(2)}MB`
            : `PDF uploaded: ${(originalSize/1024/1024).toFixed(2)}MB (no compression)`;
          
          if (response.status === 200 && data.url) {
            setResult(`${data.message || 'Upload successful'}\n${compression}\nURL: ${data.url}`);
            return data.url;
          } else {
            const errorMsg = data.error || 'Upload failed';
            setResult(`Error: ${errorMsg}\n${compression}`);
            console.error('Upload failed:', errorMsg);
            return null;
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          setResult(`Error: ${errorMsg}`);
          console.error('Upload error:', error);
          return null;
        } finally {
          setUploading(false);
        }
      };

    return {
      file,
      setFile,
      uploading,
      result,
      handleUpload
    }
  }