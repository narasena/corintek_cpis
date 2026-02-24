import React from 'react';
import { makeEntryKey } from '../../utils';
import {
  formatLimit,
  formatRawWaterLimit,
  formatValue,
} from './format-helpers';
import { sectionTitle, machinesForCategory } from './category-helpers';
import type { TParameter, TMachine, TEntryState } from '../../types';

export function CoolingWaterSection({
  category,
  params,
  sectionMachines,
  valuesByKey,
}: {
  category: TParameter['category'];
  params: TParameter[];
  sectionMachines: TMachine[];
  valuesByKey: Record<string, TEntryState | undefined>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          <col className="w-[140px]" />
          <col className="w-[80px]" />
        </colgroup>
        <thead>
          <tr className="bg-blue-200 print:bg-blue-200">
            <th className="border-b border-r border-black p-[2px] text-left font-bold">
              {sectionTitle[category]}
            </th>
            <th className="border-b border-r border-black p-[2px] text-center font-bold">
              Limit
            </th>
            {sectionMachines.map(m => (
              <th
                key={`m-${m.id}`}
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
          </tr>
        </thead>
        <tbody>
          {params.map((param, pIdx) => {
            const limit = formatLimit(param);
            const isLastRow = pIdx === params.length - 1;
            const cellBorder = isLastRow ? '' : 'border-b';

            const valueCells: React.ReactNode[] = [];

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

            return (
              <tr key={param.id}>
                <td
                  className={`${cellBorder} border-r border-black p-[2px] font-semibold break-words`}
                >
                  {param.name}
                  {param.unit ? ` (${param.unit})` : ''}
                </td>
                <td
                  className={`${cellBorder} border-r border-black p-[2px] text-center`}
                >
                  {limit || ''}
                </td>
                {valueCells}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
