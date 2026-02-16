'use client';

import React, { ReactNode } from 'react';
import { LogSheetHeader } from './log-sheet-header';
import { makeEntryKey } from '../utils';
import type {
  TPreviewParameter,
  TPreviewMachine,
  TLogSheetPhoto,
  TEntryState,
} from '../types';

function formatLimit(
  parameter: Pick<
    TPreviewParameter,
    'minValue' | 'maxValue' | 'unit' | 'valueType' | 'category' | 'variableName'
  >
) {
  const min = parameter.minValue;
  const max = parameter.maxValue;

  if (min !== null && min !== undefined && max !== null && max !== undefined) {
    return `${min}-${max}`;
  }

  if (max !== null && max !== undefined) {
    return `≤ ${max}`;
  }

  if (min !== null && min !== undefined) {
    return `≥ ${min}`;
  }

  if (parameter.valueType === 'BOOLEAN') {
    if (parameter.category === 'JOB_DESCRIPTION') return 'Progress/No';
    if (parameter.category === 'GENERAL_CONDITION') {
      if (parameter.variableName.includes('running_')) {
        return 'Running/Stop';
      }
      if (parameter.variableName.includes('deposit')) {
        return 'Normal';
      }
      return 'Yes/No';
    }
    return 'Normal';
  }

  return '';
}

function formatRawWaterLimit(
  parameter: Pick<
    TPreviewParameter,
    'rawWaterMinValue' | 'rawWaterMaxValue' | 'unit'
  >
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

  return '';
}

function formatValue(state?: TEntryState) {
  if (!state) return '';

  if (state.valueType === 'BOOLEAN') {
    if (state.boolValue === null || state.boolValue === undefined) return '';
    return state.boolValue ? 'Yes' : 'No';
  }

  if (state.valueType === 'NUMBER') {
    if (state.numericValue === null || state.numericValue === undefined)
      return '';
    return String(state.numericValue);
  }

  if (state.textValue === null || state.textValue === undefined) return '';
  return state.textValue;
}

const sectionTitle: Record<TPreviewParameter['category'], string> = {
  UNIT_CONDENSOR: 'Unit Condensor',
  UNIT_EVAPORATOR: 'Unit Evaporator',
  COOLING_WATER_QUALITY: 'Check Water Quality',
  GENERAL_CONDITION: 'General Condition',
  JOB_DESCRIPTION: 'Job Description',
  CONSUMPTION: 'Consumption',
};

export const CATEGORY_ORDER: TPreviewParameter['category'][] = [
  'UNIT_CONDENSOR',
  'UNIT_EVAPORATOR',
  'COOLING_WATER_QUALITY',
  'GENERAL_CONDITION',
  'JOB_DESCRIPTION',
  'CONSUMPTION',
];

function machinesForCategory(
  category: TPreviewParameter['category'],
  machines: { chillers: TPreviewMachine[]; coolingTowers: TPreviewMachine[] }
) {
  if (!machines) return [];
  if (category === 'UNIT_CONDENSOR' || category === 'UNIT_EVAPORATOR') {
    return machines.chillers || [];
  }
  if (
    category === 'COOLING_WATER_QUALITY' ||
    category === 'GENERAL_CONDITION' ||
    category === 'JOB_DESCRIPTION'
  ) {
    return machines.coolingTowers || [];
  }
  return [];
}

