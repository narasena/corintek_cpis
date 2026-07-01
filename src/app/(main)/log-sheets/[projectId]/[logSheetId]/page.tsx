'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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

import {
  submitLogSheetAction,
  rejectLogSheetAction,
  approveLogSheetAction,
} from '@/features/log-sheets/actions';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSession } from '@/hooks/use-session';
import { useLogSheetDetailData } from './hooks/use-log-sheet-detail-data';
import { useLogSheetDerived } from './hooks/use-log-sheet-derived';
import { useLogSheetDraftState } from './hooks/use-log-sheet-draft-state';
import { useLogSheetDraftSaver } from './hooks/use-log-sheet-draft-saver';
import { useLogSheetActiveMachines } from './hooks/use-log-sheet-active-machines';
import { useLogSheetDerivedUsers } from './hooks/use-log-sheet-derived-users';
import { useMobileUnitViewModel } from './hooks/use-mobile-unit-view-model';
import { formatUserName } from '@/lib/utils/user';
import { MobileLayoutWrapper } from '@/features/log-sheets/option-a/components/mobile-layout-wrapper';

import { LogSheetToolbar } from '@/features/log-sheets/components/log-sheet-toolbar';
import { MachineSelectionPanel } from '@/features/log-sheets/components/machine-selection-panel';
import { LogSheetCategorySection } from '@/features/log-sheets/components/log-sheet-category-section';
import { ConsumptionChemicalsSection } from '@/features/log-sheets/components/consumption-chemicals-section';
import { EntryStateProvider } from '@/features/log-sheets/context';
import { formatDate } from './utils';
import {
  hasCompleteMachine,
  type TValidationParameter,
} from '@/features/log-sheets/validation';

function LoadingState() {
  return (
    <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    </div>
  );
}

