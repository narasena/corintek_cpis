'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  CATEGORY_ORDER,
  LogSheetPreview,
} from './components/log-sheet-preview';
import { CameraInput } from './components/camera-input';
import {
  ChemicalUsageSection,
  type TChemicalUsageState,
} from './components/chemical-usage-section';

import {
  getLogSheetDetailAction,
  saveLogSheetEntriesAction,
  saveLogSheetChemicalsAction,
  uploadLogSheetImageAction,
  updateLogSheetAction,
} from '@/features/log-sheets/actions';
import type { TLogSheetStatus } from '@/features/log-sheets/types';
import { getAllUsersAction } from '@/features/users/actions';
import type { TUserResponse } from '@/@types/user.type';

type TMachine = {
  id: string;
  unitNumber: number;
  type: 'CHILLER' | 'COOLING_TOWER';
};
type TEntryRole = 'VALUE' | 'RAW_WATER' | 'NOTE';
type TParameter = {
  id: string;
  name: string;
  variableName: string;
  category:
    | 'UNIT_CONDENSOR'
    | 'UNIT_EVAPORATOR'
    | 'COOLING_WATER_QUALITY'
    | 'GENERAL_CONDITION'
    | 'JOB_DESCRIPTION'
    | 'CONSUMPTION';
  valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
  unit: string | null;
  minValue: number | null;
  maxValue: number | null;
  rawWaterMinValue?: number | null;
  rawWaterMaxValue?: number | null;
  displayOrder: number;
};

type TDetail = {
  logSheet: {
    id: string;
    projectId: string;
    date: string | Date;
    notes: string | null;
    status: TLogSheetStatus;
    replacedBy?: {
      id: string;
      firstName: string;
      lastName: string | null;
    } | null;
  };
  project: { id: string; name: string; clientName: string | null };
  machines: { chillers: TMachine[]; coolingTowers: TMachine[] };
  parameters: TParameter[];
  entries: Array<{
    parameterId: string;
    machineId: string | null;
    role: TEntryRole;
    valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
    numericValue: number | null;
    boolValue: boolean | null;
    textValue: string | null;
    fileUrl: string | null;
  }>;
  photos: Array<{
    id: string;
    type: 'BEFORE' | 'AFTER';
    url: string;
    caption: string | null;
  }>;
  chemicalUsages: Array<{
    id: string;
    chemicalId: string;
    amount: number;
    chemicalName: string;
    chemicalUnit: string;
  }>;
};

type TEntryState = {
  valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
  numericValue?: number | null;
  boolValue?: boolean | null;
  textValue?: string | null;
  fileUrl?: string | null;
  pendingFile?: File | null;
};

// TPhotoState removed

function makeEntryKey(
  parameterId: string,
  machineId: string | null,
  role: TEntryRole
) {
  return `${parameterId}:${machineId ?? 'null'}:${role}`;
}

