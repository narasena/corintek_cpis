import {
  preprocessBlank,
  preprocessBoolean,
} from '@/features/schemas/defaultSchema';
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
  runningStatus: preprocessBoolean(z.boolean()),
  algae: preprocessBoolean(z.boolean()),
  deposit: preprocessBoolean(z.boolean()),
});

const coolingTowerJobSchema = z.object({
  hotBasinCleaning: preprocessBoolean(z.boolean()),
  coldBasinCleaning: preprocessBoolean(z.boolean()),
  fillerCleaning: preprocessBoolean(z.boolean()),
  areaCleaning: preprocessBoolean(z.boolean()),
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

// Helper schema for unitNumber-indexed objects
const createUnitNumberIndexedSchema = (
  unitSchema: z.ZodSchema,
  maxUnits?: number
) => {
  const baseSchema = z.record(z.string(), unitSchema);
  return maxUnits
    ? baseSchema.refine(
        obj => Object.keys(obj).length <= maxUnits,
        `Cannot have more than ${maxUnits} units`
      )
    : baseSchema;
};

export const logSheetSchema = ({
  chillerTotalUnit,
  coolingTowerTotalUnit,
}: {
  chillerTotalUnit: number;
  coolingTowerTotalUnit: number;
}) => {
  return z.object({
    condenserData: createUnitNumberIndexedSchema(
      condenserUnitSchema,
      chillerTotalUnit
    ),
    evaporatorData: createUnitNumberIndexedSchema(
      evaporatorUnitSchema,
      chillerTotalUnit
    ),
    coolingTowerWaterQualityData: createUnitNumberIndexedSchema(
      coolingTowerWaterQualitySchema,
      coolingTowerTotalUnit
    ),
    rawWaterQualityData: coolingTowerWaterQualitySchema.extend({
      notes: preprocessBlank(z.string().nullable().optional()),
    }),
    coolingTowerGeneralConditionData: createUnitNumberIndexedSchema(
      coolingTowerGeneralConditionSchema,
      coolingTowerTotalUnit
    ),
    coolingTowerJobData: createUnitNumberIndexedSchema(
      coolingTowerJobSchema,
      coolingTowerTotalUnit
    ),
    waterMeterConsumptionData: waterMeterConsumptionSchema,
    chemicalUsageData: z.array(chemicalUsageSchema),
    notes: preprocessBlank(z.string().nullable().optional()),
  });
};

export type TLogSheetAttributes = z.infer<typeof logSheetSchema>;
