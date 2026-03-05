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
  const activeClass = isActive
    ? 'text-center'
    : 'text-center bg-muted/30 text-muted-foreground';

  return (
    <TableHead key={m.id} className={activeClass}>
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

  const displayMachines = allMachines.length > 0 ? allMachines : machines;
  const hasMachines = displayMachines.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{category}</h2>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[180px]">Parameter</TableHead>
              {showLimitColumn && (
                <TableHead className="w-[100px]">Limit</TableHead>
              )}
              {hasMachines ? (
                displayMachines.map(m =>
                  getMachineColumnHeader(m, activeMachineIds.has(m.id))
                )
              ) : (
                <TableHead className="w-full text-center">Nilai</TableHead>
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
