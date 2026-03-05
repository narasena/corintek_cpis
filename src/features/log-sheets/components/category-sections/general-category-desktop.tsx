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
  allMachines: TMachine[];
  cat: TParameter['category'];
}

function shouldShowLimitColumn(cat: TParameter['category']): boolean {
  return !CATEGORIES_WITHOUT_LIMIT_COLUMN.includes(cat);
}

function getMachineColumnHeader(
  m: TMachine,
  isActive: boolean
): React.ReactNode {
  const baseClass = 'min-w-[100px] text-center';
  const className = isActive
    ? baseClass
    : `${baseClass} bg-muted/30 text-muted-foreground`;

  return (
    <TableHead key={m.id} className={className}>
      {m.type === 'CHILLER' ? `#${m.unitNumber}` : `CT #${m.unitNumber}`}
      {!isActive && <div className="text-[10px]">Tidak Aktif</div>}
    </TableHead>
  );
}

export function GeneralCategoryDesktop({
  category,
  params,
  machines,
  allMachines,
  cat,
}: IGeneralCategoryDesktopProps) {
  const showLimitColumn = shouldShowLimitColumn(cat);
  const activeMachineIds = new Set(machines.map(m => m.id));

  // Use allMachines if provided, otherwise fall back to machines
  const displayMachines = allMachines.length > 0 ? allMachines : machines;

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
              {displayMachines.length > 0 ? (
                displayMachines.map(m =>
                  getMachineColumnHeader(m, activeMachineIds.has(m.id))
                )
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
                allMachines={allMachines}
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
