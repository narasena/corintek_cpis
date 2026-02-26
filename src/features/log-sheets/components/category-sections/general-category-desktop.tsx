'use client';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { TMachine, TParameter } from '@/features/log-sheets/types';
import { ParameterTableRow } from './parameter-table-row';

interface IGeneralCategoryDesktopProps {
  category: string;
  params: TParameter[];
  machines: TMachine[];
  cat: TParameter['category'];
}

export function GeneralCategoryDesktop({
  category,
  params,
  machines,
  cat,
}: IGeneralCategoryDesktopProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{category}</h2>
      </div>

      <div className="rounded-md border">
        <Table className="w-max!">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-max-plus!">Parameter</TableHead>
              <TableHead className="">Target</TableHead>
              {machines.length > 0 ? (
                machines.map(m => (
                  <TableHead key={m.id} className="min-w-[140px] text-center">
                    {m.type === 'CHILLER'
                      ? `#${m.unitNumber}`
                      : `CT #${m.unitNumber}`}
                  </TableHead>
                ))
              ) : (
                <TableHead className="min-w-[200px] text-center">
                  Nilai
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {params.map(param => (
              <ParameterTableRow
                key={param.id}
                param={param}
                machines={machines}
                cat={cat}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
