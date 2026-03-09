import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook to safely manage browser Object URLs (Blob URLs)
 * Handles automatic revocation on replacement and unmount to prevent memory leaks.
 */
export function useObjectURL() {
  const urlRef = useRef<string | null>(null);

  const revoke = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const create = useCallback(
    (object: Blob | File | null) => {
      revoke(); // Always clean up the previous URL
      if (!object) return null;

      const newUrl = URL.createObjectURL(object);
      urlRef.current = newUrl;
      return newUrl;
    },
    [revoke]
  );

  // Final cleanup when component unmounts
  useEffect(() => {
    return () => revoke();
  }, [revoke]);

  return {
    create,
    revoke,
    current: urlRef.current,
  };
}
