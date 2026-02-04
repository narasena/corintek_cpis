'use client';

import { LogSheetHeader } from './log-sheet-header';

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

type TEntryState = {
  valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
  numericValue?: number | null;
  boolValue?: boolean | null;
  textValue?: string | null;
};

function makeEntryKey(
  parameterId: string,
  machineId: string | null,
  role: TEntryRole
) {
  return `${parameterId}:${machineId ?? 'null'}:${role}`;
}

function formatLimit(
  parameter: Pick<
    TParameter,
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

const sectionTitle: Record<TParameter['category'], string> = {
  UNIT_CONDENSOR: 'Unit Condensor',
  UNIT_EVAPORATOR: 'Unit Evaporator',
  COOLING_WATER_QUALITY: 'Check Water Quality',
  GENERAL_CONDITION: 'General Condition',
  JOB_DESCRIPTION: 'Job Description',
  CONSUMPTION: 'Consumption',
};

export const CATEGORY_ORDER: TParameter['category'][] = [
  'UNIT_CONDENSOR',
  'UNIT_EVAPORATOR',
  'COOLING_WATER_QUALITY',
  'GENERAL_CONDITION',
  'JOB_DESCRIPTION',
  'CONSUMPTION',
];

function machinesForCategory(
  category: TParameter['category'],
  machines: { chillers: TMachine[]; coolingTowers: TMachine[] }
) {
  if (category === 'UNIT_CONDENSOR' || category === 'UNIT_EVAPORATOR') {
    return machines.chillers;
  }
  if (
    category === 'COOLING_WATER_QUALITY' ||
    category === 'GENERAL_CONDITION' ||
    category === 'JOB_DESCRIPTION'
  ) {
    return machines.coolingTowers;
  }
  return [];
}

export function LogSheetPreview({
  customerName,
  date,
  byName,
  notes,
  machines,
  parameters,
  valuesByKey,
}: {
  customerName: string;
  date: string | Date;
  byName: string;
  notes: string | null;
  machines: { chillers: TMachine[]; coolingTowers: TMachine[] };
  parameters: TParameter[];
  valuesByKey: Record<string, TEntryState | undefined>;
}) {
  // Override category for Deposit parameter to ensure it appears in General Condition
  const displayParameters = parameters.map(p => {
    if (p.variableName.includes('deposit')) {
      return { ...p, category: 'GENERAL_CONDITION' as const };
    }
    return p;
  });

  const categories = Array.from(
    new Set(displayParameters.map(p => p.category))
  ).sort((a, b) => {
    return CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b);
  });

  const paramsByCategory = new Map<TParameter['category'], TParameter[]>();
  for (const p of displayParameters) {
    if (!paramsByCategory.has(p.category)) paramsByCategory.set(p.category, []);
    paramsByCategory.get(p.category)!.push(p);
  }
  for (const [key, list] of paramsByCategory.entries()) {
    if (key === 'GENERAL_CONDITION') {
      const order = ['running', 'algae', 'deposit'];
      const getOrder = (p: TParameter) => {
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
        />
      </div>

      <div className="flex flex-col border border-black border-t-0">
        {categories.map((category, index) => {
          const params =
            paramsByCategory.get(category as TParameter['category']) ?? [];
          if (params.length === 0) return null;

          const cat = category as TParameter['category'];
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
            const chemicalParams = params.filter(
              p => !waterKeywords.some(k => p.name.toLowerCase().includes(k))
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
                        <th className="border-b border-l border-black p-[2px] text-center font-bold">
                          C - 8196
                          </th>
                        <th className="border-b border-l border-black p-[2px] text-center font-bold">
                          C - 8707
                        </th>
                        <th className="border-b border-l border-black p-[2px] text-center font-bold">
                          C - 8606 P
                        </th>
                        <th className="border-b border-l border-black p-[2px] text-center font-bold">
                          C - 8011
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-b border-black p-[2px] text-center font-semibold">
                          Quantity
                        </td>
                        <td className="border-b border-l border-black p-[2px] text-center">
                          24.6 Lt
                            </td>
                        <td className="border-b border-l border-black p-[2px] text-center">
                          7.20 Lt
                        </td>
                        <td className="border-b border-l border-black p-[2px] text-center">
                          14 Lt
                        </td>
                        <td className="border-b border-l border-black p-[2px] text-center">
                          20 Lt
                        </td>
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
            <div className="h-28 flex items-center justify-center">
              {/* Placeholder for Signature */}
            </div>
          </div>
          <div className="w-1/2 flex flex-col">
            <div className="text-center font-bold p-[2px] border-b border-black">
              {customerName}
            </div>
            <div className="text-center font-bold p-[2px] border-b border-black">
              Check By ( Client )
            </div>
            <div className="h-28 flex items-center justify-center">
              {/* Placeholder for Signature */}
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { size: A4 portrait; margin: 5mm; }
            html, body { background: #fff; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            .break-words { word-break: break-word; }
            /* Force background colors in print */
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `,
        }}
      />
    </div>
  );
}
