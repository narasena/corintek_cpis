import React, { ReactNode } from 'react';
import { makeEntryKey } from '../../utils';
import { formatValue } from './format-helpers';
import type { TPreviewParameter, TEntryState } from '../../types';

export function ConsumptionSection({
  params,
  valuesByKey,
  chemicalUsages,
}: {
  params: TPreviewParameter[];
  valuesByKey: Record<string, TEntryState | undefined>;
  chemicalUsages?: Array<{
    chemicalName?: string;
    amount: number;
    unit?: string;
  }>;
}) {
  const waterKeywords = ['before', 'after', 'total', 'consumption'];
  const waterParams = params.filter(p =>
    waterKeywords.some(k => p.name.toLowerCase().includes(k))
  );

  return (
    <div className="flex border-t border-black">
      <div className="w-max border-r border-black">
        <table className="w-max table-fixed border-collapse">
          <colgroup>
            <col className="w-max" />
            <col className="min-w-20" />
          </colgroup>
          <thead>
            <tr className="bg-blue-200 print:bg-blue-200">
              <th className="border-b border-black p-[2px] text-left font-bold">
                Consumption Water Meter
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
