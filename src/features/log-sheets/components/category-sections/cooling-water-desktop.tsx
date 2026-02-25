'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { makeEntryKey } from '@/features/log-sheets/utils';
import {
  formatLimit,
  formatRawWaterLimit,
} from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/utils';
import type { TMachine, TParameter } from '@/features/log-sheets/types';
import {
  BooleanCell,
  NumberCell,
  TextCell,
  RawWaterCell,
} from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/components/entry-cells';

interface ICoolingWaterQualityDesktopProps {
  category: string;
  params: TParameter[];
  activeCTs: TMachine[];
}

export function CoolingWaterQualityDesktop({
  category,
  params,
  activeCTs,
}: ICoolingWaterQualityDesktopProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{category}</h2>
      </div>

      <div className="rounded-md border">
        <Table className="w-max min-w-full">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-max-plus">Parameter</TableHead>
              <TableHead className="w-max-plus">Target</TableHead>
              {activeCTs.map(m => (
                <TableHead key={m.id} className="min-w-[140px] text-center">
                  {`CT #${m.unitNumber}`}
                </TableHead>
              ))}
              <TableHead className="w-max-plus text-center">
                Raw Water
              </TableHead>
              <TableHead className="w-max-plus text-center">
                Target (Raw Water)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {params.map(param => (
              <TableRow key={param.id}>
                <TableCell>
                  <div className="font-medium">
                    {param.name}
                    {param.unit ? ` (${param.unit})` : ''}
                  </div>
                </TableCell>
                <TableCell>{formatLimit(param)}</TableCell>
                {activeCTs.map(m => {
                  const key = makeEntryKey(param.id, m.id, 'VALUE');

                  if (param.valueType === 'BOOLEAN') {
                    return (
                      <BooleanCell key={key} entryKey={key} showClearButton />
                    );
                  }

                  if (param.valueType === 'NUMBER') {
                    return (
                      <NumberCell
                        key={key}
                        entryKey={key}
                        minValue={param.minValue}
                        maxValue={param.maxValue}
                      />
                    );
                  }

                  return <TextCell key={key} entryKey={key} />;
                })}

                <RawWaterCell param={param} />

                <TableCell className="text-center">
                  {formatRawWaterLimit(param)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
