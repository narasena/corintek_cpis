'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { LabAnalysisColumnKind, ValueType } from '@/generated/prisma/enums';

import { createLabAnalysisAction, updateLabAnalysisAction } from '../actions';

type ParameterLite = {
  id: string;
  name: string;
  unit: string | null;
  valueType: ValueType;
};

type ColumnState = {
  key: string;
  id?: string;
  tempId?: string;
  name: string;
  kind: LabAnalysisColumnKind;
  displayOrder: number;
};

type LabAnalysisDetailLite = {
  id: string;
  projectId: string;
  date: Date;
  attention: string | null;
  cc: string | null;
  customer: string | null;
  address: string | null;
  faxNumber: string | null;
  reportNumber: string | null;
  remarks: string | null;
  recommendations: string | null;
  columns: Array<{
    id: string;
    name: string;
    kind: LabAnalysisColumnKind;
    displayOrder: number;
  }>;
  entries: Array<{
    parameterId: string;
    columnId: string;
    valueType: ValueType;
    numericValue: number | null;
    boolValue: boolean | null;
    textValue: string | null;
  }>;
};

export function LabAnalysisForm({
  mode,
  projectId,
  parameters,
  defaultCustomer,
  defaultAddress,
  initialData,
}: {
  mode: 'create' | 'edit';
  projectId: string;
  parameters: ParameterLite[];
  defaultCustomer?: string;
  defaultAddress?: string;
  initialData?: LabAnalysisDetailLite;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [date, setDate] = useState<Date | undefined>(
    initialData?.date ?? new Date()
  );
  const [attention, setAttention] = useState(initialData?.attention ?? '');
  const [cc, setCc] = useState(initialData?.cc ?? '');
  const [customer, setCustomer] = useState(
    initialData?.customer ?? defaultCustomer ?? ''
  );
  const [address, setAddress] = useState(
    initialData?.address ?? defaultAddress ?? ''
  );
  const [faxNumber, setFaxNumber] = useState(initialData?.faxNumber ?? '');
  const [reportNumber, setReportNumber] = useState(
    initialData?.reportNumber ?? ''
  );
  const [remarks, setRemarks] = useState(initialData?.remarks ?? '');
  const [recommendations, setRecommendations] = useState(
    initialData?.recommendations ?? ''
  );

  const [columns, setColumns] = useState<ColumnState[]>(() => {
    if (initialData?.columns?.length) {
      return [...initialData.columns]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(c => ({
          key: c.id,
          id: c.id,
          name: c.name,
          kind: c.kind,
          displayOrder: c.displayOrder,
        }));
    }

    const rawId = crypto.randomUUID();
    const ctwId = crypto.randomUUID();
    const chwId = crypto.randomUUID();

    return [
      {
        key: rawId,
        tempId: rawId,
        name: 'Raw',
        kind: LabAnalysisColumnKind.RAW_WATER,
        displayOrder: 0,
      },
      {
        key: ctwId,
        tempId: ctwId,
        name: 'CTW',
        kind: LabAnalysisColumnKind.CTW,
        displayOrder: 1,
      },
      {
        key: chwId,
        tempId: chwId,
        name: 'CHW',
        kind: LabAnalysisColumnKind.CHW,
        displayOrder: 2,
      },
    ];
  });

  const initialCellValues = useMemo(() => {
    const next: Record<string, string> = {};
    for (const entry of initialData?.entries ?? []) {
      const key = `${entry.parameterId}:${entry.columnId}`;
      if (entry.valueType === 'NUMBER') {
        next[key] =
          entry.numericValue == null ? '' : String(entry.numericValue);
      } else if (entry.valueType === 'BOOLEAN') {
        next[key] =
          entry.boolValue == null ? '' : entry.boolValue ? 'true' : 'false';
      } else {
        next[key] = entry.textValue ?? '';
      }
    }
    return next;
  }, [initialData?.entries]);

  const [cellValues, setCellValues] =
    useState<Record<string, string>>(initialCellValues);

  function setCellValue(parameterId: string, columnKey: string, value: string) {
    setCellValues(prev => ({
      ...prev,
      [`${parameterId}:${columnKey}`]: value,
    }));
  }

  function getCellValue(parameterId: string, columnKey: string) {
    return cellValues[`${parameterId}:${columnKey}`] ?? '';
  }

  function addColumn() {
    const tempId = crypto.randomUUID();
    setColumns(prev => [
      ...prev,
      {
        key: tempId,
        tempId,
        name: `Kolom ${prev.length + 1}`,
        kind: LabAnalysisColumnKind.OTHER,
        displayOrder: prev.length,
      },
    ]);
  }

  function removeColumn(columnKey: string) {
    setColumns(prev => prev.filter(c => c.key !== columnKey));
    setCellValues(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.endsWith(`:${columnKey}`)) delete next[key];
      }
      return next;
    });
  }

  function updateColumn(columnKey: string, patch: Partial<ColumnState>) {
    setColumns(prev =>
      prev
        .map(c => (c.key === columnKey ? { ...c, ...patch } : c))
        .map((c, idx) => ({ ...c, displayOrder: idx }))
    );
  }

  function parseEntryValue(
    parameter: ParameterLite,
    rawValue: string
  ): {
    valueType: ValueType;
    numericValue?: number | null;
    boolValue?: boolean | null;
    textValue?: string | null;
  } {
    if (parameter.valueType === 'NUMBER') {
      if (rawValue.trim() === '')
        return { valueType: 'NUMBER', numericValue: null };
      const parsed = Number(rawValue);
      if (Number.isNaN(parsed)) throw new Error('Nilai harus angka');
      return { valueType: 'NUMBER', numericValue: parsed };
    }

    if (parameter.valueType === 'BOOLEAN') {
      if (rawValue === '') return { valueType: 'BOOLEAN', boolValue: null };
      if (rawValue === 'true') return { valueType: 'BOOLEAN', boolValue: true };
      if (rawValue === 'false')
        return { valueType: 'BOOLEAN', boolValue: false };
      throw new Error('Nilai boolean tidak valid');
    }

    if (rawValue.trim() === '') return { valueType: 'TEXT', textValue: null };
    return { valueType: 'TEXT', textValue: rawValue };
  }

  function handleSubmit() {
    if (!date) {
      toast.error('Tanggal wajib diisi');
      return;
    }
    if (columns.length === 0) {
      toast.error('Minimal 1 kolom');
      return;
    }
    if (columns.some(c => !c.name.trim())) {
      toast.error('Nama kolom wajib diisi');
      return;
    }

    startTransition(async () => {
      try {
        const payloadColumns = columns.map(c => ({
          id: c.id,
          tempId: c.tempId,
          name: c.name.trim(),
          kind: c.kind,
          displayOrder: c.displayOrder,
        }));

        const entries: any[] = [];
        for (const parameter of parameters) {
          for (const col of columns) {
            const rawValue = getCellValue(parameter.id, col.key);
            const parsed = parseEntryValue(parameter, rawValue);
            entries.push({
              parameterId: parameter.id,
              columnId: col.id,
              columnTempId: col.id ? undefined : col.tempId,
              ...parsed,
            });
          }
        }

        const baseInput = {
          projectId,
          date: date,
          attention,
          cc,
          customer,
          address,
          faxNumber,
          reportNumber,
          remarks,
          recommendations,
          columns: payloadColumns,
          entries,
        };

        const result =
          mode === 'edit' && initialData?.id
            ? await updateLabAnalysisAction({
                ...baseInput,
                id: initialData.id,
              })
            : await createLabAnalysisAction(baseInput);

        if (!result.success) {
          toast.error('Gagal menyimpan', {
            description: (result as any).message || 'Terjadi kesalahan',
          });
          return;
        }

        toast.success('Berhasil disimpan');
        router.push(`/lab-analyses/${projectId}`);
      } catch (error) {
        toast.error('Gagal menyimpan', {
          description:
            error instanceof Error ? error.message : 'Terjadi kesalahan',
        });
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Tanggal</Label>
          <DatePicker date={date} setDate={setDate} />
        </div>
        <div className="space-y-2">
          <Label>No</Label>
          <Input
            value={reportNumber}
            onChange={e => setReportNumber(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Fax No</Label>
          <Input
            value={faxNumber}
            onChange={e => setFaxNumber(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Attn</Label>
          <Input
            value={attention}
            onChange={e => setAttention(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Cc</Label>
          <Input value={cc} onChange={e => setCc(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Customer</Label>
          <Input value={customer} onChange={e => setCustomer(e.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Alamat</Label>
          <Input value={address} onChange={e => setAddress(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Kolom Hasil</h2>
          <Button type="button" variant="outline" onClick={addColumn}>
            Tambah Kolom
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {columns.map(col => (
            <div key={col.key} className="space-y-2 rounded-md border p-3">
              <div className="space-y-1">
                <Label>Nama</Label>
                <Input
                  value={col.name}
                  onChange={e =>
                    updateColumn(col.key, { name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Tipe</Label>
                <Select
                  value={col.kind}
                  onValueChange={v =>
                    updateColumn(col.key, { kind: v as LabAnalysisColumnKind })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LabAnalysisColumnKind.RAW_WATER}>
                      Raw Water
                    </SelectItem>
                    <SelectItem value={LabAnalysisColumnKind.CTW}>
                      CTW
                    </SelectItem>
                    <SelectItem value={LabAnalysisColumnKind.CHW}>
                      CHW
                    </SelectItem>
                    <SelectItem value={LabAnalysisColumnKind.OTHER}>
                      Lainnya
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-red-600 hover:text-red-700"
                onClick={() => removeColumn(col.key)}
                disabled={columns.length <= 1}
              >
                Hapus Kolom
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Parameter</h2>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="p-3 text-left text-sm font-medium">Parameter</th>
                {columns.map(col => (
                  <th
                    key={col.key}
                    className="p-3 text-left text-sm font-medium"
                  >
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parameters.map(parameter => (
                <tr key={parameter.id} className="border-b last:border-b-0">
                  <td className="p-3 align-top">
                    <div className="font-medium">{parameter.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {parameter.unit || ''}
                    </div>
                  </td>
                  {columns.map(col => (
                    <td key={col.key} className="p-3 align-top">
                      {parameter.valueType === 'BOOLEAN' ? (
                        <Select
                          value={getCellValue(parameter.id, col.key)}
                          onValueChange={v =>
                            setCellValue(parameter.id, col.key, v)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Ya</SelectItem>
                            <SelectItem value="false">Tidak</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={getCellValue(parameter.id, col.key)}
                          onChange={e =>
                            setCellValue(parameter.id, col.key, e.target.value)
                          }
                          className={cn(
                            parameter.valueType === 'NUMBER' && 'w-[140px]'
                          )}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Remark</Label>
          <Textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={6}
          />
        </div>
        <div className="space-y-2">
          <Label>Comment & Recommendations</Label>
          <Textarea
            value={recommendations}
            onChange={e => setRecommendations(e.target.value)}
            rows={6}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/lab-analyses/${projectId}`)}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </div>
  );
}
