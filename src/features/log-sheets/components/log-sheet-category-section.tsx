'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MobileEntryCard } from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/components/mobile-entry-card';
import { makeEntryKey } from '@/features/log-sheets/utils';
import {
  formatLimit,
  formatRawWaterLimit,
} from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/utils';
import type {
  TMachine,
  TParameter,
  TEntryState,
} from '@/features/log-sheets/types';
import { createNumberEntryUpdater } from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/entry-state-helpers';
import {
  BooleanCell,
  NumberCell,
  TextCell,
  RawWaterCell,
  RawWaterInputMobile,
  NoteCell,
} from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/components/entry-cells';

type TMachinesForCategoryResult = {
  machines: TMachine[];
  label: string;
};

interface ILogSheetCategorySectionProps {
  categories: string[];
  parametersByCategory: Map<string, TParameter[]>;
  entryState: Record<string, TEntryState>;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
  machinesForCategory: (
    category: TParameter['category']
  ) => TMachinesForCategoryResult;
  activeCTIds: string[];
  coolingTowers: TMachine[];
  isMobileView: boolean;
}

export function LogSheetCategorySection({
  categories,
  parametersByCategory,
  entryState,
  setEntryState,
  machinesForCategory,
  activeCTIds,
  coolingTowers,
  isMobileView,
}: ILogSheetCategorySectionProps) {
  return (
    <>
      {categories.map(category => {
        const params = parametersByCategory.get(category) ?? [];
        const cat = category as TParameter['category'];
        const { machines, label } = machinesForCategory(cat);
        if (params.length === 0) return null;

        const isUnitCategory = [
          'UNIT_CONDENSOR',
          'UNIT_EVAPORATOR',
          'GENERAL_CONDITION',
          'JOB_DESCRIPTION',
        ].includes(cat);

        if (isUnitCategory && machines.length === 0) {
          return (
            <div key={category} className="space-y-3">
              <h2 className="text-lg font-semibold">{category}</h2>
              <div className="rounded-md border p-8 text-center bg-muted/20">
                <p className="text-sm text-muted-foreground italic">
                  Pilih unit {label} aktif di atas untuk menampilkan kolom
                  input.
                </p>
              </div>
            </div>
          );
        }

        if (cat === 'COOLING_WATER_QUALITY') {
          const activeCTs = coolingTowers.filter(m =>
            activeCTIds.includes(m.id)
          );

          if (isMobileView) {
            return (
              <CoolingWaterQualityMobile
                key={category}
                category={category}
                params={params}
                activeCTs={activeCTs}
                entryState={entryState}
                setEntryState={setEntryState}
              />
            );
          }

          return (
            <CoolingWaterQualityDesktop
              key={category}
              category={category}
              params={params}
              activeCTs={activeCTs}
              entryState={entryState}
              setEntryState={setEntryState}
            />
          );
        }

        const hasNotes =
          cat === 'GENERAL_CONDITION' || cat === 'JOB_DESCRIPTION';

        if (isMobileView) {
          return (
            <GeneralCategoryMobile
              key={category}
              category={category}
              params={params}
              machines={machines}
              entryState={entryState}
              setEntryState={setEntryState}
              hasNotes={hasNotes}
              cat={cat}
            />
          );
        }

        return (
          <GeneralCategoryDesktop
            key={category}
            category={category}
            params={params}
            machines={machines}
            entryState={entryState}
            setEntryState={setEntryState}
            hasNotes={hasNotes}
            cat={cat}
          />
        );
      })}
    </>
  );
}

interface ICoolingWaterQualityDesktopProps {
  category: string;
  params: TParameter[];
  activeCTs: TMachine[];
  entryState: Record<string, TEntryState>;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
}

function CoolingWaterQualityDesktop({
  category,
  params,
  activeCTs,
  entryState,
  setEntryState,
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
                  const state = entryState[key];

                  if (param.valueType === 'BOOLEAN') {
                    return (
                      <BooleanCell
                        key={key}
                        state={state}
                        entryKey={key}
                        setEntryState={setEntryState}
                        showClearButton
                      />
                    );
                  }

                  if (param.valueType === 'NUMBER') {
                    return (
                      <NumberCell
                        key={key}
                        state={state}
                        entryKey={key}
                        setEntryState={setEntryState}
                        minValue={param.minValue}
                        maxValue={param.maxValue}
                      />
                    );
                  }

                  return (
                    <TextCell
                      key={key}
                      state={state}
                      entryKey={key}
                      setEntryState={setEntryState}
                    />
                  );
                })}

                <RawWaterCell
                  param={param}
                  entryState={entryState}
                  setEntryState={setEntryState}
                />

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

