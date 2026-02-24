'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LogSheetPreview } from '@/features/log-sheets/components/log-sheet-preview';
import { SignatureSection } from '@/features/log-sheets/components/signature-section';
import { ChemicalUsageSection } from '@/features/log-sheets/components/chemical-usage-section';

import { submitLogSheetAction } from '@/features/log-sheets/actions';
import { useIsMobile } from '@/hooks/use-mobile';
import type { TEntryState } from './types';
import { useLogSheetDetailData } from './hooks/use-log-sheet-detail-data';
import { useLogSheetDerived } from './hooks/use-log-sheet-derived';
import { useLogSheetDraftState } from './hooks/use-log-sheet-draft-state';
import { useLogSheetDraftSaver } from './hooks/use-log-sheet-draft-saver';
import { useLogSheetActiveMachines } from './hooks/use-log-sheet-active-machines';
import { useLogSheetTechnicians } from '@/features/log-sheets/hooks/use-log-sheet-technicians';
import { useLogSheetValidation } from './hooks/use-log-sheet-validation';

import { LogSheetToolbar } from '@/features/log-sheets/components/log-sheet-toolbar';
import { MachineSelectionPanel } from '@/features/log-sheets/components/machine-selection-panel';
import { LogSheetCategorySection } from '@/features/log-sheets/components/log-sheet-category-section';
import { formatDate } from './utils';

