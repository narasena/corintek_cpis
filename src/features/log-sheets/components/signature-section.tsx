'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { saveLogSheetSignatureAction } from '@/features/log-sheets/actions';
import { SignaturePad } from './signature-pad';

type TSignatureRole = 'TECHNICIAN' | 'CLIENT_PIC';

type TSignatureSectionProps = {
  logSheetId: string;
  role: TSignatureRole;
  canSign: boolean;
  existingUrl: string | null;
  signedAt: Date | string | null;
  signedByName: string | null;
  isLocked: boolean;
  onSigned: () => Promise<void>;
};

export function SignatureSection({
  logSheetId,
  role,
  canSign,
  existingUrl,
  signedAt,
  signedByName,
  isLocked,
  onSigned,
}: TSignatureSectionProps) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const label = role === 'TECHNICIAN' ? 'Teknisi' : 'PIC Klien';

  const handleSave = async () => {
    if (!dataUrl) return;
    try {
      setIsSaving(true);
      const res = await saveLogSheetSignatureAction({
        logSheetId,
        signatureRole: role,
        dataUrl,
      });

      if (!res.success) {
        toast.error('Gagal menyimpan tanda tangan', {
          description: res.error,
        });
        return;
      }

      toast.success('Tanda tangan berhasil disimpan');
      await onSigned();
      setOpen(false);
      setDataUrl(null);
    } catch {
      toast.error('Gagal menyimpan tanda tangan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium leading-none">
            Tanda Tangan {label}
          </p>
          <p className="text-xs text-muted-foreground">
            Diminta sebelum log sheet dapat dikirim.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setOpen(true)}
          disabled={isLocked || !canSign}
        >
          {existingUrl ? 'Ubah Tanda Tangan' : 'Isi Tanda Tangan'}
        </Button>
      </div>

      {existingUrl && (
        <div className="flex items-center gap-4 border rounded-md p-2 bg-muted/40">
          <div className="w-40 h-20 border bg-background flex items-center justify-center overflow-hidden">
            <img
              src={existingUrl}
              alt={`Tanda tangan ${label}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            {signedByName && <p>Ditandatangani oleh: {signedByName}</p>}
            {signedAt && (
              <p>
                Waktu:{' '}
                {new Intl.DateTimeFormat('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(signedAt))}
              </p>
            )}
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tanda Tangan {label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Gunakan jari (di mobile) atau mouse/stylus (di desktop) untuk
              menggambar tanda tangan pada kotak di bawah. Area ini dioptimalkan
              untuk orientasi landscape 16:9.
            </p>
            <SignaturePad disabled={isSaving} onChange={setDataUrl} />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!dataUrl || isSaving}
                onClick={handleSave}
              >
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