interface ICoolingWaterQualityMobileProps {
  category: string;
  params: TParameter[];
  activeCTs: TMachine[];
  entryState: Record<string, TEntryState>;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
}

function CoolingWaterQualityMobile({
  category,
  params,
  activeCTs,
  entryState,
  setEntryState,
}: ICoolingWaterQualityMobileProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{category}</h2>
      <div className="grid gap-4">
        {params.map(param => (
          <div
            key={param.id}
            className="rounded-lg border bg-card p-4 space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between border-b pb-2">
              <div>
                <h3 className="font-semibold text-sm">
                  {param.name}
                  {param.unit ? ` (${param.unit})` : ''}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Target: {formatLimit(param)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {activeCTs.map(m => {
                const key = makeEntryKey(param.id, m.id, 'VALUE');
                const state = entryState[key];
                return (
                  <div key={key} className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      CT #{m.unitNumber}
                    </div>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="Nilai..."
                      value={
                        state?.numericValue === null ||
                        state?.numericValue === undefined
                          ? ''
                          : String(state.numericValue)
                      }
                      onChange={e => {
                        setEntryState(
                          createNumberEntryUpdater(key, e.target.value)
                        );
                      }}
                    />
                  </div>
                );
              })}

              <RawWaterInputMobile
                param={param}
                entryState={entryState}
                setEntryState={setEntryState}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface IParameterTableRowProps {
  param: TParameter;
  machines: TMachine[];
  entryState: Record<string, TEntryState>;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
  hasNotes: boolean;
  cat: TParameter['category'];
}

function ParameterTableRow({
  param,
  machines,
  entryState,
  setEntryState,
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
        const state = entryState[key];

        if (param.valueType === 'BOOLEAN') {
          return (
            <BooleanCell
              key={key}
              state={state}
              entryKey={key}
              setEntryState={setEntryState}
            />
          );
        }

        if (param.valueType === 'NUMBER') {
          const isWaterMeter =
            cat === 'CONSUMPTION' &&
            ['before', 'after'].some(k => param.name.toLowerCase().includes(k));
          return (
            <NumberCell
              key={key}
              state={state}
              entryKey={key}
              setEntryState={setEntryState}
              minValue={param.minValue}
              maxValue={param.maxValue}
              isWaterMeter={isWaterMeter}
            />
          );
        }

        return (
          <TextCell
            key={key}
            state={state}
            entryKey={key}
            setEntryState={setEntryState}
          />
        );
      })}
      {hasNotes && (
        <TableCell>
          <NoteCell
            paramId={param.id}
            entryState={entryState}
            setEntryState={setEntryState}
          />
        </TableCell>
      )}
    </TableRow>
  );
}

interface IGeneralCategoryDesktopProps {
  category: string;
  params: TParameter[];
  machines: TMachine[];
  entryState: Record<string, TEntryState>;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
  hasNotes: boolean;
  cat: TParameter['category'];
}

function GeneralCategoryDesktop({
  category,
  params,
  machines,
  entryState,
  setEntryState,
  hasNotes,
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
              {hasNotes && (
                <TableHead className="min-w-[260px] text-center">
                  Catatan
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
                entryState={entryState}
                setEntryState={setEntryState}
                hasNotes={hasNotes}
                cat={cat}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface IGeneralCategoryMobileProps {
  category: string;
  params: TParameter[];
  machines: TMachine[];
  entryState: Record<string, TEntryState>;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
  hasNotes: boolean;
  cat: TParameter['category'];
}

function GeneralCategoryMobile({
  category,
  params,
  machines,
  entryState,
  setEntryState,
  hasNotes,
  cat,
}: IGeneralCategoryMobileProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{category}</h2>
      <div className="grid gap-4">
        {params.map(param => (
          <MobileEntryCard
            key={param.id}
            param={param}
            machines={machines}
            entryState={entryState}
            setEntryState={setEntryState}
            hasNotes={hasNotes}
            isWaterMeter={paramName =>
              cat === 'CONSUMPTION' &&
              ['before', 'after'].some(k => paramName.toLowerCase().includes(k))
            }
          />
        ))}
      </div>
    </div>
  );
}