export default function LogSheetDetailPage() {
  const params = useParams<{ projectId: string; logSheetId: string }>();
  const router = useRouter();
  const projectId = params.projectId;
  const logSheetId = params.logSheetId;

  const [mode, setMode] = useState<'input' | 'preview'>('input');
  const [isPending, startTransition] = useTransition();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [adminOverride, setAdminOverride] = useState(false);
  const [localSignatureUrls, setLocalSignatureUrls] = useState<{
    TECHNICIAN: string | null;
    CLIENT_PIC: string | null;
  }>({ TECHNICIAN: null, CLIENT_PIC: null });

  const isMobileView = useIsMobile();
  const { user } = useSession();
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
    replacedByName,
  } = useLogSheetDerived({
    detail,
    activeChillerIds,
    activeCTIds,
    technicians: detail?.technicians ?? [],
    replacedByUserId,
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

  const isStatusLocked =
    detail?.logSheet.status !== 'DRAFT' || !!detail?.logSheet.locked;
  const isLocked = isStatusLocked && !adminOverride;

  const derivedUsers = useLogSheetDerivedUsers(detail);
  const mobileViewModel = useMobileUnitViewModel(detail, entryState, {
    chillers: activeChillerIds,
    coolingTowers: activeCTIds,
  });

  const viewerRole = detail?.viewerRole;
  // Only CLIENT roles are forced into preview mode; internal staff can edit
  const isClientRole =
    viewerRole === 'CLIENT' ||
    viewerRole === 'CLIENT_TECHNICIAN' ||
    viewerRole === 'CLIENT_SUPERVISOR';
  const effectiveMode = isClientRole ? 'preview' : mode;

  // For showing approval actions in preview: SUPERVISOR or CLIENT_SUPERVISOR
  const canApproveInPreview =
    viewerRole === 'SUPERVISOR' || viewerRole === 'CLIENT_SUPERVISOR';

  const handleSave = () => {
    if (isLocked) {
      toast.error('Tidak bisa menyimpan', {
        description: 'Log sheet sudah dikirim dan tidak bisa diubah.',
      });
      return;
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
    // Build validation parameters
    const mappedParams = new Map<string, TValidationParameter[]>();
    parametersByCategory.forEach((params, key) => {
      mappedParams.set(
        key,
        params.map(p => ({
          id: p.id,
          name: p.name,
          variableName: p.variableName,
          category: p.category,
          valueType: p.valueType,
        }))
      );
    });

    const completenessInput = {
      detail: detail ? { machines: detail.machines } : null,
      entryState,
      activeChillerIds,
      activeCTIds,
      parametersByCategory: mappedParams,
    };

    if (!hasCompleteMachine(completenessInput)) {
      toast.error('Data belum lengkap', {
        description: '11 field wajib belum diisi.',
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

  const handleConfirmReject = () => {
    setIsRejectOpen(false);
    startTransition(async () => {
      const res = await rejectLogSheetAction({
        id: logSheetId,
        rejectionReason: rejectReason || undefined,
      });
      if (!res.success) {
        toast.error('Gagal menolak log sheet', { description: res.error });
        return;
      }
      toast.success('Log sheet dikembalikan ke teknisi untuk perbaikan');
      setRejectReason('');
      await fetchData();
    });
  };

  const handleConfirmApprove = () => {
    setIsApproveOpen(false);
    startTransition(async () => {
      const res = await approveLogSheetAction({ id: logSheetId });
      if (!res.success) {
        toast.error('Gagal menyetujui log sheet', { description: res.error });
        return;
      }
      toast.success('Log sheet disetujui');
      await fetchData();
    });
  };

  const handleSignatureUpdate = () => {
    toast.success('Tanda tangan berhasil disimpan');
    return Promise.resolve();
  };

  const handleTechnicianSignatureSuccess = (url: string) => {
    setLocalSignatureUrls(prev => ({ ...prev, TECHNICIAN: url }));
  };

  const handleClientPicSignatureSuccess = (url: string) => {
    setLocalSignatureUrls(prev => ({ ...prev, CLIENT_PIC: url }));
  };

  if (loading || !detail) {
    return <LoadingState />;
  }

  const {
    corintekPicName,
    clientPicName,
    submittedByName,
    technicianSignedByName,
    clientPicSignedByName,
    canSignTechnician,
    canSignClientPic,
    canAdminOverride,
  } = derivedUsers;

  return (
    <div className="space-y-4 md:space-y-8 pb-16 md:pb-0 print:p-0 print:max-w-none print:mx-0 print:space-y-0">
      {!isClientRole && (
        <LogSheetToolbar
          projectId={projectId}
          mode={effectiveMode}
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
      )}
      {/* PIC: Show approval buttons at TOP when status is SUBMITTED */}
      {canApproveInPreview &&
        effectiveMode === 'preview' &&
        detail.logSheet.status === 'SUBMITTED' && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 print:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-amber-800">
                  Menunggu Persetujuan
                </p>
                <p className="text-sm text-amber-600">
                  Log sheet ini telah dikirim oleh teknisi dan menunggu
                  persetujuan Anda.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsApproveOpen(true)}
                  disabled={isPending}
                >
                  Setuju
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsRejectOpen(true)}
                  disabled={isPending}
                >
                  Tolak
                </Button>
              </div>
            </div>
          </div>
        )}
      <AlertDialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader
            className="!bg-primary !text-white -mx-6 -mt-6 px-6 py-4 rounded-t-lg"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          >
            <AlertDialogTitle className="!text-white">
              Konfirmasi pengiriman log sheet
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/80">
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
      <AlertDialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader
            className="!bg-primary !text-white -mx-6 -mt-6 px-6 py-4 rounded-t-lg"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          >
            <AlertDialogTitle className="!text-white">
              Tolak Log Sheet
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/80">
              Berikan alasan penolakan untuk membantu teknisi memperbaiki log
              sheet ini. Log sheet akan dikembalikan ke status draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Contoh: Data tidak lengkap, nilai parameter melebihi batas normal, dll."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReject}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Tolak
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader
            className="!bg-primary !text-white -mx-6 -mt-6 px-6 py-4 rounded-t-lg"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          >
            <AlertDialogTitle className="!text-white">
              Setuju Log Sheet?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/80">
              Log sheet akan disetujui dan dikunci.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <Button onClick={handleConfirmApprove} disabled={isPending}>
              Setuju
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Log Sheet: {detail.project.name}
            </h1>
            <p className="text-sm">
              {formatDate(detail.logSheet.date)} • {detail.logSheet.status}
            </p>
          </div>
          {isClientRole && (
            <Button variant="outline" onClick={handlePrint}>
              Cetak / Preview
            </Button>
          )}
        </div>
      </div>

      {effectiveMode === 'input' && (
        <fieldset
          disabled={isLocked || isPending}
          className="space-y-6 print:hidden"
        >
          {/* Simplified Status Section */}
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                {detail.logSheet.status}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Petugas Hari Ini
                </label>
                <Select
                  value={replacedByUserId ?? 'none'}
                  onValueChange={v =>
                    setReplacedByUserId(v === 'none' ? null : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih nama teknisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">- Saya Sendiri -</SelectItem>
                    {(detail?.technicians ?? [])
                      .filter(t => t.id !== user?.id)
                      .map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          {formatUserName(t)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Pilih nama jika ada pengganti
                </p>
              </div>
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

          <EntryStateProvider
            entryState={entryState}
            setEntryState={setEntryState}
          >
            {isMobileView && mobileViewModel ? (
              <MobileLayoutWrapper
                viewModel={mobileViewModel}
                disabled={isLocked || isPending}
              />
            ) : (
              <LogSheetCategorySection
                categories={categories}
                parametersByCategory={parametersByCategory}
                machinesForCategory={machinesForCategory}
                activeCTIds={activeCTIds}
                coolingTowers={detail.machines.coolingTowers}
                allChillers={detail.machines.chillers}
                allCoolingTowers={detail.machines.coolingTowers}
              />
            )}
          </EntryStateProvider>

          {/* Combined Consumption & Chemicals Section */}
          <EntryStateProvider
            entryState={entryState}
            setEntryState={setEntryState}
          >
            <ConsumptionChemicalsSection
              consumptionParams={(
                parametersByCategory.get('CONSUMPTION') ?? []
              ).map(p => ({
                id: p.id,
                name: p.name,
                unit: p.unit,
              }))}
              chemicals={detail.chemicals}
              chemicalUsages={chemicalState}
              onChemicalUsagesChange={setChemicalState}
              disabled={isLocked || isPending}
            />
          </EntryStateProvider>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <label className="text-sm font-medium">Catatan</label>
            <Textarea
              placeholder="Contoh: Unit chiller #1 mengalami noise tidak wajar saat startup. TDS air cooling tower meningkat, perlu dilakukan blowdown."
              disabled={isLocked || isPending}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Signature Section - Now at bottom */}
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
                existingUrl={
                  localSignatureUrls.TECHNICIAN ??
                  detail.logSheet.technicianSignatureUrl
                }
                signedAt={detail.logSheet.technicianSignedAt}
                signedByName={technicianSignedByName}
                isLocked={isLocked}
                onSigned={handleSignatureUpdate}
                onSuccess={handleTechnicianSignatureSuccess}
              />
              {/* Only show CLIENT_PIC signature for non-technician roles */}
              {(viewerRole === 'ADMIN' ||
                viewerRole === 'CLIENT_TECHNICIAN' ||
                viewerRole === 'CLIENT_SUPERVISOR') && (
                <SignatureSection
                  logSheetId={logSheetId}
                  role="CLIENT_PIC"
                  canSign={canSignClientPic}
                  existingUrl={
                    localSignatureUrls.CLIENT_PIC ??
                    detail.logSheet.clientPicSignatureUrl
                  }
                  signedAt={detail.logSheet.clientPicSignedAt}
                  signedByName={clientPicSignedByName}
                  isLocked={isLocked}
                  onSigned={handleSignatureUpdate}
                  onSuccess={handleClientPicSignatureSuccess}
                />
              )}
            </div>
          </div>
        </fieldset>
      )}

      {effectiveMode === 'preview' && (
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

      {/* CLIENT_SUPERVISOR: Show signature section in preview mode */}
      {canApproveInPreview && effectiveMode === 'preview' && (
        <div className="rounded-lg border bg-card p-4 space-y-4 print:hidden">
          {/* Status Banner */}
          {detail.logSheet.status === 'SUBMITTED' && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-amber-800">
                    Menunggu Persetujuan
                  </p>
                  <p className="text-sm text-amber-600">
                    Log sheet ini telah dikirim oleh teknisi dan menunggu
                    persetujuan Anda.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsApproveOpen(true)}
                    disabled={isPending}
                  >
                    Setuju
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setIsRejectOpen(true)}
                    disabled={isPending}
                  >
                    Tolak
                  </Button>
                </div>
              </div>
              {detail.logSheet.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                  <p className="text-sm font-medium text-red-800">
                    Alasan Penolakan:
                  </p>
                  <p className="text-sm text-red-700">
                    {detail.logSheet.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold">Tanda Tangan</h3>
              <p className="text-xs text-muted-foreground">
                Tanda tangan PIC klien diperlukan untuk menyetujui log sheet.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SignatureSection
              logSheetId={logSheetId}
              role="CLIENT_PIC"
              canSign={canSignClientPic}
              existingUrl={
                localSignatureUrls.CLIENT_PIC ??
                detail.logSheet.clientPicSignatureUrl
              }
              signedAt={detail.logSheet.clientPicSignedAt}
              signedByName={clientPicSignedByName}
              isLocked={isLocked}
              onSigned={handleSignatureUpdate}
              onSuccess={handleClientPicSignatureSuccess}
            />
          </div>
        </div>
      )}

      {/* Sticky Action Bar for Mobile */}
      {effectiveMode === 'input' && detail.logSheet.status === 'DRAFT' && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t flex gap-2 md:hidden z-50">
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
