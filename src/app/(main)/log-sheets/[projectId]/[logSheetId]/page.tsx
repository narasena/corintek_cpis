'use client';

import {
  useState,
  useTransition,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Printer, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { CameraInput } from '@/components/camera-input';
import { ChemicalUsageSection } from './components/chemical-usage-section';

import { submitLogSheetAction } from '@/features/log-sheets/actions';
import { makeEntryKey } from '@/features/log-sheets/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { TMachine, TParameter, TEntryState } from './types';
import { useLogSheetDetailData } from './hooks/use-log-sheet-detail-data';
import { useLogSheetDerived } from './hooks/use-log-sheet-derived';
import { useLogSheetDraftState } from './hooks/use-log-sheet-draft-state';
import { useLogSheetDraftSaver } from './hooks/use-log-sheet-draft-saver';
import { useLogSheetActiveMachines } from './hooks/use-log-sheet-active-machines';
import { useLogSheetTechnicians } from './hooks/use-log-sheet-technicians';
import { useLogSheetValidation } from './hooks/use-log-sheet-validation';

import { MobileEntryCard } from './components/mobile-entry-card';
import {
  formatDate,
  formatLimit,
  formatRawWaterLimit,
  isOutOfRange,
} from './utils';

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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/log-sheets/${projectId}`)}
          >
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
              onClick={() => setMode('input')}
            >
              Input
            </Button>
            <Button
              variant={mode === 'preview' ? 'default' : 'outline'}
              onClick={() => setMode('preview')}
            >
              Preview
            </Button>
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          {detail.logSheet.status === 'DRAFT' && (
            <Button
              variant="secondary"
              onClick={handleSubmitRequest}
              disabled={isPending}
            >
              Kirim
            </Button>
          )}
          {canAdminOverride && (
            <Button
              variant="outline"
              onClick={() => setAdminOverride(value => !value)}
              disabled={isPending}
            >
              {adminOverride ? 'Kunci Kembali' : 'Buka Kunci'}
            </Button>
          )}
          <Button onClick={handleSave} disabled={isPending || isLocked}>
            <Save className="mr-2 h-4 w-4" />{' '}
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>
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

          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Unit Mesin Aktif Hari Ini</h3>
              <p className="text-xs text-muted-foreground">
                Pilih unit yang beroperasi untuk menampilkan kolom input.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Chillers</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleSelectAllMachines('CHILLER')}
                    >
                      Pilih Semua
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive"
                      onClick={() => handleClearMachines('CHILLER')}
                    >
                      Kosongkan
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {detail.machines.chillers.map(m => (
                    <div key={m.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`chiller-${m.id}`}
                        checked={activeChillerIds.includes(m.id)}
                        onCheckedChange={() =>
                          handleToggleMachine(m.id, 'CHILLER')
                        }
                      />
                      <label
                        htmlFor={`chiller-${m.id}`}
                        className="text-sm cursor-pointer"
                      >
                        #{m.unitNumber}
                      </label>
                    </div>
                  ))}
                  {detail.machines.chillers.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      Tidak ada chiller di proyek ini
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cooling Towers</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleSelectAllMachines('COOLING_TOWER')}
                    >
                      Pilih Semua
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive"
                      onClick={() => handleClearMachines('COOLING_TOWER')}
                    >
                      Kosongkan
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {detail.machines.coolingTowers.map(m => (
                    <div key={m.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`ct-${m.id}`}
                        checked={activeCTIds.includes(m.id)}
                        onCheckedChange={() =>
                          handleToggleMachine(m.id, 'COOLING_TOWER')
                        }
                      />
                      <label
                        htmlFor={`ct-${m.id}`}
                        className="text-sm cursor-pointer"
                      >
                        #{m.unitNumber}
                      </label>
                    </div>
                  ))}
                  {detail.machines.coolingTowers.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      Tidak ada cooling tower di proyek ini
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {categories.map(category => {
            const params = parametersByCategory.get(category) ?? [];
            const cat = category as TParameter['category'];
            const { machines, label } = machinesForCategory(cat);
            if (params.length === 0) return null;

            const isUnitCategory = [
              'UNIT_CONDENSOR',
              'UNIT_EVAPORATOR',
              'GENERAL_CONDITION',
              'JOB_DESCRIPTION',
            ].includes(cat);

            if (isUnitCategory && machines.length === 0) {
              return (
                <div key={category} className="space-y-3">
                  <h2 className="text-lg font-semibold">{category}</h2>
                  <div className="rounded-md border p-8 text-center bg-muted/20">
                    <p className="text-sm text-muted-foreground italic">
                      Pilih unit {label} aktif di atas untuk menampilkan kolom
                      input.
                    </p>
                  </div>
                </div>
              );
            }

            if (cat === 'COOLING_WATER_QUALITY') {
              const activeCTs = detail.machines.coolingTowers.filter(m =>
                activeCTIds.includes(m.id)
              );

              if (isMobileView) {
                return (
                  <div key={category} className="space-y-4">
                    <h2 className="text-lg font-semibold">{category}</h2>
                    <div className="grid gap-4">
                      {params.map(param => (
                        <div
                          key={param.id}
                          className="rounded-lg border bg-card p-4 space-y-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between border-b pb-2">
                            <div>
                              <h3 className="font-semibold text-sm">
                                {param.name}
                                {param.unit ? ` (${param.unit})` : ''}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Target: {formatLimit(param)}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {activeCTs.map(m => {
                              const key = makeEntryKey(param.id, m.id, 'VALUE');
                              const state = entryState[key];
                              return (
                                <div key={key} className="space-y-2">
                                  <div className="text-xs font-medium text-muted-foreground">
                                    CT #{m.unitNumber}
                                  </div>
                                  <Input
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="Nilai..."
                                    value={
                                      state?.numericValue === null ||
                                      state?.numericValue === undefined
                                        ? ''
                                        : String(state.numericValue)
                                    }
                                    onChange={e => {
                                      const raw = e.target.value;
                                      setEntryState(prev => ({
                                        ...prev,
                                        [key]: {
                                          valueType: 'NUMBER',
                                          numericValue:
                                            raw === '' ? null : Number(raw),
                                        },
                                      }));
                                    }}
                                  />
                                </div>
                              );
                            })}

                            {(() => {
                              const rawKey = makeEntryKey(
                                param.id,
                                null,
                                'RAW_WATER'
                              );
                              const rawState = entryState[rawKey];
                              return (
                                <div className="space-y-2 pt-2 border-t">
                                  <div className="flex justify-between items-center">
                                    <div className="text-xs font-medium text-muted-foreground">
                                      Raw Water
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                      Target: {formatRawWaterLimit(param)}
                                    </div>
                                  </div>
                                  <Input
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="Nilai Raw Water..."
                                    value={
                                      rawState?.numericValue === null ||
                                      rawState?.numericValue === undefined
                                        ? ''
                                        : String(rawState.numericValue)
                                    }
                                    onChange={e => {
                                      const raw = e.target.value;
                                      setEntryState(prev => ({
                                        ...prev,
                                        [rawKey]: {
                                          valueType: 'NUMBER',
                                          numericValue:
                                            raw === '' ? null : Number(raw),
                                        },
                                      }));
                                    }}
                                  />
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{category}</h2>
                  </div>

                  <div className="rounded-md border">
                    <Table className="w-max min-w-full">
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="w-max-plus">
                            Parameter
                          </TableHead>
                          <TableHead className="w-max-plus">Target</TableHead>
                          {activeCTs.map(m => (
                            <TableHead
                              key={m.id}
                              className="min-w-[140px] text-center"
                            >
                              {`CT #${m.unitNumber}`}
                            </TableHead>
                          ))}
                          <TableHead className="w-max-plus text-center">
                            Raw Water
                          </TableHead>
                          <TableHead className="w-max-plus text-center">
                            Target (Raw Water)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {params.map(param => {
                          return (
                            <TableRow key={param.id}>
                              <TableCell>
                                <div className="font-medium">
                                  {param.name}
                                  {param.unit ? ` (${param.unit})` : ''}
                                </div>
                              </TableCell>
                              <TableCell>{formatLimit(param)}</TableCell>
                              {activeCTs.map(m => {
                                const key = makeEntryKey(
                                  param.id,
                                  m.id,
                                  'VALUE'
                                );
                                const state = entryState[key];

                                if (param.valueType === 'BOOLEAN') {
                                  const checked = state?.boolValue ?? false;
                                  const isIndeterminate =
                                    state?.boolValue === null ||
                                    state?.boolValue === undefined;
                                  return (
                                    <TableCell
                                      key={key}
                                      className="text-center"
                                    >
                                      <div className="flex items-center justify-center gap-2">
                                        <Checkbox
                                          checked={
                                            isIndeterminate ? false : checked
                                          }
                                          onCheckedChange={value => {
                                            const next = value === true;
                                            setEntryState(prev => ({
                                              ...prev,
                                              [key]: {
                                                valueType: 'BOOLEAN',
                                                boolValue: next,
                                              },
                                            }));
                                          }}
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            setEntryState(prev => ({
                                              ...prev,
                                              [key]: {
                                                valueType: 'BOOLEAN',
                                                boolValue: null,
                                              },
                                            }))
                                          }
                                        >
                                          Kosongkan
                                        </Button>
                                      </div>
                                    </TableCell>
                                  );
                                }

                                if (param.valueType === 'NUMBER') {
                                  const isError = isOutOfRange(
                                    state?.numericValue,
                                    param.minValue,
                                    param.maxValue
                                  );
                                  return (
                                    <TableCell key={key}>
                                      <Input
                                        type="number"
                                        inputMode="decimal"
                                        className={
                                          isError
                                            ? 'border-red-500 focus-visible:ring-red-500 bg-red-50'
                                            : ''
                                        }
                                        value={
                                          state?.numericValue === null ||
                                          state?.numericValue === undefined
                                            ? ''
                                            : String(state.numericValue)
                                        }
                                        onChange={e => {
                                          const raw = e.target.value;
                                          setEntryState(prev => ({
                                            ...prev,
                                            [key]: {
                                              valueType: 'NUMBER',
                                              numericValue:
                                                raw === '' ? null : Number(raw),
                                            },
                                          }));
                                        }}
                                      />
                                    </TableCell>
                                  );
                                }

                                return (
                                  <TableCell key={key}>
                                    <Input
                                      value={state?.textValue ?? ''}
                                      onChange={e => {
                                        const raw = e.target.value;
                                        setEntryState(prev => ({
                                          ...prev,
                                          [key]: {
                                            valueType: 'TEXT',
                                            textValue: raw,
                                          },
                                        }));
                                      }}
                                    />
                                  </TableCell>
                                );
                              })}

                              {(() => {
                                const rawKey = makeEntryKey(
                                  param.id,
                                  null,
                                  'RAW_WATER'
                                );
                                const rawState = entryState[rawKey];

                                if (param.valueType === 'BOOLEAN') {
                                  const checked = rawState?.boolValue ?? false;
                                  const isIndeterminate =
                                    rawState?.boolValue === null ||
                                    rawState?.boolValue === undefined;
                                  return (
                                    <TableCell
                                      key={rawKey}
                                      className="text-center"
                                    >
                                      <div className="flex items-center justify-center gap-2">
                                        <Checkbox
                                          checked={
                                            isIndeterminate ? false : checked
                                          }
                                          onCheckedChange={value => {
                                            const next = value === true;
                                            setEntryState(prev => ({
                                              ...prev,
                                              [rawKey]: {
                                                valueType: 'BOOLEAN',
                                                boolValue: next,
                                              },
                                            }));
                                          }}
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            setEntryState(prev => ({
                                              ...prev,
                                              [rawKey]: {
                                                valueType: 'BOOLEAN',
                                                boolValue: null,
                                              },
                                            }))
                                          }
                                        >
                                          Kosongkan
                                        </Button>
                                      </div>
                                    </TableCell>
                                  );
                                }

                                if (param.valueType === 'NUMBER') {
                                  const isError = isOutOfRange(
                                    rawState?.numericValue,
                                    param.rawWaterMinValue ?? null,
                                    param.rawWaterMaxValue ?? null
                                  );
                                  return (
                                    <TableCell key={rawKey}>
                                      <Input
                                        type="number"
                                        inputMode="decimal"
                                        className={
                                          isError
                                            ? 'border-red-500 focus-visible:ring-red-500 bg-red-50'
                                            : ''
                                        }
                                        value={
                                          rawState?.numericValue === null ||
                                          rawState?.numericValue === undefined
                                            ? ''
                                            : String(rawState.numericValue)
                                        }
                                        onChange={e => {
                                          const raw = e.target.value;
                                          setEntryState(prev => ({
                                            ...prev,
                                            [rawKey]: {
                                              valueType: 'NUMBER',
                                              numericValue:
                                                raw === '' ? null : Number(raw),
                                            },
                                          }));
                                        }}
                                      />
                                    </TableCell>
                                  );
                                }

                                return (
                                  <TableCell key={rawKey}>
                                    <Input
                                      value={rawState?.textValue ?? ''}
                                      onChange={e => {
                                        const raw = e.target.value;
                                        setEntryState(prev => ({
                                          ...prev,
                                          [rawKey]: {
                                            valueType: 'TEXT',
                                            textValue: raw,
                                          },
                                        }));
                                      }}
                                    />
                                  </TableCell>
                                );
                              })()}

                              <TableCell className="text-center">
                                {formatRawWaterLimit(param)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            }

            const hasNotes =
              cat === 'GENERAL_CONDITION' || cat === 'JOB_DESCRIPTION';

            if (isMobileView) {
              return (
                <div key={category} className="space-y-4">
                  <h2 className="text-lg font-semibold">{category}</h2>
                  <div className="grid gap-4">
                    {params.map(param => (
                      <MobileEntryCard
                        key={param.id}
                        param={param}
                        machines={machines}
                        entryState={entryState}
                        setEntryState={setEntryState}
                        hasNotes={hasNotes}
                        isWaterMeter={paramName =>
                          cat === 'CONSUMPTION' &&
                          ['before', 'after'].some(k =>
                            paramName.toLowerCase().includes(k)
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{category}</h2>
                </div>

                <div className="rounded-md border">
                  <Table className="w-max!">
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="w-max-plus!">Parameter</TableHead>
                        <TableHead className="">Target</TableHead>
                        {machines.length > 0 ? (
                          machines.map(m => (
                            <TableHead
                              key={m.id}
                              className="min-w-[140px] text-center"
                            >
                              {m.type === 'CHILLER'
                                ? `#${m.unitNumber}`
                                : `CT #${m.unitNumber}`}
                            </TableHead>
                          ))
                        ) : (
                          <TableHead className="min-w-[200px] text-center">
                            Nilai
                          </TableHead>
                        )}
                        {hasNotes && (
                          <TableHead className="min-w-[260px] text-center">
                            Catatan
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {params.map(param => {
                        const targets =
                          machines.length > 0
                            ? machines
                            : ([
                                {
                                  id: 'null',
                                  unitNumber: 0,
                                  type: 'CHILLER' as const,
                                },
                              ] as TMachine[]);
                        return (
                          <TableRow key={param.id}>
                            <TableCell className="w-max-plus!">
                              <div className="font-medium">
                                {param.name}
                                {param.unit ? ` (${param.unit})` : ''}
                              </div>
                            </TableCell>
                            <TableCell>{formatLimit(param)}</TableCell>
                            {targets.map(m => {
                              const machineIdValue =
                                machines.length > 0 ? m.id : null;
                              const key = makeEntryKey(
                                param.id,
                                machineIdValue,
                                'VALUE'
                              );
                              const state = entryState[key];

                              if (param.valueType === 'BOOLEAN') {
                                const checked = state?.boolValue ?? false;
                                const isIndeterminate =
                                  state?.boolValue === null ||
                                  state?.boolValue === undefined;
                                return (
                                  <TableCell key={key} className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <Checkbox
                                        checked={
                                          isIndeterminate ? false : checked
                                        }
                                        onCheckedChange={value => {
                                          const next = value === true;
                                          setEntryState(prev => ({
                                            ...prev,
                                            [key]: {
                                              valueType: 'BOOLEAN',
                                              boolValue: next,
                                            },
                                          }));
                                        }}
                                      />
                                    </div>
                                  </TableCell>
                                );
                              }

                              if (param.valueType === 'NUMBER') {
                                const isWaterMeter =
                                  cat === 'CONSUMPTION' &&
                                  ['before', 'after'].some(k =>
                                    param.name.toLowerCase().includes(k)
                                  );
                                const isError = isOutOfRange(
                                  state?.numericValue,
                                  param.minValue,
                                  param.maxValue
                                );

                                return (
                                  <TableCell key={key}>
                                    <div className="flex flex-col gap-2">
                                      <Input
                                        type="number"
                                        inputMode="decimal"
                                        className={
                                          isError
                                            ? 'border-red-500 focus-visible:ring-red-500 bg-red-50'
                                            : ''
                                        }
                                        value={
                                          state?.numericValue === null ||
                                          state?.numericValue === undefined
                                            ? ''
                                            : String(state.numericValue)
                                        }
                                        onChange={e => {
                                          const raw = e.target.value;
                                          setEntryState(prev => ({
                                            ...prev,
                                            [key]: {
                                              ...prev[key],
                                              valueType: 'NUMBER',
                                              numericValue:
                                                raw === '' ? null : Number(raw),
                                            },
                                          }));
                                        }}
                                      />
                                      {isWaterMeter && (
                                        <CameraInput
                                          value={state?.fileUrl}
                                          onChange={(url, file) => {
                                            setEntryState(prev => ({
                                              ...prev,
                                              [key]: {
                                                ...prev[key],
                                                valueType: 'NUMBER',
                                                numericValue:
                                                  prev[key]?.numericValue ??
                                                  null,
                                                fileUrl: url,
                                                pendingFile: file,
                                              },
                                            }));
                                          }}
                                        />
                                      )}
                                    </div>
                                  </TableCell>
                                );
                              }

                              return (
                                <TableCell key={key}>
                                  <Input
                                    value={state?.textValue ?? ''}
                                    onChange={e => {
                                      const raw = e.target.value;
                                      setEntryState(prev => ({
                                        ...prev,
                                        [key]: {
                                          valueType: 'TEXT',
                                          textValue: raw,
                                        },
                                      }));
                                    }}
                                  />
                                </TableCell>
                              );
                            })}
                            {hasNotes && (
                              <TableCell>
                                {(() => {
                                  const key = makeEntryKey(
                                    param.id,
                                    null,
                                    'NOTE'
                                  );
                                  const state = entryState[key];
                                  return (
                                    <Input
                                      value={state?.textValue ?? ''}
                                      onChange={e => {
                                        const raw = e.target.value;
                                        setEntryState(prev => ({
                                          ...prev,
                                          [key]: {
                                            valueType: 'TEXT',
                                            textValue: raw,
                                          },
                                        }));
                                      }}
                                    />
                                  );
                                })()}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}

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
