'use client';

import { formatDateTimeId } from '@/lib/utils';

type SignaturePreviewProps = {
  label: string;
  url: string | null | undefined;
  signedAt?: Date | string | null;
  signedByName?: string | null;
};

export function SignaturePreview({
  label,
  url,
  signedAt,
  signedByName,
}: SignaturePreviewProps) {
  const hasUrl = !!url;
  const formattedTime =
    signedAt !== undefined && signedAt !== null
      ? formatDateTimeId(signedAt)
      : null;

  if (!hasUrl && !formattedTime && !signedByName) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 border rounded-md p-2 bg-muted/40">
      <div className="w-40 h-20 border bg-background flex items-center justify-center overflow-hidden">
        {hasUrl && (
          <img
            src={url as string}
            alt={`Tanda tangan ${label}`}
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        {signedByName && <p>Ditandatangani oleh: {signedByName}</p>}
        {formattedTime && <p>Waktu: {formattedTime}</p>}
      </div>
    </div>
  );
}
