'use client';

import type { TMachine, TParameter } from '@/features/log-sheets/types';
import {
  CoolingWaterQualityDesktop,
  CoolingWaterQualityMobile,
  GeneralCategoryDesktop,
  GeneralCategoryMobile,
} from './category-sections';
import { UNIT_CATEGORIES, hasNotesCategory } from './category-config';

type TMachinesForCategoryResult = {
  machines: TMachine[];
  label: string;
};

interface ILogSheetCategorySectionProps {
  categories: string[];
  parametersByCategory: Map<string, TParameter[]>;
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

        const isUnitCategory = UNIT_CATEGORIES.includes(
          cat as (typeof UNIT_CATEGORIES)[number]
        );

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
              />
            );
          }

          return (
            <CoolingWaterQualityDesktop
              key={category}
              category={category}
              params={params}
              activeCTs={activeCTs}
            />
          );
        }

        const hasNotes = hasNotesCategory(cat);

        if (isMobileView) {
          return (
            <GeneralCategoryMobile
              key={category}
              category={category}
              params={params}
              machines={machines}
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
            hasNotes={hasNotes}
            cat={cat}
          />
        );
      })}
    </>
  );
}
