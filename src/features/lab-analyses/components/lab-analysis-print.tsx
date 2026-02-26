'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatRawWaterLimit as formatRawWaterLimitCore } from '@/features/parameters/limits-format';

import { Button } from '@/components/ui/button';
import { LabAnalysisColumnKind, ValueType } from '@/generated/prisma/enums';

type ParameterLite = {
  id: string;
  name: string;
  unit: string | null;
  valueType: ValueType;
};

type ParameterOverrideLite = {
  parameterId: string;
  minValue: number | null;
  maxValue: number | null;
  rawWaterMinValue: number | null;
  rawWaterMaxValue: number | null;
};

type LabAnalysisDetailLite = {
  id: string;
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
  project: {
    name: string;
    client: { name: string; address: string | null } | null;
    parameterOverrides: ParameterOverrideLite[];
  };
};

function formatLimit(minValue: number | null, maxValue: number | null) {
  const min = minValue;
  const max = maxValue;

  if (min !== null && max !== null) return `${min}-${max}`;
  if (max !== null) return `≤ ${max}`;
  if (min !== null) return `≥ ${min}`;
  return '-';
}

function formatRawWaterLimit(
  minValue: number | null,
  maxValue: number | null,
  unit: string | null
) {
  return formatRawWaterLimitCore(minValue, maxValue, unit);
}

function formatValue(entry?: {
  valueType: ValueType;
  numericValue: number | null;
  boolValue: boolean | null;
  textValue: string | null;
}) {
  if (!entry) return '';
  if (entry.valueType === 'NUMBER')
    return entry.numericValue == null ? '' : String(entry.numericValue);
  if (entry.valueType === 'BOOLEAN')
    return entry.boolValue == null ? '' : entry.boolValue ? 'Yes' : 'No';
  return entry.textValue ?? '';
}

export function LabAnalysisPrint({
  labAnalysis,
  parameters,
}: {
  labAnalysis: LabAnalysisDetailLite;
  parameters: ParameterLite[];
}) {
  const columns = useMemo(
    () =>
      [...labAnalysis.columns].sort((a, b) => a.displayOrder - b.displayOrder),
    [labAnalysis.columns]
  );

  const overrideByParameterId = useMemo(() => {
    return new Map(
      (labAnalysis.project.parameterOverrides ?? []).map(o => [
        o.parameterId,
        o,
      ])
    );
  }, [labAnalysis.project.parameterOverrides]);

  const entryByKey = useMemo(() => {
    const map = new Map<string, (typeof labAnalysis.entries)[number]>();
    for (const e of labAnalysis.entries) {
      map.set(`${e.parameterId}:${e.columnId}`, e);
    }
    return map;
  }, [labAnalysis.entries]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end print:hidden">
        <Button type="button" onClick={() => window.print()}>
          Print
        </Button>
      </div>

      <div className="bg-white text-black text-sm leading-tight w-[210mm] mx-auto shadow-xl print:shadow-none print:w-full print:mx-0">
        <div className="min-h-[297mm] p-8 print:p-0 flex flex-col">
          <div className="text-center mb-6">
            <div className="text-lg font-bold uppercase">
              Cooling Water Treatment Service Report
            </div>
          </div>

          <div className="flex justify-between gap-6 mb-6">
            <div className="space-y-1">
              <div className="flex gap-2">
                <div className="w-20">Attn</div>
                <div>:</div>
                <div>{labAnalysis.attention || ''}</div>
              </div>
              <div className="flex gap-2">
                <div className="w-20">Cc</div>
                <div>:</div>
                <div>{labAnalysis.cc || ''}</div>
              </div>
              <div className="flex gap-2">
                <div className="w-20">Customer</div>
                <div>:</div>
                <div>
                  {labAnalysis.customer ||
                    labAnalysis.project.client?.name ||
                    ''}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-20">Alamat</div>
                <div>:</div>
                <div className="whitespace-pre-line">
                  {labAnalysis.address ||
                    labAnalysis.project.client?.address ||
                    ''}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex gap-2 justify-end">
                <div className="w-20 text-right">Fax No</div>
                <div>:</div>
                <div className="w-40">{labAnalysis.faxNumber || ''}</div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="w-20 text-right">No</div>
                <div>:</div>
                <div className="w-40">{labAnalysis.reportNumber || ''}</div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="w-20 text-right">Date</div>
                <div>:</div>
                <div className="w-40">
                  {format(new Date(labAnalysis.date), 'dd MMMM yyyy', {
                    locale: id,
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-black text-xs">
              <thead>
                <tr>
                  <th className="border border-black p-2 text-left">
                    PARAMETER
                  </th>
                  {columns.map(col => (
                    <th
                      key={col.id}
                      className="border border-black p-2 text-center"
                    >
                      {col.name}
                    </th>
                  ))}
                  <th className="border border-black p-2 text-center">
                    Raw Limits
                  </th>
                  <th className="border border-black p-2 text-center">
                    Limits
                  </th>
                </tr>
              </thead>
              <tbody>
                {parameters.map(parameter => {
                  const override = overrideByParameterId.get(parameter.id);
                  const rawMin = override?.rawWaterMinValue ?? null;
                  const rawMax = override?.rawWaterMaxValue ?? null;
                  const min = override?.minValue ?? null;
                  const max = override?.maxValue ?? null;

                  return (
                    <tr key={parameter.id}>
                      <td className="border border-black p-2">
                        <div>{parameter.name}</div>
                        {parameter.unit ? (
                          <div className="text-[10px] opacity-70">
                            {parameter.unit}
                          </div>
                        ) : null}
                      </td>
                      {columns.map(col => {
                        const entry = entryByKey.get(
                          `${parameter.id}:${col.id}`
                        );
                        return (
                          <td
                            key={col.id}
                            className="border border-black p-2 text-center"
                          >
                            {formatValue(entry)}
                          </td>
                        );
                      })}
                      <td className="border border-black p-2 text-center">
                        {formatRawWaterLimit(rawMin, rawMax, parameter.unit)}
                      </td>
                      <td className="border border-black p-2 text-center">
                        {formatLimit(min, max)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-4">
            <div className="space-y-1">
              <div className="font-semibold underline">Remark :</div>
              <div className="whitespace-pre-line">
                {labAnalysis.remarks || ''}
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-semibold underline">
                Comment & Recommendations
              </div>
              <div className="whitespace-pre-line">
                {labAnalysis.recommendations || ''}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-12 flex justify-between break-inside-avoid">
            <div className="text-center w-56">
              <p className="mb-24 font-semibold">Customers</p>
              <div className="border-t border-black pt-1">
                <p>
                  {labAnalysis.customer ||
                    labAnalysis.project.client?.name ||
                    ''}
                </p>
              </div>
            </div>
            <div className="text-center w-56">
              <p className="mb-24 font-semibold">Corintek Representative</p>
              <div className="border-t border-black pt-1">
                <p> </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
