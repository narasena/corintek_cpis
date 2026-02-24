'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Save } from 'lucide-react';
import Link from 'next/link';
import type { TLogSheetStatus } from '@/features/log-sheets/types';

interface ILogSheetToolbarProps {
  projectId: string;
  mode: 'input' | 'preview';
  onModeChange: (mode: 'input' | 'preview') => void;
  onPrint: () => void;
  onSave: () => void;
  onSubmit: () => void;
  status: TLogSheetStatus;
  isPending: boolean;
  isLocked: boolean;
  canAdminOverride: boolean;
  adminOverride: boolean;
  onAdminOverrideToggle: () => void;
  onBack: () => void;
}

export function LogSheetToolbar({
  projectId,
  mode,
  onModeChange,
  onPrint,
  onSave,
  onSubmit,
  status,
  isPending,
  isLocked,
  canAdminOverride,
  adminOverride,
  onAdminOverrideToggle,
  onBack,
}: ILogSheetToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/my-projects/${projectId}`}>Proyek</Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2">
          <Button
            variant={mode === 'input' ? 'default' : 'outline'}
            onClick={() => onModeChange('input')}
          >
            Input
          </Button>
          <Button
            variant={mode === 'preview' ? 'default' : 'outline'}
            onClick={() => onModeChange('preview')}
          >
            Preview
          </Button>
        </div>
        <Button variant="outline" onClick={onPrint}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
        {status === 'DRAFT' && (
          <Button variant="secondary" onClick={onSubmit} disabled={isPending}>
            Kirim
          </Button>
        )}
        {canAdminOverride && (
          <Button
            variant="outline"
            onClick={onAdminOverrideToggle}
            disabled={isPending}
          >
            {adminOverride ? 'Kunci Kembali' : 'Buka Kunci'}
          </Button>
        )}
        <Button onClick={onSave} disabled={isPending || isLocked}>
          <Save className="mr-2 h-4 w-4" />{' '}
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </div>
  );
}
