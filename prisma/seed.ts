import { PrismaClient } from '../src/generated/prisma/client';
import {
  UserRole,
  EmploymentStatus,
  ParameterCategory,
  ValueType,
  ChemicalCategory,
} from '../src/generated/prisma/enums';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { exportSeedDataToFile } from './seed-export';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

async function main() {
  console.log('Start seeding...');

  // 1. Seed Admin User (from env vars to avoid hardcoded secrets)
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const shouldCreateAdmin = process.env.SEED_CREATE_ADMIN === 'true';

  if (shouldCreateAdmin && adminEmail && adminPassword) {
    try {
      const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
      });

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await prisma.user.create({
          data: {
            firstName: 'System',
            lastName: 'Admin',
            email: adminEmail,
            phoneNumber: '08000000000', // Dummy phone
            password: hashedPassword,
            role: UserRole.ADMIN,
            employmentStatus: EmploymentStatus.PERMANENT,
            isActive: true,
            isBlocked: false,
          },
        });
        console.log(`Created Admin User: ${adminEmail}`);
      } else {
        console.log('Admin User already exists.');
      }
    } catch (error) {
      console.error('Error seeding admin user:', error);
    }
   } else {
     console.log('Skipping admin seeding (SEED_CREATE_ADMIN=false or missing env vars)');
   }

   // 2. Seed Default Parameters and Limits
  // Updated for new schema: Parameter no longer has minValue/maxValue fields.
  // Limits are stored in separate ParameterLimit model, linked via ParameterLimitProfile.
  try {
    const parameters = [
      // Condenser Unit Parameters (NUMBER)
      { name: 'Temp In', variableName: 'temp_in_cond', category: ParameterCategory.UNIT_CONDENSOR, valueType: ValueType.NUMBER, unit: '°C', displayOrder: 0, isActive: true, hasLimits: true },
      { name: 'Temp Out', variableName: 'temp_out_cond', category: ParameterCategory.UNIT_CONDENSOR, valueType: ValueType.NUMBER, unit: '°C', displayOrder: 0, isActive: true, hasLimits: true },
      { name: 'Saturated Temp', variableName: 'saturated_temp_cond', category: ParameterCategory.UNIT_CONDENSOR, valueType: ValueType.NUMBER, unit: '°C', displayOrder: 0, isActive: true, hasLimits: true },
      { name: 'Approach', variableName: 'approach_cond', category: ParameterCategory.UNIT_CONDENSOR, valueType: ValueType.NUMBER, unit: '°C', displayOrder: 0, isActive: true, hasLimits: true },
      { name: 'Load Demand / RLA', variableName: 'load_demand_rla_cond', category: ParameterCategory.UNIT_CONDENSOR, valueType: ValueType.NUMBER, unit: '%', displayOrder: 0, isActive: true, hasLimits: true },
      { name: 'Ampere', variableName: 'ampere_cond', category: ParameterCategory.UNIT_CONDENSOR, valueType: ValueType.NUMBER, unit: 'A', displayOrder: 0, isActive: true, hasLimits: true },

      // Evaporator Unit Parameters (NUMBER)
      { name: 'Temp In', variableName: 'temp_in_evap', category: ParameterCategory.UNIT_EVAPORATOR, valueType: ValueType.NUMBER, unit: '°C', displayOrder: 0, isActive: true, hasLimits: true },
      { name: 'Temp Out', variableName: 'temp_out_evap', category: ParameterCategory.UNIT_EVAPORATOR, valueType: ValueType.NUMBER, unit: '°C', displayOrder: 0, isActive: true, hasLimits: true },
      { name: 'Saturated Temp', variableName: 'saturated_temp_evap', category: ParameterCategory.UNIT_EVAPORATOR, valueType: ValueType.NUMBER, unit: '°C', displayOrder: 0, isActive: true, hasLimits: true },
      { name: 'Approach', variableName: 'approach_evap', category: ParameterCategory.UNIT_EVAPORATOR, valueType: ValueType.NUMBER, unit: '°C', displayOrder: 0, isActive: true, hasLimits: true },

      // Cooling Water Quality Parameters (NUMBER)
      { name: 'pH', variableName: 'ph_ct', category: ParameterCategory.COOLING_WATER_QUALITY, valueType: ValueType.NUMBER, unit: '', displayOrder: 0, isActive: true, hasLimits: true },
      { name: 'P. Alkalinity', variableName: 'p_alkalinity_ct', category: ParameterCategory.COOLING_WATER_QUALITY, valueType: ValueType.NUMBER, unit: 'ppm CaCO3', displayOrder: 1, isActive: true, hasLimits: true },
      { name: 'M. Alkalinity', variableName: 'm_alkalinity_ct', category: ParameterCategory.COOLING_WATER_QUALITY, valueType: ValueType.NUMBER, unit: 'ppm CaCO3', displayOrder: 2, isActive: true, hasLimits: true },
      { name: 'Total Hardness', variableName: 'total_hardness_ct', category: ParameterCategory.COOLING_WATER_QUALITY, valueType: ValueType.NUMBER, unit: 'ppm CaCO3', displayOrder: 3, isActive: true, hasLimits: true },
      { name: 'TDS', variableName: 'tds_ct', category: ParameterCategory.COOLING_WATER_QUALITY, valueType: ValueType.NUMBER, unit: 'ppm', displayOrder: 5, isActive: true, hasLimits: true },
      { name: 'Conductivity', variableName: 'conductivity_ct', category: ParameterCategory.COOLING_WATER_QUALITY, valueType: ValueType.NUMBER, unit: 'μS', displayOrder: 4, isActive: true, hasLimits: true },
      { name: 'Chloride', variableName: 'chloride_ct', category: ParameterCategory.COOLING_WATER_QUALITY, valueType: ValueType.NUMBER, unit: 'ppm Cl', displayOrder: 6, isActive: true, hasLimits: true },
      { name: 'Iron (Fe)', variableName: 'iron_fe_ct', category: ParameterCategory.COOLING_WATER_QUALITY, valueType: ValueType.NUMBER, unit: 'ppm Fe', displayOrder: 7, isActive: true, hasLimits: true },
      { name: 'Nitrite (NO2)', variableName: 'nitrite_no2_ct', category: ParameterCategory.LAB_ANALYSIS, valueType: ValueType.NUMBER, unit: 'ppm', displayOrder: 8, isActive: true, hasLimits: true },
      { name: 'Cycle', variableName: 'cycle_ct', category: ParameterCategory.COOLING_WATER_QUALITY, valueType: ValueType.NUMBER, unit: 'Cycle', displayOrder: 9, isActive: true, hasLimits: true },

      // General Condition (BOOLEAN - no limits)
      { name: 'Running Status', variableName: 'running_status_ct', category: ParameterCategory.GENERAL_CONDITION, valueType: ValueType.BOOLEAN, unit: '', displayOrder: 0, isActive: true, hasLimits: false },
      { name: 'Algae/Lumut', variableName: 'algae_ct', category: ParameterCategory.GENERAL_CONDITION, valueType: ValueType.BOOLEAN, unit: '', displayOrder: 0, isActive: true, hasLimits: false },
      { name: 'Deposit', variableName: 'deposit_ct', category: ParameterCategory.GENERAL_CONDITION, valueType: ValueType.BOOLEAN, unit: '', displayOrder: 0, isActive: true, hasLimits: false },

      // Job Description (BOOLEAN - no limits)
      { name: 'Cleaning Hot Basin', variableName: 'cleaning_hot_basin_ct', category: ParameterCategory.JOB_DESCRIPTION, valueType: ValueType.BOOLEAN, unit: '', displayOrder: 0, isActive: true, hasLimits: false },
      { name: 'Cleaning Cool Basin', variableName: 'cleaning_cool_basin_ct', category: ParameterCategory.JOB_DESCRIPTION, valueType: ValueType.BOOLEAN, unit: '', displayOrder: 0, isActive: true, hasLimits: false },
      { name: 'Cleaning Filler', variableName: 'cleaning_filler_ct', category: ParameterCategory.JOB_DESCRIPTION, valueType: ValueType.BOOLEAN, unit: '', displayOrder: 0, isActive: true, hasLimits: false },
      { name: 'Cleaning Area', variableName: 'cleaning_area_ct', category: ParameterCategory.JOB_DESCRIPTION, valueType: ValueType.BOOLEAN, unit: '', displayOrder: 0, isActive: true, hasLimits: false },

      // Consumption (NUMBER)
      { name: 'Before', variableName: 'before_consumption_ct', category: ParameterCategory.CONSUMPTION, valueType: ValueType.NUMBER, unit: '', displayOrder: 0, isActive: true, hasLimits: true },
      { name: 'After', variableName: 'after_consumption_ct', category: ParameterCategory.CONSUMPTION, valueType: ValueType.NUMBER, unit: '', displayOrder: 0, isActive: true, hasLimits: true },
      { name: 'Total Consumption', variableName: 'total_consumption_ct', category: ParameterCategory.CONSUMPTION, valueType: ValueType.NUMBER, unit: '', displayOrder: 0, isActive: true, hasLimits: true },
    ];

    const existing = await prisma.parameter.findMany({
      where: { variableName: { in: parameters.map(p => p.variableName) } },
      select: { variableName: true },
    });
    const existingVariableNames = new Set(existing.map(p => p.variableName));

    const missing = parameters.filter(p => !existingVariableNames.has(p.variableName));
    for (const param of missing) {
      await prisma.parameter.create({ data: param });
    }

    if (missing.length > 0) {
      console.log(`Seeded ${missing.length} parameters.`);
    } else {
      console.log('Parameters already exist. Skipping parameter seeding.');
    }

    // After parameters exist, create a default limit profile and limits for numeric parameters
    const defaultProfile = await prisma.parameterLimitProfile.upsert({
      where: { name: 'Default Profile' },
      update: {},
      create: {
        name: 'Default Profile',
        description: 'Default limits for all numeric parameters',
        isDefault: true,
      },
    });

    // Define limits for all numeric parameters
    const limitsToCreate: Array<{
      profileId: string;
      parameterVariableName: string;
      minValue: number | null;
      maxValue: number | null;
      rawWaterMinValue: number | null;
      rawWaterMaxValue: number | null;
    }> = [
      // Condenser Unit Limits
      { profileId: defaultProfile.id, parameterVariableName: 'temp_in_cond', minValue: 20, maxValue: 45, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'temp_out_cond', minValue: 15, maxValue: 40, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'saturated_temp_cond', minValue: 10, maxValue: 50, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'approach_cond', minValue: 2, maxValue: 10, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'load_demand_rla_cond', minValue: 0, maxValue: 100, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'ampere_cond', minValue: 0, maxValue: 50, rawWaterMinValue: null, rawWaterMaxValue: null },

      // Evaporator Unit Limits
      { profileId: defaultProfile.id, parameterVariableName: 'temp_in_evap', minValue: 5, maxValue: 25, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'temp_out_evap', minValue: 2, maxValue: 20, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'saturated_temp_evap', minValue: 0, maxValue: 20, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'approach_evap', minValue: 2, maxValue: 10, rawWaterMinValue: null, rawWaterMaxValue: null },

      // Cooling Water Quality Limits
      { profileId: defaultProfile.id, parameterVariableName: 'ph_ct', minValue: 6.0, maxValue: 9.0, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'p_alkalinity_ct', minValue: 50, maxValue: 500, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'm_alkalinity_ct', minValue: 50, maxValue: 500, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'total_hardness_ct', minValue: 50, maxValue: 500, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'tds_ct', minValue: 100, maxValue: 2000, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'conductivity_ct', minValue: 200, maxValue: 3000, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'chloride_ct', minValue: 0, maxValue: 500, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'iron_fe_ct', minValue: 0, maxValue: 2, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'nitrite_no2_ct', minValue: 0, maxValue: 1, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'cycle_ct', minValue: 2, maxValue: 8, rawWaterMinValue: null, rawWaterMaxValue: null },

      // Consumption Limits
      { profileId: defaultProfile.id, parameterVariableName: 'before_consumption_ct', minValue: 0, maxValue: 100, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'after_consumption_ct', minValue: 0, maxValue: 100, rawWaterMinValue: null, rawWaterMaxValue: null },
      { profileId: defaultProfile.id, parameterVariableName: 'total_consumption_ct', minValue: 0, maxValue: 200, rawWaterMinValue: null, rawWaterMaxValue: null },
    ];

    for (const limit of limitsToCreate) {
      const param = await prisma.parameter.findUnique({
        where: { variableName: limit.parameterVariableName },
      });
      if (param) {
        const existingLimit = await prisma.parameterLimit.findFirst({
          where: {
            profileId: limit.profileId,
            parameterId: param.id,
          },
        });
        if (!existingLimit) {
          const { parameterVariableName, ...limitData } = limit;
          await prisma.parameterLimit.create({
            data: {
              ...limitData,
              parameterId: param.id,
            },
          });
          console.log(`Created limit for ${limit.parameterVariableName}`);
        }
      }
    }

    console.log('Parameter limits seeded.');

    // Fix: Move Nitrite to LAB_ANALYSIS (in case it was previously mis-categorized)
    try {
      await prisma.parameter.update({
        where: { variableName: 'nitrite_no2_ct' },
        data: { category: ParameterCategory.LAB_ANALYSIS },
      });
      console.log('Updated Nitrite (NO2) category to LAB_ANALYSIS');
    } catch (e) {
      // Ignore if not found
    }
  } catch (error) {
    console.error('Error seeding parameters/limits:', error);
  }

  // 3. Seed Chemicals
  try {
    const chemicalCount = await prisma.chemical.count();
    if (chemicalCount === 0) {
      console.log('Seeding chemicals...');

      const chemicals: any[] = [];

      for (const chem of chemicals) {
        await prisma.chemical.create({
          data: chem,
        });
      }
      console.log(`Seeded ${chemicals.length} chemicals.`);
    } else {
      console.log('Chemicals already exist. Skipping chemical seeding.');
    }
  } catch (error) {
    console.error('Error seeding chemicals:', error);
  }

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
