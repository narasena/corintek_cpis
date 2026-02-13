'use client';

import { useState, useTransition } from 'react';
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
import { LogSheetPreview } from '@/features/log-sheets/components/log-sheet-preview';
import { CameraInput } from '@/components/camera-input';
import { ChemicalUsageSection } from './components/chemical-usage-section';

import {
  approveLogSheetAction,
  submitLogSheetAction,
} from '@/features/log-sheets/actions';
import { makeEntryKey } from '@/features/log-sheets/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import type { TMachine, TParameter } from './types';
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
    });

  const handleSave = () => {
    const { valid, missingFields } = validateEntries();
    if (!valid) {
      toast.warning('Data belum lengkap', {
        description: `${missingFields.length} field wajib belum diisi. Tetap menyimpan sebagai draft.`,
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

  const handleSubmit = () => {
    const { valid, missingFields } = validateEntries();
    if (!valid) {
      toast.error('Gagal mengirim log sheet', {
        description: `Ada ${missingFields.length} field wajib yang belum diisi. Lengkapi data sebelum mengirim.`,
      });
      return;
    }

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

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveLogSheetAction(logSheetId);
      if (!res.success) {
        toast.error('Gagal menyetujui log sheet', { description: res.error });
        return;
      }
      toast.success('Log sheet disetujui');
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
              onClick={handleSubmit}
              disabled={isPending}
            >
              Kirim
            </Button>
          )}
          {detail.logSheet.status === 'SUBMITTED' && (
            <Button
              variant="secondary"
              onClick={handleApprove}
              disabled={isPending}
            >
              Setujui
            </Button>
          )}
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />{' '}
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Log Sheet: {detail.project.name}
        </h1>
        <p className="text-muted-foreground">
          {formatDate(detail.logSheet.date)} • {detail.logSheet.status}
        </p>
      </div>

      {mode === 'input' && (
        <div className="space-y-6 print:hidden">
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

            // Jika kategori ini butuh mesin tapi tidak ada mesin aktif, tampilkan pesan
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
                            {/* CT Active Entries */}
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

                            {/* Raw Water Entry */}
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
              initialUsages={chemicalState}
              onChange={setChemicalState}
              disabled={isPending}
            />
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <label className="text-sm font-medium">Catatan</label>
            <Textarea
              placeholder="Catatan singkat..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      {mode === 'preview' && (
        <LogSheetPreview
          customerName={detail.project.name}
          date={detail.logSheet.date}
          byName="-"
          replacedByName={replacedByName}
          notes={notes.trim() ? notes.trim() : null}
          machines={activeMachines}
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
            onClick={handleSubmit}
            disabled={isPending}
          >
            Kirim
          </Button>
        </div>
      )}
    </div>
  );
}
