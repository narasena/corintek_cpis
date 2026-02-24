'use client';

import React from 'react';
import { LogSheetHeader } from '../log-sheet-header';
import { makeEntryKey } from '../../utils';
import { CATEGORY_ORDER, machinesForCategory } from './category-helpers';
import { ConsumptionSection } from './consumption-section';
import { CoolingWaterSection } from './cooling-water-section';
import { GeneralCategorySection } from './general-category-section';
import { SignaturesSection } from './signatures-section';
import { DocumentationSection } from './documentation-section';
import type {
  TParameter,
  TMachine,
  TLogSheetPhoto,
  TEntryState,
} from '../../types';

export { CATEGORY_ORDER } from './category-helpers';

export function LogSheetPreview({
  customerName,
  date,
  byName,
  submittedAt,
  replacedByName,
  corintekPicName,
  approvedAt,
  clientPicName,
  technicianSignatureUrl,
  clientPicSignatureUrl,
  notes,
  machines,
  parameters,
  valuesByKey,
  photos,
  chemicalUsages,
}: {
  customerName: string;
  date: string | Date;
  byName: string;
  submittedAt?: string | Date | null;
  replacedByName?: string | null;
  corintekPicName?: string | null;
  approvedAt?: string | Date | null;
  clientPicName?: string | null;
  technicianSignatureUrl?: string | null;
  clientPicSignatureUrl?: string | null;
  notes: string | null;
  machines: { chillers: TMachine[]; coolingTowers: TMachine[] };
  parameters: TParameter[];
  valuesByKey: Record<string, TEntryState | undefined>;
  photos: TLogSheetPhoto[];
  chemicalUsages?: Array<{
    chemicalName?: string;
    amount: number;
    unit?: string;
  }>;
}) {
  const submittedAtText =
    submittedAt && new Date(submittedAt).toString() !== 'Invalid Date'
      ? new Date(submittedAt).toLocaleDateString('id-ID')
      : '';
  const approvedAtText =
    approvedAt && new Date(approvedAt).toString() !== 'Invalid Date'
      ? new Date(approvedAt).toLocaleDateString('id-ID')
      : '';

  const displayParameters = parameters.map(p => {
    if (p.variableName.includes('deposit')) {
      return { ...p, category: 'GENERAL_CONDITION' as const };
    }
    return p;
  });

  const categories = Array.from(
    new Set((displayParameters || []).map(p => p.category))
  ).sort((a, b) => {
    return (
      (CATEGORY_ORDER || []).indexOf(a) - (CATEGORY_ORDER || []).indexOf(b)
    );
  });

  const paramsByCategory = new Map<TParameter['category'], TParameter[]>();
  for (const p of displayParameters) {
    if (!paramsByCategory.has(p.category)) paramsByCategory.set(p.category, []);
    paramsByCategory.get(p.category)!.push(p);
  }
  for (const [key, list] of paramsByCategory.entries()) {
    if (key === 'GENERAL_CONDITION') {
      const order = ['running', 'algae', 'deposit'];
      const getOrder = (p: TParameter) => {
        const idx = order.findIndex(k =>
          p.variableName.toLowerCase().includes(k)
        );
        return idx === -1 ? 999 : idx;
      };
      paramsByCategory.set(
        key,
        [...list].sort((a, b) => {
          const diff = getOrder(a) - getOrder(b);
          if (diff !== 0) return diff;
          return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
        })
      );
    } else {
      paramsByCategory.set(
        key,
        [...list].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      );
    }
  }

  const photoEntries = displayParameters.flatMap(param => {
    if (param.category !== 'CONSUMPTION') return [];
    const isWaterMeter = ['before', 'after'].some(k =>
      param.name.toLowerCase().includes(k)
    );
    if (!isWaterMeter) return [];

    const key = makeEntryKey(param.id, null, 'VALUE');
    const entry = valuesByKey[key];
    if (entry?.fileUrl) {
      return [{ param, url: entry.fileUrl }];
    }
    return [];
  });

  const beforePhotos = photos.filter(photo => photo.type === 'BEFORE');
  const afterPhotos = photos.filter(photo => photo.type === 'AFTER');
  const hasDocumentation =
    photoEntries.length > 0 ||
    beforePhotos.length > 0 ||
    afterPhotos.length > 0;

  return (
    <div className="bg-white text-black text-[11px] leading-tight w-[210mm] min-h-[297mm] mx-auto shadow-xl print:shadow-none print:w-full print:min-h-0 print:mx-0 print:text-[11px]">
      <div className="print:hidden mb-2 text-xs text-muted-foreground p-2 text-center">
        Mode cetak: gunakan tombol Print pada halaman ini.
      </div>

      <div className="border border-black border-b-0 p-1">
        <LogSheetHeader
          customerName={customerName}
          date={date}
          byName={byName}
          replacedByName={replacedByName}
        />
      </div>

      <div className="flex flex-col border border-black border-t-0">
        {categories.map((category, index) => {
          const params =
            paramsByCategory.get(category as TParameter['category']) ?? [];
          if (params.length === 0) return null;

          const cat = category as TParameter['category'];
          const sectionMachines = machinesForCategory(cat, machines);

          if (cat === 'CONSUMPTION') {
            return (
              <ConsumptionSection
                key={category}
                params={params}
                valuesByKey={valuesByKey}
                chemicalUsages={chemicalUsages}
              />
            );
          }

          if (cat === 'COOLING_WATER_QUALITY') {
            return (
              <CoolingWaterSection
                key={category}
                category={cat}
                params={params}
                sectionMachines={sectionMachines}
                valuesByKey={valuesByKey}
              />
            );
          }

          return (
            <GeneralCategorySection
              key={category}
              category={cat}
              params={params}
              sectionMachines={sectionMachines}
              valuesByKey={valuesByKey}
              isFirst={index === 0}
            />
          );
        })}

        <div className="border-t border-black">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[180px]" />
            </colgroup>
            <thead>
              <tr>
                <th className="border-r border-black bg-blue-200 print:bg-blue-200 p-[2px] font-semibold text-center align-middle">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1 whitespace-pre-wrap h-[120px] align-top">
                  {notes ?? ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <SignaturesSection
          customerName={customerName}
          corintekPicName={corintekPicName}
          clientPicName={clientPicName}
          technicianSignatureUrl={technicianSignatureUrl}
          clientPicSignatureUrl={clientPicSignatureUrl}
          approvedAtText={approvedAtText}
          submittedAtText={submittedAtText}
        />
      </div>

      {hasDocumentation && (
        <DocumentationSection
          customerName={customerName}
          date={date}
          byName={byName}
          replacedByName={replacedByName}
          displayParameters={displayParameters}
          valuesByKey={valuesByKey}
          photos={photos}
        />
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { size: A4 portrait; margin: 5mm; }
            html, body { background: #fff; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            .break-words { word-break: break-word; }
            .break-before-page { break-before: page; }
            /* Force background colors in print */
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `,
        }}
      />
    </div>
  );
}
