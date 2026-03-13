import type { TWaterQualityRow, TParameterLimitInfo } from '../analytics-types';

interface WaterQualityTableProps {
  data: TWaterQualityRow[];
  limits: TParameterLimitInfo[];
  daysInMonth: number;
  projectName?: string;
  clientName?: string;
  periodLabel?: string;
}

export function WaterQualityTable({
  data,
  limits,
  daysInMonth,
  projectName,
  clientName,
  periodLabel,
}: WaterQualityTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-4">
        Tidak ada data water quality untuk periode ini.
      </div>
    );
  }

  const dayColumns = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getLimitForParameter = (
    variableName: string
  ): TParameterLimitInfo | undefined => {
    return limits.find(l => l.variableName === variableName);
  };

  return (
    <div className="water-quality-section print:overflow-visible">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-xs uppercase tracking-wider text-gray-500">
          Executive Summary Water Quality
        </div>
        {clientName && <div className="font-semibold">{clientName}</div>}
        {projectName && <div className="text-sm">{projectName}</div>}
        {periodLabel && (
          <div className="text-sm text-gray-600">{periodLabel}</div>
        )}
      </div>

      {/* Table */}
      <div className="analytics-table-wrapper overflow-x-visible print:overflow-visible">
        <table className="analytics-table w-full text-[8pt] border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left p-1 border-r border-gray-300 w-24">
                Parameter
              </th>
              <th className="text-left p-1 border-r border-gray-300 w-20">
                Jenis Air
              </th>
              <th className="text-center p-1 border-r border-gray-300 w-8">
                Unit
              </th>
              {dayColumns.map(day => (
                <th
                  key={day}
                  className="text-center p-0.5 w-6 border-r border-gray-200"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={`${row.variableName}-${row.source}`}
                className="border-b border-gray-200"
              >
                {index === 0 || data[index - 1].parameter !== row.parameter ? (
                  <td
                    className="p-1 border-r border-gray-300 font-medium"
                    rowSpan={getRowSpan(data, row.parameter)}
                  >
                    {row.parameter}
                  </td>
                ) : null}
                <td className="p-1 border-r border-gray-300">
                  {row.source === 'MAKE_WATER'
                    ? 'Make Water'
                    : 'Cooling Tower Water'}
                </td>
                <td className="p-1 text-center border-r border-gray-300">
                  {row.unit}
                </td>
                {row.dailyValues.map((value, dayIndex) => (
                  <td
                    key={dayIndex}
                    className="p-0.5 text-center border-r border-gray-100"
                  >
                    {value !== null ? value.toFixed(1) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Limits Footer */}
      <div className="mt-4 text-[8pt]">
        <div className="font-semibold mb-1">Parameter Limit:</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          {Array.from(new Set(data.map(d => d.variableName))).map(
            variableName => {
              const limit = getLimitForParameter(variableName);
              const row = data.find(d => d.variableName === variableName);
              if (!limit || !row) return null;
              return (
                <div key={variableName} className="flex justify-between">
                  <span>{row.parameter}:</span>
                  <span>
                    {limit.min !== null ? limit.min : '-'} ~{' '}
                    {limit.max !== null ? limit.max : '-'} {limit.unit}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Company Footer */}
      <div className="mt-6 text-[8pt] text-center">
        <div className="font-semibold">PT. CORINTEK INTI SEJAHTERA</div>
        <div>Water Treatment and Chemicals Specialist</div>
      </div>
    </div>
  );
}

function getRowSpan(data: TWaterQualityRow[], parameter: string): number {
  return data.filter(r => r.parameter === parameter).length;
}
