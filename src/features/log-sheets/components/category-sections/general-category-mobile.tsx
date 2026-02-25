'use client';

import { MobileEntryCard } from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/components/mobile-entry-card';
import type { TMachine, TParameter } from '@/features/log-sheets/types';
import { isWaterMeterParam } from '../category-config';

interface IGeneralCategoryMobileProps {
  category: string;
  params: TParameter[];
  machines: TMachine[];
  hasNotes: boolean;
  cat: TParameter['category'];
}

export function GeneralCategoryMobile({
  category,
  params,
  machines,
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
            hasNotes={hasNotes}
            isWaterMeter={paramName => isWaterMeterParam(paramName, cat)}
          />
        ))}
      </div>
    </div>
  );
}