function formatDate(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatLimit(
  parameter: Pick<TParameter, 'minValue' | 'maxValue' | 'unit'>
) {
  const unit = parameter.unit ? ` ${parameter.unit}` : '';
  const min = parameter.minValue;
  const max = parameter.maxValue;

  if (min !== null && min !== undefined && max !== null && max !== undefined) {
    return `${min}${unit} ~ ${max}${unit}`;
  }

  if (max !== null && max !== undefined) {
    return `≤ ${max}${unit}`;
  }

  if (min !== null && min !== undefined) {
    return `≥ ${min}${unit}`;
  }

  return '-';
}

function formatRawWaterLimit(
  parameter: Pick<TParameter, 'rawWaterMinValue' | 'rawWaterMaxValue' | 'unit'>
) {
  const unit = parameter.unit ? ` ${parameter.unit}` : '';
  const min = parameter.rawWaterMinValue;
  const max = parameter.rawWaterMaxValue;

  if (min !== null && min !== undefined && max !== null && max !== undefined) {
    return `${min}${unit} ~ ${max}${unit}`;
  }

  if (max !== null && max !== undefined) {
    return `≤ ${max}${unit}`;
  }

  if (min !== null && min !== undefined) {
    return `≥ ${min}${unit}`;
  }

  return '-';
}

function isOutOfRange(
  value: number | null | undefined,
  min: number | null,
  max: number | null
) {
  if (value === null || value === undefined) return false;
  if (min !== null && value < min) return true;
  if (max !== null && value > max) return true;
  return false;
}

export default function LogSheetDetailPage() {
  const params = useParams<{ projectId: string; logSheetId: string }>();
  const router = useRouter();
  const projectId = params.projectId;
  const logSheetId = params.logSheetId;

  const [detail, setDetail] = useState<TDetail | null>(null);
  const [mode, setMode] = useState<'input' | 'preview'>('input');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<TLogSheetStatus>('DRAFT');
  const [replacedByUserId, setReplacedByUserId] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<TUserResponse[]>([]);
  const [entryState, setEntryState] = useState<Record<string, TEntryState>>({});
  const [chemicalState, setChemicalState] = useState<TChemicalUsageState>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getLogSheetDetailAction(logSheetId);
      if (!result.success || !result.data) {
        toast.error('Gagal mengambil detail log sheet', {
          description: result.error,
        });
        return;
      }

      const d = result.data as unknown as TDetail;
      setDetail(d);
      setNotes(d.logSheet.notes ?? '');
      setStatus(d.logSheet.status);
      setReplacedByUserId(d.logSheet.replacedBy?.id ?? null);

      const initial: Record<string, TEntryState> = {};
      for (const entry of d.entries) {
        initial[makeEntryKey(entry.parameterId, entry.machineId, entry.role)] =
          {
            valueType: entry.valueType,
            numericValue: entry.numericValue,
            boolValue: entry.boolValue,
            textValue: entry.textValue,
            fileUrl: entry.fileUrl,
          };
      }
      setEntryState(initial);

      const chemicals = d.chemicalUsages.map(u => ({
        id: u.id,
        chemicalId: u.chemicalId,
        amount: u.amount,
        chemicalName: u.chemicalName,
        unit: u.chemicalUnit,
      }));
      setChemicalState(chemicals);
    } catch {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, [logSheetId]);

  useEffect(() => {
    fetchData();
    getAllUsersAction().then(res => {
      if (res.success && res.data) {
        setTechnicians(res.data);
      }
    });
  }, [fetchData]);

  const categories = useMemo(() => {
    if (!detail) return [];
    const unique = Array.from(new Set(detail.parameters.map(p => p.category)));
    return unique.sort((a, b) => {
      return CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b);
    });
  }, [detail]);

  const parametersByCategory = useMemo(() => {
    const map = new Map<string, TParameter[]>();
    if (!detail) return map;
    for (const p of detail.parameters) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    for (const [key, list] of map.entries()) {
      map.set(
        key,
        [...list].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      );
    }
    return map;
  }, [detail]);

  const machinesForCategory = useCallback(
    (category: TParameter['category']) => {
      if (!detail) return { machines: [] as TMachine[], label: '' };
      if (category === 'UNIT_CONDENSOR' || category === 'UNIT_EVAPORATOR') {
        return { machines: detail.machines.chillers, label: 'Chiller' };
      }
      if (
        category === 'COOLING_WATER_QUALITY' ||
        category === 'GENERAL_CONDITION' ||
        category === 'JOB_DESCRIPTION'
      ) {
        return {
          machines: detail.machines.coolingTowers,
          label: 'Cooling Tower',
        };
      }
      return { machines: [] as TMachine[], label: '' };
    },
    [detail]
  );

  const replacedByName = useMemo(() => {
    if (!replacedByUserId) return null;

    const tech = technicians.find(t => t.id === replacedByUserId);
    if (tech) return `${tech.firstName} ${tech.lastName || ''}`.trim();

    if (detail?.logSheet.replacedBy?.id === replacedByUserId) {
      return `${detail.logSheet.replacedBy.firstName} ${
        detail.logSheet.replacedBy.lastName || ''
      }`.trim();
    }

    return null;
  }, [replacedByUserId, technicians, detail]);

  const handleSave = () => {
    if (!detail) return;
    startTransition(async () => {
      const headerRes = await updateLogSheetAction({
        id: logSheetId,
        notes: notes.trim() ? notes.trim() : undefined,
        status,
        replacedByUserId,
      });

      if (!headerRes.success) {
        toast.error('Gagal menyimpan header log sheet', {
          description: headerRes.error,
        });
        return;
      }

      const keys = Object.keys(entryState);
      const uploadedUrls: Record<string, string> = {};

      // Upload pending files
      for (const key of keys) {
        const entry = entryState[key];
        if (entry.pendingFile) {
          try {
            const formData = new FormData();
            formData.append('file', entry.pendingFile);
            // Append context IDs for better file organization
            if (projectId) formData.append('projectId', projectId);
            if (logSheetId) formData.append('logSheetId', logSheetId);

            const uploadRes = await uploadLogSheetImageAction(formData);

            if (uploadRes.success && uploadRes.url) {
              uploadedUrls[key] = uploadRes.url;
            } else {
              toast.error('Gagal mengupload foto', {
                description: uploadRes.error,
              });
              // Don't return here, try to save other data
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Upload error:', e);
            toast.error('Gagal mengupload foto');
          }
        }
      }

      const entriesToSave = keys.map(key => {
        const [parameterId, machineIdStr, roleStr] = key.split(':');
        const machineId = machineIdStr === 'null' ? null : machineIdStr;
        const role = roleStr as TEntryRole;
        const state = entryState[key];

        // Use uploaded URL if available, otherwise existing URL
        const fileUrl = uploadedUrls[key] || state.fileUrl;

        return {
          parameterId,
          machineId,
          role,
          valueType: state.valueType,
          numericValue: state.numericValue,
          boolValue: state.boolValue,
          textValue: state.textValue,
          fileUrl,
        };
      });

      const entriesRes = await saveLogSheetEntriesAction({
        logSheetId,
        entries: entriesToSave,
      });

      const chemicalRes = await saveLogSheetChemicalsAction({
        logSheetId,
        usages: chemicalState
          .filter(c => c.chemicalId && c.amount > 0)
          .map(c => ({
            id: c.id,
            chemicalId: c.chemicalId,
            amount: c.amount,
          })),
      });

      if (entriesRes.success && chemicalRes.success) {
        toast.success('Log sheet berhasil disimpan');
      } else {
        if (!entriesRes.success) {
          toast.error('Gagal menyimpan entry log sheet', {
            description: entriesRes.error,
          });
        }
        if (!chemicalRes.success) {
          toast.error('Gagal menyimpan data chemical', {
            description: chemicalRes.error,
          });
        }
      }
      router.refresh();
      // Reload data to ensure fresh state
      fetchData();
    });
  };

  const handlePrint = () => {
    setMode('preview');
    setTimeout(() => window.print(), 0);
  };

  if (loading || !detail) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-8 print:p-0 print:max-w-none print:mx-0 print:space-y-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/log-sheets/${projectId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Log Sheet: {detail.project.name}
            </h1>
            <p className="text-muted-foreground">
              {formatDate(detail.logSheet.date)} • {detail.logSheet.status}
            </p>
          </div>
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
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />{' '}
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>

      {mode === 'input' && (
        <div className="space-y-6 print:hidden">
          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={status}
                onValueChange={v => setStatus(v as TLogSheetStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">DRAFT</SelectItem>
                  <SelectItem value="SUBMITTED">SUBMITTED</SelectItem>
                  <SelectItem value="APPROVED">APPROVED</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="md:col-span-6 space-y-2">
              <label className="text-sm font-medium">Catatan</label>
              <Textarea
                placeholder="Catatan singkat..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Foto Dokumentasi Section Removed */}

          {categories.map(category => {
            const params = parametersByCategory.get(category) ?? [];
            const cat = category as TParameter['category'];
            const { machines } = machinesForCategory(cat);
            if (params.length === 0) return null;

            if (cat === 'COOLING_WATER_QUALITY') {
              const ctMachines = detail.machines.coolingTowers;
              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{category}</h2>
                  </div>

                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="min-w-[220px]">
                            Parameter
                          </TableHead>
                          <TableHead className="min-w-[160px]">
                            Target
                          </TableHead>
                          {ctMachines.map(m => (
                            <TableHead
                              key={m.id}
                              className="min-w-[140px] text-center"
                            >
                              {`CT #${m.unitNumber}`}
                            </TableHead>
                          ))}
                          <TableHead className="min-w-[200px] text-center">
                            Raw Water
                          </TableHead>
                          <TableHead className="min-w-[160px] text-center">
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
                              {ctMachines.map(m => {
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
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{category}</h2>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="min-w-[220px]">
                          Parameter
                        </TableHead>
                        <TableHead className="min-w-[160px]">Target</TableHead>
                        {machines.length > 0 ? (
                          machines.map(m => (
                            <TableHead
                              key={m.id}
                              className="min-w-[140px] text-center"
                            >
                              {m.type === 'CHILLER'
                                ? `Chiller #${m.unitNumber}`
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
                            <TableCell>
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
        </div>
      )}

      {mode === 'preview' && (
        <LogSheetPreview
          customerName={detail.project.name}
          date={detail.logSheet.date}
          byName="-"
          replacedByName={replacedByName}
          notes={notes.trim() ? notes.trim() : null}
          machines={detail.machines}
          parameters={detail.parameters}
          valuesByKey={entryState}
          photos={[]}
          chemicalUsages={chemicalState}
        />
      )}
    </div>
  );
}
