import { preprocessBlank } from '@/features/schemas/defaultSchema';
import z from 'zod';

const evaporatorUnitSchema = z.object({
  tempIn: z.number(),
  tempOut: z.number(),
  saturatedTemp: z.number(),
  approachTemp: z.number(),
});

const condenserUnitSchema = evaporatorUnitSchema.extend({
  loadDemand: z
    .number()
    .min(0, 'Nilai tidak boleh negatif')
    .max(100, 'Nilai tidak boleh lebih dari 100'),
});

const coolingTowerWaterQualitySchema = z.object({
  pH: z.number(),
  TDS: z.number(),
  conductivity: z.number(),
  cycle: z.number(),
});

const coolingTowerGeneralConditionSchema = z.object({
  runningStatus: z.boolean(),
  algae: z.boolean(),
  deposit: z.boolean(),
});

const coolingTowerJobSchema = z.object({
  hotBasinCleaning: z.boolean(),
  coldBasinCleaning: z.boolean(),
  fillerCleaning: z.boolean(),
  areaCleaning: z.boolean(),
});

const waterMeterConsumptionSchema = z.object({
  before: z.number(),
  after: z.number(),
  totalConsumption: z.number(),
});

const chemicalUsageSchema = z.object({
  id: z.string(),
  quantity: z.number(),
});

export const logSheetSchema = ({
  chillerTotalUnit,
  coolingTowerTotalUnit,
}: {
  chillerTotalUnit: number;
  coolingTowerTotalUnit: number;
}) => {
  return z.object({
    condenserData: z.array(condenserUnitSchema).min(1).max(chillerTotalUnit),
    evaporatorData: z.array(evaporatorUnitSchema).min(1).max(chillerTotalUnit),
    coolingTowerWaterQualityData: z
      .array(coolingTowerWaterQualitySchema)
      .min(1)
      .max(coolingTowerTotalUnit),
    rawWaterQualityData: coolingTowerWaterQualitySchema.extend({
      notes: preprocessBlank(z.string().nullable().optional()),
    }),
    coolingTowerGeneralConditionData: z
      .array(coolingTowerGeneralConditionSchema)
      .min(1)
      .max(coolingTowerTotalUnit),
    coolingTowerJobData: z
      .array(coolingTowerJobSchema)
      .min(1)
      .max(coolingTowerTotalUnit),
    waterMeterConsumptionData: waterMeterConsumptionSchema,
    chemicalUsageData: z.array(chemicalUsageSchema),
    notes: preprocessBlank(z.string().nullable().optional()),
  });
};

export type TLogSheetAttributes = z.infer<typeof logSheetSchema>;
