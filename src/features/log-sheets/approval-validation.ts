import type { ILogSheetDetailView, ILogSheetEntry, TParameter } from './types';
import { makeEntryKey, isEntryComplete } from './utils';
import { validateNumericRange } from './range-validation';
import {
  usesChillers,
  usesCoolingTowers,
} from './components/log-sheet-preview/category-helpers';

type TApprovalContext = {
  detail: ILogSheetDetailView;
  parameterById: Map<string, ILogSheetDetailView['parameters'][number]>;
  entryByKey: Map<string, ILogSheetEntry>;
  machineLabelById: Map<string, string>;
};

function buildApprovalContext(detail: ILogSheetDetailView): TApprovalContext {
  const parameterById = new Map(detail.parameters.map(p => [p.id, p]));
  const entryByKey = new Map(
    detail.entries.map(entry => [
      makeEntryKey(
        entry.parameterId,
        entry.machineId,
        entry.role as ILogSheetEntry['role']
      ),
      entry,
    ])
  );
  const machineLabelById = new Map<string, string>();

  for (const machine of detail.machines.chillers) {
    machineLabelById.set(machine.id, `Chiller #${machine.unitNumber}`);
  }
  for (const machine of detail.machines.coolingTowers) {
    machineLabelById.set(machine.id, `CT #${machine.unitNumber}`);
  }

  return { detail, parameterById, entryByKey, machineLabelById };
}

function collectApprovalRangeErrors(
  context: TApprovalContext,
  errors: string[]
) {
  for (const entry of context.detail.entries) {
    if (entry.valueType !== 'NUMBER') continue;
    const param = context.parameterById.get(entry.parameterId);
    if (!param) continue;

    errors.push(...validateNumericRange(entry, param));
  }
}

function collectCoolingWaterRequiredErrors(
  context: TApprovalContext,
  parameterId: string,
  errors: string[]
) {
  const param = context.parameterById.get(parameterId);
  if (!param) return;

  // Skip Cycle - it's optional
  if (param.variableName === 'Cycle' || param.name === 'Cycle') {
    return;
  }

  const activeCTs = context.detail.machines.coolingTowers.filter(m =>
    context.detail.activeMachineIds.coolingTowers.includes(m.id)
  );

  for (const machine of activeCTs) {
    const key = makeEntryKey(param.id, machine.id, 'VALUE');
    const entry = context.entryByKey.get(key);
    if (!isEntryComplete(entry)) {
      const label = context.machineLabelById.get(machine.id) ?? 'Mesin';
      errors.push(`${param.name} (${label}) wajib diisi`);
    }
  }

  const rawKey = makeEntryKey(param.id, null, 'RAW_WATER');
  const rawEntry = context.entryByKey.get(rawKey);
  if (!isEntryComplete(rawEntry)) {
    errors.push(`${param.name} (Raw Water) wajib diisi`);
  }
}

function collectCategoryRequiredErrors(
  context: TApprovalContext,
  param: (typeof context.detail.parameters)[number],
  errors: string[]
) {
  const category = param.category as TParameter['category'];
  const isChillerCategory = usesChillers(category);
  const isCTCategory = usesCoolingTowers(category);

  const activeChillers = context.detail.machines.chillers.filter(m =>
    context.detail.activeMachineIds.chillers.includes(m.id)
  );
  const activeCTs = context.detail.machines.coolingTowers.filter(m =>
    context.detail.activeMachineIds.coolingTowers.includes(m.id)
  );

  const machines = isChillerCategory
    ? activeChillers
    : isCTCategory
      ? activeCTs
      : [];
  const targets =
    machines.length > 0
      ? machines.map(machine => ({ id: machine.id }))
      : category === 'CONSUMPTION'
        ? [{ id: null as string | null }]
        : [];

  for (const target of targets) {
    const key = makeEntryKey(param.id, target.id, 'VALUE');
    const entry = context.entryByKey.get(key);
    if (!isEntryComplete(entry)) {
      const label =
        target.id === null
          ? 'Nilai'
          : (context.machineLabelById.get(target.id) ?? 'Mesin');
      errors.push(`${param.name} (${label}) wajib diisi`);
    }
  }

  if (
    isCTCategory &&
    activeCTs.length > 0 &&
    param.category !== 'JOB_DESCRIPTION' &&
    param.category !== 'GENERAL_CONDITION'
  ) {
    const noteKey = makeEntryKey(param.id, null, 'NOTE');
    const noteEntry = context.entryByKey.get(noteKey);
    if (!isEntryComplete(noteEntry)) {
      errors.push(`${param.name} (Catatan) wajib diisi`);
    }
  }
}

function collectApprovalRequiredFieldErrors(
  context: TApprovalContext,
  errors: string[]
) {
  for (const param of context.detail.parameters) {
    if (param.category === 'COOLING_WATER_QUALITY') {
      collectCoolingWaterRequiredErrors(context, param.id, errors);
      continue;
    }

    collectCategoryRequiredErrors(context, param, errors);
  }
}

export function validateLogSheetApprovalDetail(
  detail: ILogSheetDetailView
): void {
  const context = buildApprovalContext(detail);
  const errors: string[] = [];

  collectApprovalRangeErrors(context, errors);
  collectApprovalRequiredFieldErrors(context, errors);

  if (errors.length > 0) {
    throw new Error(`Validasi gagal:\n${errors.join('\n')}`);
  }
}
