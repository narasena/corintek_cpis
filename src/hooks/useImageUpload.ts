'use client'

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
    
      const handleUpload = async () => {
        if (!file) return;
        
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
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          
          const data = await response.json() as { success?: boolean; message?: string; error?: string; key?: string };
          const compression = file.type.startsWith('image/')
            ? `Original: ${(originalSize/1024/1024).toFixed(2)}MB → Compressed: ${(compressedSize/1024/1024).toFixed(2)}MB`
            : `PDF uploaded: ${(originalSize/1024/1024).toFixed(2)}MB (no compression)`;
          
          if (response.ok) {
            setResult(`${data.message || 'Upload successful'}\n${compression}`);
          } else {
            setResult(`Error: ${data.error || 'Upload failed'}\n${compression}`);
          }
        } catch (error) {
          setResult(`Error: ${error}`);
        }
        
        setUploading(false);
      };

    return {
      file,
      setFile,
      uploading,
      result,
      handleUpload
    }
  }