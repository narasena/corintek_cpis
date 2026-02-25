'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { makeEntryKey } from '@/features/log-sheets/utils';
import { formatLimit } from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/utils';
import type { TMachine, TParameter } from '@/features/log-sheets/types';
import { isWaterMeterParam } from '../category-config';
import {
  BooleanCell,
  NumberCell,
  TextCell,
  NoteCell,
} from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/components/entry-cells';

interface IParameterTableRowProps {
  param: TParameter;
  machines: TMachine[];
  hasNotes: boolean;
  cat: TParameter['category'];
}

export function ParameterTableRow({
  param,
  machines,
  hasNotes,
  cat,
}: IParameterTableRowProps) {
  const targets =
    machines.length > 0
      ? machines
      : ([
          {
            id: 'null',
            unitNumber: 0,
            type: 'CHILLER' as const,
          },
        ] as TMachine[]);

  return (
    <TableRow>
      <TableCell className="w-max-plus!">
        <div className="font-medium">
          {param.name}
          {param.unit ? ` (${param.unit})` : ''}
        </div>
      </TableCell>
      <TableCell>{formatLimit(param)}</TableCell>
      {targets.map(m => {
        const machineIdValue = machines.length > 0 ? m.id : null;
        const key = makeEntryKey(param.id, machineIdValue, 'VALUE');

        if (param.valueType === 'BOOLEAN') {
          return <BooleanCell key={key} entryKey={key} />;
        }

        if (param.valueType === 'NUMBER') {
          return (
            <NumberCell
              key={key}
              entryKey={key}
              minValue={param.minValue}
              maxValue={param.maxValue}
              isWaterMeter={isWaterMeterParam(param.name, cat)}
            />
          );
        }

        return <TextCell key={key} entryKey={key} />;
      })}
      {hasNotes && (
        <TableCell>
          <NoteCell paramId={param.id} />
        </TableCell>
      )}
    </TableRow>
  );
}
