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
import { SignaturePad } from '@/features/log-sheets/components/signature-pad';
import { saveWorkReportSignatureAction } from '@/features/work-reports/actions';
import { SignaturePreview } from '@/components/signature/signature-preview';

type TSignatureRole = 'TECHNICIAN' | 'CLIENT_PIC';

type TWorkReportSignatureSectionProps = {
  projectId: string;
  workReportId: string;
  isLocked: boolean;
  technicianSignatureUrl?: string | null;
  technicianSignedAt?: Date | string | null;
  clientPicSignatureUrl?: string | null;
  clientPicSignedAt?: Date | string | null;
  onSigned?: () => Promise<void> | void;
};

type TSignatureDialogProps = {
  workReportId: string;
  role: TSignatureRole;
  disabled: boolean;
  onSigned?: () => Promise<void> | void;
};

function SignatureDialog({
  workReportId,
  role,
  disabled,
  onSigned,
}: TSignatureDialogProps) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const label = role === 'TECHNICIAN' ? 'Teknisi' : 'PIC Klien';

  const handleSave = async () => {
    if (!dataUrl) return;
    try {
      setIsSaving(true);
      const res = await saveWorkReportSignatureAction({
        workReportId,
        signatureRole: role,
        dataUrl,
      });

      if (!res.success) {
        toast.error('Gagal menyimpan tanda tangan', {
          description: res.message,
        });
        return;
      }

      toast.success('Tanda tangan berhasil disimpan');
      if (onSigned) {
        await onSigned();
      }
      setOpen(false);
      setDataUrl(null);
    } catch {
      toast.error('Gagal menyimpan tanda tangan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        Tanda Tangan {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tanda Tangan {label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <SignaturePad
              value={dataUrl}
              onChange={setDataUrl}
              disabled={isSaving}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  setDataUrl(null);
                }}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!dataUrl || isSaving}
              >
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

type TSignaturePreviewProps = {
  label: string;
  url: string | null | undefined;
  signedAt?: Date | string | null;
  signedByName?: string | null;
};

export type TSignaturePreviewPropsInternal = TSignaturePreviewProps;

export function SignaturePreviewInternal({
  label,
  url,
  signedAt,
  signedByName,
}: TSignaturePreviewPropsInternal) {
  return (
    <SignaturePreview
      label={label}
      url={url}
      signedAt={signedAt}
      signedByName={signedByName}
    />
  );
}

export function WorkReportSignatureSection({
  workReportId,
  isLocked,
  technicianSignatureUrl,
  technicianSignedAt,
  clientPicSignatureUrl,
  clientPicSignedAt,
  onSigned,
}: TWorkReportSignatureSectionProps) {
  const disabled = isLocked;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">Tanda Tangan</h3>
          <p className="text-xs text-muted-foreground">
            Tanda tangan teknisi dan PIC klien diperlukan sebelum work report
            dapat dikirim.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <SignatureDialog
          workReportId={workReportId}
          role="TECHNICIAN"
          disabled={disabled}
          onSigned={onSigned}
        />
        <SignatureDialog
          workReportId={workReportId}
          role="CLIENT_PIC"
          disabled={disabled}
          onSigned={onSigned}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <SignaturePreviewInternal
          label="Teknisi"
          url={technicianSignatureUrl}
          signedAt={technicianSignedAt}
        />
        <SignaturePreviewInternal
          label="PIC Klien"
          url={clientPicSignatureUrl}
          signedAt={clientPicSignedAt}
        />
      </div>
      {isLocked && (
        <p className="text-xs text-muted-foreground">
          Work report sudah dikirim atau disetujui dan tidak dapat
          ditandatangani.
        </p>
      )}
    </div>
  );
}
