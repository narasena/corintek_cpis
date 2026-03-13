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
import { SignaturePreview } from '@/components/signature/signature-preview';
import {
  signatureRoleLabel,
  type TSignatureUiRole,
} from '@/components/signature/signature-roles';
import { saveLogSheetSignatureAction } from '@/features/log-sheets/actions';
import { SignaturePad } from './signature-pad';

type TSignatureRole = TSignatureUiRole;

type TSignatureSectionProps = {
  logSheetId: string;
  role: TSignatureRole;
  canSign: boolean;
  existingUrl: string | null;
  signedAt: Date | string | null;
  signedByName: string | null;
  isLocked: boolean;
  onSigned: () => Promise<void>;
  onSuccess?: (url: string) => void;
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
  onSuccess,
}: TSignatureSectionProps) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const label = signatureRoleLabel(role);

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
      onSuccess?.(res.data.url);
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
        <SignaturePreview
          label={label}
          url={existingUrl}
          signedAt={signedAt}
          signedByName={signedByName}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-lg h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader
            className="px-4 py-3 m-0 rounded-t-lg shrink-0"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            <DialogTitle className="text-white text-base">
              Tanda Tangan {label}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
            <p className="text-xs text-muted-foreground mb-2 shrink-0">
              Gunakan jari (di mobile) atau mouse/stylus untuk menggambar tanda
              tangan
            </p>
            <div className="flex-1 min-h-0">
              <SignaturePad disabled={isSaving} onChange={setDataUrl} />
            </div>
            <div className="flex justify-end gap-2 pt-3 shrink-0 border-t">
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
