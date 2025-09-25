'use client';

import { useState } from 'react';
import { API_CONFIG } from '@/lib/config';

export default function TestUpload() {
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
      let contentType = file.type;
      
      // Compress images only
      if (file.type.startsWith('image/')) {
        uploadBody = await compressImage(file);
        contentType = 'image/jpeg';
      }
      
      const compressedSize = uploadBody.size;
      
      const timestamp = Date.now();
      const fileKey = `temp/test-session/${timestamp}-${file.name}`;
      
      const response = await fetch(`${API_CONFIG.WORKER_URL}/${fileKey}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.AUTH_SECRET}`,
          'Content-Type': contentType
        },
        body: uploadBody
      });
      
      const text = await response.text();
      const compression = file.type.startsWith('image/') 
        ? `Original: ${(originalSize/1024/1024).toFixed(2)}MB → Compressed: ${(compressedSize/1024/1024).toFixed(2)}MB`
        : `PDF uploaded: ${(originalSize/1024/1024).toFixed(2)}MB (no compression)`;
      
      setResult(`${text}\n${compression}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
    
    setUploading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Test Image Upload</h1>
      
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload & Compress'}
      </button>
      
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}
