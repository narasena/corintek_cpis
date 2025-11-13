'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestCameraPage() {
  const [image, setImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        style={{ display: 'none' }}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
      />
      <Button onClick={() => inputRef.current?.click()}>Open Camera</Button>
      {image && (
        <img
          src={image}
          alt="Captured"
          style={{ maxWidth: '100%', marginTop: '10px' }}
        />
      )}
    </div>
  );
}
