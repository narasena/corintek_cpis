'use client';

type TLogSheetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED';

type TMachine = {
  id: string;
  unitNumber: number;
  type: 'CHILLER' | 'COOLING_TOWER';
};

type TParameter = {
  id: string;
  name: string;
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
  displayOrder: number;
};

type TEntryState = {
  valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
  numericValue?: number | null;
  boolValue?: boolean | null;
  textValue?: string | null;
};

function makeEntryKey(parameterId: string, machineId: string | null) {
  return `${parameterId}:${machineId ?? 'null'}`;
}

function formatDate(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-US', {
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

  return '';
}

function formatValue(valueType: TParameter['valueType'], state?: TEntryState) {
  if (!state) return '';

  if (valueType === 'BOOLEAN') {
    if (state.boolValue === null || state.boolValue === undefined) return '';
    return state.boolValue ? 'Yes' : 'No';
  }

  if (valueType === 'NUMBER') {
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

function machinesForCategory(
  category: TParameter['category'],
  machines: { chillers: TMachine[]; coolingTowers: TMachine[] }
) {
  if (category === 'UNIT_CONDENSOR' || category === 'UNIT_EVAPORATOR') {
    return machines.chillers;
  }
  if (category === 'GENERAL_CONDITION' || category === 'JOB_DESCRIPTION') {
    return machines.coolingTowers;
  }
  return [];
}

export function LogSheetPreview({
  customerName,
  date,
  byName,
  status,
  notes,
  machines,
  parameters,
  valuesByKey,
}: {
  customerName: string;
  date: string | Date;
  byName: string;
  status: TLogSheetStatus;
  notes: string | null;
  machines: { chillers: TMachine[]; coolingTowers: TMachine[] };
  parameters: TParameter[];
  valuesByKey: Record<string, TEntryState | undefined>;
}) {
  const categories = Array.from(
    new Set(parameters.map(p => p.category))
  ).sort();
  const unitColumnCount = Math.max(
    machines.chillers.length,
    machines.coolingTowers.length,
    1
  );

  const paramsByCategory = new Map<TParameter['category'], TParameter[]>();
  for (const p of parameters) {
    if (!paramsByCategory.has(p.category)) paramsByCategory.set(p.category, []);
    paramsByCategory.get(p.category)!.push(p);
  }
  for (const [key, list] of paramsByCategory.entries()) {
    paramsByCategory.set(
      key,
      [...list].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    );
  }

  return (
    <div className="bg-white text-black print:text-black print:bg-white">
      <div className="print:hidden mb-3 text-sm text-muted-foreground">
        Mode cetak: gunakan tombol Print pada halaman ini.
      </div>

      <div className="border border-black">
        <div className="grid grid-cols-3">
          <div className="border-r border-black p-2 text-xs font-semibold">
            Customer : <span className="font-bold">{customerName}</span>
          </div>
          <div className="border-r border-black p-2 text-center text-xs font-semibold">
            Date <span className="font-bold">{formatDate(date)}</span>
          </div>
          <div className="p-2 text-right text-xs font-semibold">
            By <span className="font-bold">{byName}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full border-collapse text-[11px] leading-tight print:text-[10pt]">
          <tbody>
            {categories.flatMap(category => {
              const params =
                paramsByCategory.get(category as TParameter['category']) ?? [];
              if (params.length === 0) return [];

              const sectionMachines = machinesForCategory(
                category as TParameter['category'],
                machines
              );
              const hasMachines = sectionMachines.length > 0;

              const headerCells = Array.from(
                { length: unitColumnCount },
                (_, idx) => {
                  const m = hasMachines ? sectionMachines[idx] : undefined;
                  const label = m
                    ? m.type === 'CHILLER'
                      ? `Chiller #${m.unitNumber}`
                      : `CT #${m.unitNumber}`
                    : '';
                  return (
                    <th
                      key={`${category}-h-${idx}`}
                      className="border border-black p-1 text-center font-bold"
                    >
                      {label}
                    </th>
                  );
                }
              );

              const headerRow = (
                <tr
                  key={`${category}-header`}
                  className="bg-slate-200 print:bg-slate-200"
                >
                  <th className="border border-black p-1 text-left font-bold">
                    {sectionTitle[category as TParameter['category']]}
                  </th>
                  <th className="border border-black p-1 text-center font-bold">
                    Parameter
                  </th>
                  {hasMachines ? (
                    headerCells
                  ) : (
                    <>
                      <th className="border border-black p-1 text-center font-bold">
                        Value
                      </th>
                      {Array.from({ length: unitColumnCount - 1 }).map(
                        (_, i) => (
                          <th
                            key={`${category}-blank-${i}`}
                            className="border border-black p-1 text-center font-bold"
                          />
                        )
                      )}
                    </>
                  )}
                </tr>
              );

              const rows = params.map(param => {
                const limit = formatLimit(param);
                const targets = hasMachines
                  ? sectionMachines
                  : ([
                      { id: 'null', unitNumber: 0, type: 'CHILLER' as const },
                    ] as TMachine[]);

                const valueCells = Array.from(
                  { length: unitColumnCount },
                  (_, idx) => {
                    const m = targets[idx];
                    const machineId = hasMachines ? (m?.id ?? null) : null;
                    const key = makeEntryKey(param.id, machineId);
                    const value = formatValue(
                      param.valueType,
                      valuesByKey[key]
                    );
                    return (
                      <td
                        key={`${param.id}-v-${idx}`}
                        className="border border-black p-1 text-center"
                      >
                        {value || ''}
                      </td>
                    );
                  }
                );

                return (
                  <tr key={param.id}>
                    <td className="border border-black p-1 font-semibold">
                      {param.name}
                      {param.unit ? ` (${param.unit})` : ''}
                    </td>
                    <td className="border border-black p-1 text-center">
                      {limit || ''}
                    </td>
                    {valueCells}
                  </tr>
                );
              });

              return [headerRow, ...rows];
            })}

            <tr>
              <td className="border border-black p-2 font-semibold">Note</td>
              <td
                className="border border-black p-2"
                colSpan={unitColumnCount + 1}
              >
                {notes ?? ''}
              </td>
            </tr>

            <tr>
              <td className="border border-black p-2 font-semibold">Status</td>
              <td
                className="border border-black p-2"
                colSpan={unitColumnCount + 1}
              >
                {status}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { size: A4 landscape; margin: 10mm; }
            html, body { background: #fff; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        `,
        }}
      />
    </div>
  );
}
