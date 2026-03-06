'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  FileInput,
  Printer,
  Save,
  Send,
  Lock,
  Unlock,
} from 'lucide-react';
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

function getViewLabel(mode: 'input' | 'preview'): string {
  return mode === 'input' ? 'Input' : 'Preview';
}

function getViewIcon(mode: 'input' | 'preview') {
  return mode === 'input' ? (
    <FileInput className="mr-2 h-4 w-4" />
  ) : (
    <Eye className="mr-2 h-4 w-4" />
  );
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
  const isDraft = status === 'DRAFT';

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

      <div className="flex flex-wrap items-center gap-2">
        {/* View Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[120px]">
              {getViewIcon(mode)}
              {getViewLabel(mode)}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onModeChange('input')}>
              <FileInput className="mr-2 h-4 w-4" />
              Input
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onModeChange('preview')}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </DropdownMenuItem>
            {mode === 'preview' && (
              <DropdownMenuItem onClick={onPrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              className="min-w-[140px]"
              disabled={isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Tindakan
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSave} disabled={isLocked || isPending}>
              <Save className="mr-2 h-4 w-4" />
              Simpan Draft
            </DropdownMenuItem>
            {isDraft && (
              <DropdownMenuItem onClick={onSubmit} disabled={isPending}>
                <Send className="mr-2 h-4 w-4" />
                Kirim
              </DropdownMenuItem>
            )}
            {canAdminOverride && (
              <DropdownMenuItem
                onClick={onAdminOverrideToggle}
                disabled={isPending}
              >
                {adminOverride ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Kunci Kembali
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Buka Kunci (Admin)
                  </>
                )}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
