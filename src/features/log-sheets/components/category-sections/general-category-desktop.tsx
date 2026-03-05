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

const CATEGORIES_WITHOUT_LIMIT_COLUMN: TParameter['category'][] = [
  'GENERAL_CONDITION',
  'JOB_DESCRIPTION',
  'CONSUMPTION',
];

interface IGeneralCategoryDesktopProps {
  category: string;
  params: TParameter[];
  machines: TMachine[];
  cat: TParameter['category'];
}

function shouldShowLimitColumn(cat: TParameter['category']): boolean {
  return !CATEGORIES_WITHOUT_LIMIT_COLUMN.includes(cat);
}

export function GeneralCategoryDesktop({
  category,
  params,
  machines,
  cat,
}: IGeneralCategoryDesktopProps) {
  const showLimitColumn = shouldShowLimitColumn(cat);

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
              {showLimitColumn && <TableHead className="">Limit</TableHead>}
              {machines.length > 0 ? (
                machines.map(m => (
                  <TableHead key={m.id} className="min-w-[100px] text-center">
                    {m.type === 'CHILLER'
                      ? `#${m.unitNumber}`
                      : `CT #${m.unitNumber}`}
                  </TableHead>
                ))
              ) : (
                <TableHead className="min-w-[140px] text-center">
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
                showLimitColumn={showLimitColumn}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