export function LogSheetPreview({
  customerName,
  date,
  byName,
  submittedAt,
  replacedByName,
  corintekPicName,
  approvedAt,
  clientPicName,
  technicianSignatureUrl,
  clientPicSignatureUrl,
  notes,
  machines,
  parameters,
  valuesByKey,
  photos,
  chemicalUsages,
}: {
  customerName: string;
  date: string | Date;
  byName: string;
  submittedAt?: string | Date | null;
  replacedByName?: string | null;
  corintekPicName?: string | null;
  approvedAt?: string | Date | null;
  clientPicName?: string | null;
  technicianSignatureUrl?: string | null;
  clientPicSignatureUrl?: string | null;
  notes: string | null;
  machines: { chillers: TPreviewMachine[]; coolingTowers: TPreviewMachine[] };
  parameters: TPreviewParameter[];
  valuesByKey: Record<string, TEntryState | undefined>;
  photos: TLogSheetPhoto[];
  chemicalUsages?: Array<{
    chemicalName?: string;
    amount: number;
    unit?: string;
  }>;
}) {
  const submittedAtText =
    submittedAt && new Date(submittedAt).toString() !== 'Invalid Date'
      ? new Date(submittedAt).toLocaleDateString('id-ID')
      : '';
  const approvedAtText =
    approvedAt && new Date(approvedAt).toString() !== 'Invalid Date'
      ? new Date(approvedAt).toLocaleDateString('id-ID')
      : '';

  // Override category for Deposit parameter to ensure it appears in General Condition
  const displayParameters = parameters.map(p => {
    if (p.variableName.includes('deposit')) {
      return { ...p, category: 'GENERAL_CONDITION' as const };
    }
    return p;
  });

  const categories = Array.from(
    new Set((displayParameters || []).map(p => p.category))
  ).sort((a, b) => {
    return (
      (CATEGORY_ORDER || []).indexOf(a) - (CATEGORY_ORDER || []).indexOf(b)
    );
  });

  const paramsByCategory = new Map<
    TPreviewParameter['category'],
    TPreviewParameter[]
  >();
  for (const p of displayParameters) {
    if (!paramsByCategory.has(p.category)) paramsByCategory.set(p.category, []);
    paramsByCategory.get(p.category)!.push(p);
  }
  for (const [key, list] of paramsByCategory.entries()) {
    if (key === 'GENERAL_CONDITION') {
      const order = ['running', 'algae', 'deposit'];
      const getOrder = (p: TPreviewParameter) => {
        const idx = order.findIndex(k =>
          p.variableName.toLowerCase().includes(k)
        );
        return idx === -1 ? 999 : idx;
      };
      paramsByCategory.set(
        key,
        [...list].sort((a, b) => {
          const diff = getOrder(a) - getOrder(b);
          if (diff !== 0) return diff;
          return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
        })
      );
    } else {
      paramsByCategory.set(
        key,
        [...list].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      );
    }
  }

  const photoEntries = displayParameters.flatMap(param => {
    if (param.category !== 'CONSUMPTION') return [];
    const isWaterMeter = ['before', 'after'].some(k =>
      param.name.toLowerCase().includes(k)
    );
    if (!isWaterMeter) return [];

    const key = makeEntryKey(param.id, null, 'VALUE');
    const entry = valuesByKey[key];
    if (entry?.fileUrl) {
      return [{ param, url: entry.fileUrl }];
    }
    return [];
  });

  const beforePhotos = photos.filter(photo => photo.type === 'BEFORE');
  const afterPhotos = photos.filter(photo => photo.type === 'AFTER');
  const hasDocumentation =
    photoEntries.length > 0 ||
    beforePhotos.length > 0 ||
    afterPhotos.length > 0;

  return (
    <div className="bg-white text-black text-[11px] leading-tight w-[210mm] min-h-[297mm] mx-auto shadow-xl print:shadow-none print:w-full print:min-h-0 print:mx-0 print:text-[11px]">
      <div className="print:hidden mb-2 text-xs text-muted-foreground p-2 text-center">
        Mode cetak: gunakan tombol Print pada halaman ini.
      </div>

      <div className="border border-black border-b-0 p-1">
        <LogSheetHeader
          customerName={customerName}
          date={date}
          byName={byName}
          replacedByName={replacedByName}
        />
      </div>

      <div className="flex flex-col border border-black border-t-0">
        {categories.map((category, index) => {
          const params =
            paramsByCategory.get(category as TPreviewParameter['category']) ??
            [];
          if (params.length === 0) return null;

          const cat = category as TPreviewParameter['category'];
          const sectionMachines = machinesForCategory(cat, machines);
          const hasNotes =
            cat === 'GENERAL_CONDITION' || cat === 'JOB_DESCRIPTION';
          const showLimit = !['CONSUMPTION'].includes(cat);

          // Render Logic for Consumption + Chemical
          if (cat === 'CONSUMPTION') {
            const waterKeywords = ['before', 'after', 'total', 'consumption'];
            const waterParams = params.filter(p =>
              waterKeywords.some(k => p.name.toLowerCase().includes(k))
            );

            return (
              <div key={category} className="flex border-t border-black">
                <div className="w-max border-r border-black">
                  <table className="w-max table-fixed border-collapse">
                    <colgroup>
                      <col className="w-max" />
                      <col className="min-w-20" />
                    </colgroup>
                    <thead>
                      <tr className="bg-blue-200 print:bg-blue-200">
                        <th className="border-b border-black p-[2px] text-left font-bold">
                          {sectionTitle[cat]} Water Meter
                        </th>
                        <th className="border-b border-l border-black p-[2px] text-center font-bold">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {waterParams.map(param => {
                        const key = makeEntryKey(param.id, null, 'VALUE');
                        return (
                          <tr key={param.id}>
                            <td className="border-b border-black p-[2px] font-semibold break-words">
                              {param.name}
                              {param.unit ? ` (${param.unit})` : ''}
                            </td>
                            <td className="border-b border-l border-black p-[2px] text-center">
                              {formatValue(valuesByKey[key]) || ''}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="w-full">
                  <table className="w-full table-fixed border-collapse h-full">
                    <thead>
                      <tr className="bg-blue-200 print:bg-blue-200">
                        <th className="border-b border-black p-[2px] text-center font-bold">
                          Fill Up Chemical
                        </th>
                        {(chemicalUsages || []).length > 0 ? (
                          (chemicalUsages || []).map((c, i) => (
                            <th
                              key={i}
                              className="border-b border-l border-black p-[2px] text-center font-bold"
                            >
                              {c.chemicalName || '-'}
                            </th>
                          ))
                        ) : (
                          <th className="border-b border-l border-black p-[2px] text-center font-bold">
                            -
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-b border-black p-[2px] text-center font-semibold">
                          Quantity
                        </td>
                        {(chemicalUsages || []).length > 0 ? (
                          (chemicalUsages || []).map((c, i) => (
                            <td
                              key={i}
                              className="border-b border-l border-black p-[2px] text-center"
                            >
                              {c.amount} {c.unit || ''}
                            </td>
                          ))
                        ) : (
                          <td className="border-b border-l border-black p-[2px] text-center">
                            -
                          </td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          return (
            <div
              key={category}
              className={`overflow-x-auto ${index > 0 ? 'border-t border-black' : ''}`}
            >
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col className="w-[140px]" />
                  {showLimit && <col className="w-[80px]" />}
                </colgroup>
                <thead>
                  <tr className="bg-blue-200 print:bg-blue-200">
                    <th className="border-b border-r border-black p-[2px] text-left font-bold">
                      {sectionTitle[cat]}
                    </th>
                    {showLimit && (
                      <th className="border-b border-r border-black p-[2px] text-center font-bold">
                        {['GENERAL_CONDITION', 'JOB_DESCRIPTION'].includes(cat)
                          ? ''
                          : 'Limit'}
                      </th>
                    )}
                    {cat === 'COOLING_WATER_QUALITY' ? (
                      <>
                        {sectionMachines.map(m => (
                          <th
                            key={`${category}-m-${m.id}`}
                            className="border-b border-r border-black p-[2px] text-center font-bold"
                          >
                            {`#${m.unitNumber}`}
                          </th>
                        ))}
                        <th className="border-b border-black p-[2px] text-center font-bold">
                          Raw Water
                        </th>
                        <th className="border-b border-l border-black p-[2px] text-center font-bold">
                          Raw Limit
                        </th>
                      </>
                    ) : sectionMachines.length > 0 ? (
                      <>
                        {sectionMachines.map((m, idx) => (
                          <th
                            key={`${category}-m-${m.id}`}
                            className={`border-b border-black p-[2px] text-center font-bold ${
                              idx < sectionMachines.length - 1 || hasNotes
                                ? 'border-r'
                                : ''
                            }`}
                          >
                            {`#${m.unitNumber}`}
                          </th>
                        ))}
                        {hasNotes && (
                          <th className="border-b border-black p-[2px] text-center font-bold">
                            Catatan
                          </th>
                        )}
                      </>
                    ) : (
                      <>
                        <th
                          className={`border-b border-black p-[2px] text-center font-bold ${hasNotes ? 'border-r' : ''}`}
                        >
                          Value
                        </th>
                        {hasNotes && (
                          <th className="border-b border-black p-[2px] text-center font-bold">
                            Catatan
                          </th>
                        )}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {params.map((param, pIdx) => {
                    const limit = formatLimit(param);
                    const valueCells: ReactNode[] = [];
                    const isLastRow = pIdx === params.length - 1;
                    const cellBorder = isLastRow ? '' : 'border-b';

                    if (cat === 'COOLING_WATER_QUALITY') {
                      for (const m of sectionMachines) {
                        const key = makeEntryKey(param.id, m.id, 'VALUE');
                        valueCells.push(
                          <td
                            key={`${param.id}-v-${m.id}`}
                            className={`${cellBorder} border-r border-black p-[2px] text-center`}
                          >
                            {formatValue(valuesByKey[key]) || ''}
                          </td>
                        );
                      }

                      const rawKey = makeEntryKey(param.id, null, 'RAW_WATER');
                      valueCells.push(
                        <td
                          key={`${param.id}-raw`}
                          className={`${cellBorder} border-black p-[2px] text-center`}
                        >
                          {formatValue(valuesByKey[rawKey]) || ''}
                        </td>
                      );
                      const rawLimit = formatRawWaterLimit(param);
                      valueCells.push(
                        <td
                          key={`${param.id}-raw-limit`}
                          className={`${cellBorder} border-l border-black p-[2px] text-center`}
                        >
                          {rawLimit || ''}
                        </td>
                      );
                    } else {
                      if (sectionMachines.length > 0) {
                        for (const [idx, m] of sectionMachines.entries()) {
                          const key = makeEntryKey(param.id, m.id, 'VALUE');
                          valueCells.push(
                            <td
                              key={`${param.id}-v-${m.id}`}
                              className={`${cellBorder} border-black p-[2px] text-center ${
                                idx < sectionMachines.length - 1 || hasNotes
                                  ? 'border-r'
                                  : ''
                              }`}
                            >
                              {formatValue(valuesByKey[key]) || ''}
                            </td>
                          );
                        }
                      } else {
                        const key = makeEntryKey(param.id, null, 'VALUE');
                        valueCells.push(
                          <td
                            key={`${param.id}-v-null`}
                            className={`${cellBorder} border-black p-[2px] text-center ${hasNotes ? 'border-r' : ''}`}
                          >
                            {formatValue(valuesByKey[key]) || ''}
                          </td>
                        );
                      }

                      if (hasNotes) {
                        const noteKey = makeEntryKey(param.id, null, 'NOTE');
                        valueCells.push(
                          <td
                            key={`${param.id}-note`}
                            className={`${cellBorder} border-black p-[2px] text-center`}
                          >
                            {formatValue(valuesByKey[noteKey]) || ''}
                          </td>
                        );
                      }
                    }

                    return (
                      <tr key={param.id}>
                        <td
                          className={`${cellBorder} border-r border-black p-[2px] font-semibold break-words`}
                        >
                          {param.name}
                          {param.unit ? ` (${param.unit})` : ''}
                        </td>
                        {showLimit && (
                          <td
                            className={`${cellBorder} border-r border-black p-[2px] text-center`}
                          >
                            {limit || ''}
                          </td>
                        )}
                        {valueCells}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Note Section */}
        <div className="border-t border-black">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[180px]" />
            </colgroup>
            <thead>
              <tr>
                <th className="border-r border-black bg-blue-200 print:bg-blue-200 p-[2px] font-semibold text-center align-middle">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1 whitespace-pre-wrap h-[120px] align-top">
                  {notes ?? ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="border-t border-black flex">
          <div className="w-1/2 border-r border-black flex flex-col">
            <div className="text-center font-bold p-[2px] border-b border-black">
              PT Corintek Inti Sejahtera
            </div>
            <div className="text-center font-bold p-[2px] border-b border-black">
              PIC ( Corintek )
            </div>
            <div className="h-28 flex flex-col items-center justify-between py-2">
              <div className="flex-1 flex items-center justify-center">
                {technicianSignatureUrl && (
                  <img
                    src={technicianSignatureUrl}
                    alt="Tanda tangan teknisi"
                    className="max-h-16 max-w-[120px] object-contain"
                  />
                )}
              </div>
              <div className="text-center text-[10px] font-semibold leading-tight pb-1">
                <div>{corintekPicName ?? '-'}</div>
                {approvedAtText ? <div>{approvedAtText}</div> : null}
              </div>
            </div>
          </div>
          <div className="w-1/2 flex flex-col">
            <div className="text-center font-bold p-[2px] border-b border-black">
              {customerName}
            </div>
            <div className="text-center font-bold p-[2px] border-b border-black">
              Check By ( Client )
            </div>
            <div className="h-28 flex flex-col items-center justify-between py-2">
              <div className="flex-1 flex items-center justify-center">
                {clientPicSignatureUrl && (
                  <img
                    src={clientPicSignatureUrl}
                    alt="Tanda tangan klien"
                    className="max-h-16 max-w-[120px] object-contain"
                  />
                )}
              </div>
              <div className="text-center text-[10px] font-semibold leading-tight pb-1">
                <div>{clientPicName ?? '-'}</div>
                {submittedAtText ? <div>{submittedAtText}</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasDocumentation && (
        <div className="break-before-page flex flex-col min-h-[297mm] border border-black p-1 mt-8 print:mt-0 print:border-t print:min-h-0">
          <LogSheetHeader
            customerName={customerName}
            date={date}
            byName={byName}
            replacedByName={replacedByName}
          />
          <div className="flex-1 border border-black border-t-0 p-4">
            <h2 className="text-lg font-bold mb-8 text-center underline">
              DOCUMENTATION
            </h2>
            <div className="grid grid-cols-2 gap-8">
              {beforePhotos.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-center underline">SEBELUM</div>
                  <div className="grid grid-cols-2 gap-4">
                    {beforePhotos.map(p => (
                      <div
                        key={p.id}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="aspect-square w-full relative border border-black">
                          <img
                            src={p.url}
                            alt="Sebelum"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-center text-xs">
                          {p.caption ?? ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {afterPhotos.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-center underline">SESUDAH</div>
                  <div className="grid grid-cols-2 gap-4">
                    {afterPhotos.map(p => (
                      <div
                        key={p.id}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="aspect-square w-full relative border border-black">
                          <img
                            src={p.url}
                            alt="Sesudah"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-center text-xs">
                          {p.caption ?? ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {photoEntries.length > 0 && (
                <div className="space-y-2 col-span-2">
                  <div className="font-bold text-center underline">
                    WATER METER
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    {photoEntries.map(entry => (
                      <div
                        key={entry.param.id}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="font-bold border border-black px-4 py-1 bg-blue-200 w-full text-center">
                          {entry.param.name}
                        </div>
                        <div className="aspect-square w-full relative border border-black">
                          <img
                            src={entry.url}
                            alt={entry.param.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { size: A4 portrait; margin: 5mm; }
            html, body { background: #fff; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            .break-words { word-break: break-word; }
            .break-before-page { break-before: page; }
            /* Force background colors in print */
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `,
        }}
      />
    </div>
  );
}