export default function LogSheetDetailPage() {
  const params = useParams<{ projectId: string; logSheetId: string }>();
  const router = useRouter();
  const projectId = params.projectId;
  const logSheetId = params.logSheetId;

  const [mode, setMode] = useState<'input' | 'preview'>('input');
  const [isPending, startTransition] = useTransition();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [adminOverride, setAdminOverride] = useState(false);

  const isMobileView = useIsMobile();
  const { technicians } = useLogSheetTechnicians();
  const {
    detail,
    loading,
    reload: fetchData,
  } = useLogSheetDetailData(logSheetId);
  const {
    notes,
    setNotes,
    replacedByUserId,
    setReplacedByUserId,
    entryState,
    setEntryState,
    chemicalState,
    setChemicalState,
    activeChillerIds,
    setActiveChillerIds,
    activeCTIds,
    setActiveCTIds,
  } = useLogSheetDraftState(detail);

  const {
    categories,
    parametersByCategory,
    machinesForCategory,
    activeMachines,
    replacedByName,
  } = useLogSheetDerived({
    detail,
    activeChillerIds,
    activeCTIds,
    technicians,
    replacedByUserId,
  });

  const { validateEntries } = useLogSheetValidation({
    detail,
    entryState,
    activeChillerIds,
    activeCTIds,
    parametersByCategory,
    machinesForCategory,
  });

  const { saveDraft } = useLogSheetDraftSaver({
    projectId,
    logSheetId,
    notes,
    replacedByUserId,
    entryState,
    chemicalState,
    reload: fetchData,
    allowAdminOverride: adminOverride,
  });

  const { handleToggleMachine, handleSelectAllMachines, handleClearMachines } =
    useLogSheetActiveMachines({
      detail,
      logSheetId,
      activeChillerIds,
      setActiveChillerIds,
      activeCTIds,
      setActiveCTIds,
      startTransition,
      allowAdminOverride: adminOverride,
    });

  const isStatusLocked = detail?.logSheet.status !== 'DRAFT';
  const isHardLocked = detail?.logSheet.locked ?? false;
  const isLocked = (isStatusLocked || isHardLocked) && !adminOverride;

  const handleSave = () => {
    if (isLocked) {
      toast.error('Tidak bisa menyimpan', {
        description: 'Log sheet sudah dikirim dan tidak bisa diubah.',
      });
      return;
    }

    const { valid, missingFields, errors } = validateEntries();
    if (!valid) {
      toast.warning('Data belum lengkap', {
        description:
          errors[0] ||
          `${missingFields.length} field wajib belum diisi. Tetap menyimpan sebagai draft.`,
      });
    }
    startTransition(async () => {
      await saveDraft(true);
    });
  };

  const handlePrint = () => {
    setMode('preview');
    setTimeout(() => window.print(), 0);
  };

  const handleSubmitRequest = () => {
    const { valid, missingFields, errors } = validateEntries();
    if (!valid) {
      toast.error('Gagal mengirim log sheet', {
        description:
          errors[0] ||
          `Ada ${missingFields.length} field wajib yang belum diisi. Lengkapi data sebelum mengirim.`,
      });
      return;
    }
    setIsSubmitOpen(true);
  };

  const handleConfirmSubmit = () => {
    setIsSubmitOpen(false);
    startTransition(async () => {
      const saved = await saveDraft(false);
      if (!saved) return;
      const res = await submitLogSheetAction(logSheetId);
      if (!res.success) {
        toast.error('Gagal mengirim log sheet', { description: res.error });
        return;
      }
      toast.success('Log sheet berhasil dikirim');
      await fetchData();
    });
  };

  if (loading || !detail) {
    return (
      <div>
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  const projectAssignments = detail.project.assignments ?? [];

  const assignedProjectPic = projectAssignments.find(
    a => a.role === 'PROJECT_PIC'
  )?.user;
  const assignedClientPic = projectAssignments.find(
    a => a.role === 'CLIENT_PIC'
  )?.user;

  const assignedProjectPicName = assignedProjectPic
    ? `${assignedProjectPic.firstName} ${assignedProjectPic.lastName ?? ''}`.trim()
    : null;
  const assignedClientPicName = assignedClientPic
    ? `${assignedClientPic.firstName} ${assignedClientPic.lastName ?? ''}`.trim()
    : null;

  const submittedByName = detail.logSheet.submittedBy
    ? `${detail.logSheet.submittedBy.firstName} ${detail.logSheet.submittedBy.lastName ?? ''}`.trim()
    : '-';

  const approvedByName = detail.logSheet.approvedBy
    ? `${detail.logSheet.approvedBy.firstName} ${detail.logSheet.approvedBy.lastName ?? ''}`.trim()
    : null;

  const corintekPicName = approvedByName ?? assignedProjectPicName ?? '-';
  const clientPicName = assignedClientPicName ?? '-';

  const technicianSignedByName = detail.logSheet.technicianSignedBy
    ? `${detail.logSheet.technicianSignedBy.firstName} ${detail.logSheet.technicianSignedBy.lastName ?? ''}`.trim()
    : null;
  const clientPicSignedByName = detail.logSheet.clientPicSignedBy
    ? `${detail.logSheet.clientPicSignedBy.firstName} ${detail.logSheet.clientPicSignedBy.lastName ?? ''}`.trim()
    : null;

  const canSignTechnician =
    detail.viewerRole === 'ADMIN' || detail.viewerRole === 'TECHNICIAN';
  const canSignClientPic =
    detail.viewerRole === 'ADMIN' ||
    detail.viewerRole === 'CLIENT_TECHNICIAN' ||
    detail.viewerRole === 'CLIENT_SUPERVISOR';

  const canAdminOverride =
    detail.viewerRole === 'ADMIN' && detail.logSheet.status !== 'DRAFT';

  return (
    <div className="space-y-4 md:space-y-8 print:p-0 print:max-w-none print:mx-0 print:space-y-0">
      <LogSheetToolbar
        projectId={projectId}
        mode={mode}
        onModeChange={setMode}
        onPrint={handlePrint}
        onSave={handleSave}
        onSubmit={handleSubmitRequest}
        status={detail.logSheet.status}
        isPending={isPending}
        isLocked={isLocked}
        canAdminOverride={canAdminOverride}
        adminOverride={adminOverride}
        onAdminOverrideToggle={() => setAdminOverride(v => !v)}
        onBack={() => router.push(`/log-sheets/${projectId}`)}
      />
      <AlertDialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi pengiriman log sheet</AlertDialogTitle>
            <AlertDialogDescription>
              Setelah dikirim, log sheet terkunci dan tidak bisa diubah.
              Pastikan semua data sudah benar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              disabled={isPending}
            >
              Kirim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Log Sheet: {detail.project.name}
        </h1>
        <p className="text-muted-foreground">
          {formatDate(detail.logSheet.date)} • {detail.logSheet.status}
        </p>
      </div>

      {mode === 'input' && (
        <fieldset
          disabled={isLocked || isPending}
          className="space-y-6 print:hidden"
        >
          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Input value={detail.logSheet.status} readOnly />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-medium">Digantikan Oleh</label>
              <Select
                value={replacedByUserId ?? 'none'}
                onValueChange={v =>
                  setReplacedByUserId(v === 'none' ? null : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Teknisi Pengganti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">- Tidak Ada Pengganti -</SelectItem>
                  {technicians.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.firstName} {t.lastName || ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">Tanda Tangan</h3>
                <p className="text-xs text-muted-foreground">
                  Tanda tangan teknisi dan PIC klien diperlukan sebelum log
                  sheet dapat dikirim.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <SignatureSection
                logSheetId={logSheetId}
                role="TECHNICIAN"
                canSign={canSignTechnician}
                existingUrl={detail.logSheet.technicianSignatureUrl}
                signedAt={detail.logSheet.technicianSignedAt}
                signedByName={technicianSignedByName}
                isLocked={isLocked}
                onSigned={fetchData}
              />
              <SignatureSection
                logSheetId={logSheetId}
                role="CLIENT_PIC"
                canSign={canSignClientPic}
                existingUrl={detail.logSheet.clientPicSignatureUrl}
                signedAt={detail.logSheet.clientPicSignedAt}
                signedByName={clientPicSignedByName}
                isLocked={isLocked}
                onSigned={fetchData}
              />
            </div>
          </div>

          <MachineSelectionPanel
            chillers={detail.machines.chillers}
            coolingTowers={detail.machines.coolingTowers}
            activeChillerIds={activeChillerIds}
            activeCTIds={activeCTIds}
            onToggleMachine={handleToggleMachine}
            onSelectAllMachines={handleSelectAllMachines}
            onClearMachines={handleClearMachines}
          />

          <LogSheetCategorySection
            categories={categories}
            parametersByCategory={parametersByCategory}
            entryState={entryState}
            setEntryState={setEntryState}
            machinesForCategory={machinesForCategory}
            activeCTIds={activeCTIds}
            coolingTowers={detail.machines.coolingTowers}
            isMobileView={isMobileView}
          />

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <ChemicalUsageSection
              usages={chemicalState}
              onChange={setChemicalState}
              disabled={isPending || isLocked}
            />
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <label className="text-sm font-medium">Catatan</label>
            <Textarea
              placeholder="Catatan singkat..."
              disabled={isLocked || isPending}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </fieldset>
      )}

      {mode === 'preview' && (
        <LogSheetPreview
          customerName={detail.project.name}
          date={detail.logSheet.date}
          byName={submittedByName}
          submittedAt={detail.logSheet.submittedAt}
          replacedByName={replacedByName}
          corintekPicName={corintekPicName}
          approvedAt={detail.logSheet.approvedAt}
          clientPicName={clientPicName}
          technicianSignatureUrl={detail.logSheet.technicianSignatureUrl}
          clientPicSignatureUrl={detail.logSheet.clientPicSignatureUrl}
          notes={notes.trim() ? notes.trim() : null}
          machines={detail.machines}
          parameters={detail.parameters}
          valuesByKey={entryState}
          photos={detail.photos}
          chemicalUsages={chemicalState}
        />
      )}

      {/* Sticky Action Bar for Mobile */}
      {mode === 'input' && detail.logSheet.status === 'DRAFT' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t flex gap-2 md:hidden z-50">
          <Button
            className="flex-1"
            variant="outline"
            onClick={handleSave}
            disabled={isPending}
          >
            Simpan Draft
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmitRequest}
            disabled={isPending}
          >
            Kirim
          </Button>
        </div>
      )}
    </div>
  );
}
