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
import {
  signatureRoleLabel,
  type TSignatureUiRole,
} from '@/components/signature/signature-roles';
import type { TUserRole } from '@/@types/user.type';

type TSignatureRole = TSignatureUiRole;

type TWorkReportSignatureSectionProps = {
  projectId: string;
  workReportId: string;
  viewerRole: TUserRole;
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

type TSignatureVisibility = {
  showSection: boolean;
  showTechnicianButton: boolean;
  showClientButton: boolean;
};

const technicianViewerRoles: readonly TUserRole[] = [
  'TECHNICIAN',
  'CLIENT_TECHNICIAN',
];

const clientViewerRoles: readonly TUserRole[] = ['CLIENT_SUPERVISOR'];

const nonSigningViewerRoles: readonly TUserRole[] = [
  'SUPERVISOR',
  'REPORTING',
  'DIRECTOR',
];

export function getSignatureVisibility(
  viewerRole: TUserRole
): TSignatureVisibility {
  if (viewerRole === 'ADMIN') {
    return {
      showSection: true,
      showTechnicianButton: true,
      showClientButton: true,
    };
  }

  if (technicianViewerRoles.includes(viewerRole)) {
    return {
      showSection: true,
      showTechnicianButton: true,
      showClientButton: false,
    };
  }

  if (clientViewerRoles.includes(viewerRole)) {
    return {
      showSection: true,
      showTechnicianButton: false,
      showClientButton: true,
    };
  }

  if (nonSigningViewerRoles.includes(viewerRole)) {
    return {
      showSection: false,
      showTechnicianButton: false,
      showClientButton: false,
    };
  }

  return {
    showSection: false,
    showTechnicianButton: false,
    showClientButton: false,
  };
}

type TSignaturePreviewVisibility = {
  showTechnicianPreview: boolean;
  showClientPreview: boolean;
};

const previewVisibilityByRole: Record<TUserRole, TSignaturePreviewVisibility> =
  {
    ADMIN: { showTechnicianPreview: true, showClientPreview: true },
    TECHNICIAN: { showTechnicianPreview: true, showClientPreview: false },
    CLIENT_TECHNICIAN: {
      showTechnicianPreview: true,
      showClientPreview: false,
    },
    CLIENT_SUPERVISOR: {
      showTechnicianPreview: false,
      showClientPreview: true,
    },
    SUPERVISOR: { showTechnicianPreview: false, showClientPreview: false },
    REPORTING: { showTechnicianPreview: false, showClientPreview: false },
    DIRECTOR: { showTechnicianPreview: false, showClientPreview: false },
  };

export function getPreviewVisibility(
  viewerRole: TUserRole
): TSignaturePreviewVisibility {
  return (
    previewVisibilityByRole[viewerRole] ?? {
      showTechnicianPreview: false,
      showClientPreview: false,
    }
  );
}

function SignatureDialog({
  workReportId,
  role,
  disabled,
  onSigned,
}: TSignatureDialogProps) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const label = signatureRoleLabel(role);

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
            <SignaturePad onChange={setDataUrl} disabled={isSaving} />
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
  viewerRole,
  isLocked,
  technicianSignatureUrl,
  technicianSignedAt,
  clientPicSignatureUrl,
  clientPicSignedAt,
  onSigned,
}: TWorkReportSignatureSectionProps) {
  const { showSection, showTechnicianButton, showClientButton } =
    getSignatureVisibility(viewerRole);
  const { showTechnicianPreview, showClientPreview } =
    getPreviewVisibility(viewerRole);

  if (!showSection) {
    return null;
  }

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
        {showTechnicianButton && (
          <SignatureDialog
            workReportId={workReportId}
            role="TECHNICIAN"
            disabled={disabled}
            onSigned={onSigned}
          />
        )}
        {showClientButton && (
          <SignatureDialog
            workReportId={workReportId}
            role="CLIENT_PIC"
            disabled={disabled}
            onSigned={onSigned}
          />
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {showTechnicianPreview && (
          <SignaturePreviewInternal
            label="Teknisi"
            url={technicianSignatureUrl}
            signedAt={technicianSignedAt}
          />
        )}
        {showClientPreview && (
          <SignaturePreviewInternal
            label="PIC Klien"
            url={clientPicSignatureUrl}
            signedAt={clientPicSignedAt}
          />
        )}
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
