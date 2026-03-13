import type {
  TCondenserUnitRow,
  TParameterLimitInfo,
} from '../analytics-types';

interface CondenserApproachTableProps {
  data: TCondenserUnitRow[];
  limits: TParameterLimitInfo[];
  daysInMonth: number;
  projectName?: string;
  clientName?: string;
  periodLabel?: string;
}

export function CondenserApproachTable({
  data,
  limits,
  daysInMonth,
  projectName,
  clientName,
  periodLabel,
}: CondenserApproachTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-4">
        Tidak ada data condenser approach untuk periode ini.
      </div>
    );
  }

  const dayColumns = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const approachLimit = limits.find(l => l.variableName === 'approach_cond');

  return (
    <div className="condenser-approach-section mt-8 print:overflow-visible">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-xs uppercase tracking-wider text-gray-500">
          Executive Summary Condensor Approach
        </div>
        {clientName && <div className="font-semibold">{clientName}</div>}
        {projectName && <div className="text-sm">{projectName}</div>}
        {periodLabel && (
          <div className="text-sm text-gray-600">{periodLabel}</div>
        )}
      </div>

      {/* Unit Tables */}
      {data.map(unit => (
        <div key={unit.machineId} className="mb-6">
          {/* Unit Header */}
          <div className="text-sm font-semibold mb-2">
            {unit.unitName} ({unit.capacity})
          </div>

          <div className="analytics-table-wrapper overflow-x-visible print:overflow-visible">
            <table className="analytics-table w-full text-[8pt] border-collapse mb-2">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left p-1 border-r border-gray-300 w-32">
                    Parameter
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
                <tr className="border-b border-gray-200">
                  <td className="p-1 border-r border-gray-300">
                    C. Approach (°C)
                  </td>
                  {unit.dailyApproach.map((value, dayIndex) => (
                    <td
                      key={dayIndex}
                      className="p-0.5 text-center border-r border-gray-100"
                    >
                      {value !== null ? value.toFixed(1) : ''}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-1 border-r border-gray-300">Load (%)</td>
                  {unit.dailyLoad.map((value, dayIndex) => (
                    <td
                      key={dayIndex}
                      className="p-0.5 text-center border-r border-gray-100"
                    >
                      {value !== null ? value.toFixed(1) : ''}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Legend / Limits */}
      <div className="mt-4 text-[8pt]">
        <div className="font-semibold mb-1">Keterangan:</div>
        <div className="flex gap-4">
          <span>: Hari Libur</span>
          <span>: pekerjaan scaling brushing</span>
          <span>: pekerjaan desinfektan</span>
          <span>: pekerjaan brushing/rojok</span>
        </div>
        {approachLimit && (
          <div className="mt-2 font-medium">
            Approach Maksimum{' '}
            {approachLimit.max !== null ? approachLimit.max : '2.2'} °C
          </div>
        )}
      </div>

      {/* Company Footer */}
      <div className="mt-6 text-[8pt] text-center">
        <div className="font-semibold">PT. CORINTEK INTI SEJAHTERA</div>
        <div>Water Treatment and Chemicals Specialist</div>
      </div>
    </div>
  );
}
