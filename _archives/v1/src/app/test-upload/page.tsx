'use client';

import useImageUpload from '@/hooks/useImageUpload';

export default function TestUpload() {
  const { file, setFile, uploading, result, handleUpload } = useImageUpload();

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Test Image Upload</h1>

      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={e => setFile(e.target.files?.[0] || null)}
        className="mb-4 p-2 border border-gray-300 rounded"
      />

      <button
        onClick={() => handleUpload()}
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
