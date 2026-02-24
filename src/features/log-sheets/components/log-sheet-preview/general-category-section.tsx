import React from 'react';
import { makeEntryKey } from '../../utils';
import { formatLimit, formatValue } from './format-helpers';
import { sectionTitle } from './category-helpers';
import type { TParameter, TMachine, TEntryState } from '../../types';

export function GeneralCategorySection({
  category,
  params,
  sectionMachines,
  valuesByKey,
  isFirst,
}: {
  category: TParameter['category'];
  params: TParameter[];
  sectionMachines: TMachine[];
  valuesByKey: Record<string, TEntryState | undefined>;
  isFirst: boolean;
}) {
  const hasNotes =
    category === 'GENERAL_CONDITION' || category === 'JOB_DESCRIPTION';
  const showLimit = category !== 'CONSUMPTION';

  return (
    <div
      className={`overflow-x-auto ${!isFirst ? 'border-t border-black' : ''}`}
    >
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          <col className="w-[140px]" />
          {showLimit && <col className="w-[80px]" />}
        </colgroup>
        <thead>
          <tr className="bg-blue-200 print:bg-blue-200">
            <th className="border-b border-r border-black p-[2px] text-left font-bold">
              {sectionTitle[category]}
            </th>
            {showLimit && (
              <th className="border-b border-r border-black p-[2px] text-center font-bold">
                {['GENERAL_CONDITION', 'JOB_DESCRIPTION'].includes(category)
                  ? ''
                  : 'Limit'}
              </th>
            )}
            {sectionMachines.length > 0 ? (
              <>
                {sectionMachines.map((m, idx) => (
                  <th
                    key={`m-${m.id}`}
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
            const valueCells: React.ReactNode[] = [];
            const isLastRow = pIdx === params.length - 1;
            const cellBorder = isLastRow ? '' : 'border-b';

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
}
