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

  // 1. Seed Admin User
  const adminEmail = 'admin@corintek.com';
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Corintek123!', 10);
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
      console.log('Created Admin User: admin@corintek.com / Corintek123!');
    } else {
      console.log('Admin User already exists.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }

  // 2. Seed Default Parameters
  // We check if any parameters exist to avoid duplicates or re-seeding if data is there
  try {
    const parameters = [
        {
          name: 'Temp In',
          variableName: 'temp_in_cond',
          category: ParameterCategory.UNIT_CONDENSOR,
          valueType: ValueType.NUMBER,
          unit: '°C',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Temp Out',
          variableName: 'temp_out_cond',
          category: ParameterCategory.UNIT_CONDENSOR,
          valueType: ValueType.NUMBER,
          unit: '°C',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Saturated Temp',
          variableName: 'saturated_temp_cond',
          category: ParameterCategory.UNIT_CONDENSOR,
          valueType: ValueType.NUMBER,
          unit: '°C',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Approach',
          variableName: 'approach_cond',
          category: ParameterCategory.UNIT_CONDENSOR,
          valueType: ValueType.NUMBER,
          unit: '°C',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Load Demand / RLA',
          variableName: 'load_demand_rla_cond',
          category: ParameterCategory.UNIT_CONDENSOR,
          valueType: ValueType.NUMBER,
          unit: '%',
          minValue: 0,
          maxValue: 100,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Ampere',
          variableName: 'ampere_cond',
          category: ParameterCategory.UNIT_CONDENSOR,
          valueType: ValueType.NUMBER,
          unit: 'A',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Temp In',
          variableName: 'temp_in_evap',
          category: ParameterCategory.UNIT_EVAPORATOR,
          valueType: ValueType.NUMBER,
          unit: '°C',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Temp Out',
          variableName: 'temp_out_evap',
          category: ParameterCategory.UNIT_EVAPORATOR,
          valueType: ValueType.NUMBER,
          unit: '°C',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Saturated Temp',
          variableName: 'saturated_temp_evap',
          category: ParameterCategory.UNIT_EVAPORATOR,
          valueType: ValueType.NUMBER,
          unit: '°C',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Approach',
          variableName: 'approach_evap',
          category: ParameterCategory.UNIT_EVAPORATOR,
          valueType: ValueType.NUMBER,
          unit: '°C',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'pH',
          variableName: 'ph_ct',
          category: ParameterCategory.COOLING_WATER_QUALITY,
          valueType: ValueType.NUMBER,
          unit: '',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'P. Alkalinity',
          variableName: 'p_alkalinity_ct',
          category: ParameterCategory.COOLING_WATER_QUALITY,
          valueType: ValueType.NUMBER,
          unit: 'ppm CaCO3',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 1,
          isActive: true,
        },
        {
          name: 'M. Alkalinity',
          variableName: 'm_alkalinity_ct',
          category: ParameterCategory.COOLING_WATER_QUALITY,
          valueType: ValueType.NUMBER,
          unit: 'ppm CaCO3',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 2,
          isActive: true,
        },
        {
          name: 'Total Hardness',
          variableName: 'total_hardness_ct',
          category: ParameterCategory.COOLING_WATER_QUALITY,
          valueType: ValueType.NUMBER,
          unit: 'ppm CaCO3',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 3,
          isActive: true,
        },
        {
          name: 'TDS',
          variableName: 'tds_ct',
          category: ParameterCategory.COOLING_WATER_QUALITY,
          valueType: ValueType.NUMBER,
          unit: 'ppm',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 5,
          isActive: true,
        },
        {
          name: 'Conductivity',
          variableName: 'conductivity_ct',
          category: ParameterCategory.COOLING_WATER_QUALITY,
          valueType: ValueType.NUMBER,
          unit: 'μS',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 4,
          isActive: true,
        },
        {
          name: 'Chloride',
          variableName: 'chloride_ct',
          category: ParameterCategory.COOLING_WATER_QUALITY,
          valueType: ValueType.NUMBER,
          unit: 'ppm Cl',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 6,
          isActive: true,
        },
        {
          name: 'Iron (Fe)',
          variableName: 'iron_fe_ct',
          category: ParameterCategory.COOLING_WATER_QUALITY,
          valueType: ValueType.NUMBER,
          unit: 'ppm Fe',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 7,
          isActive: true,
        },
        {
          name: 'Nitrite (NO2)',
          variableName: 'nitrite_no2_ct',
          category: ParameterCategory.LAB_ANALYSIS,
          valueType: ValueType.NUMBER,
          unit: 'ppm',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 8,
          isActive: true,
        },
        {
          name: 'Cycle',
          variableName: 'cycle_ct',
          category: ParameterCategory.COOLING_WATER_QUALITY,
          valueType: ValueType.NUMBER,
          unit: 'Cycle',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 9,
          isActive: true,
        },
        {
          name: 'Running Status',
          variableName: 'running_status_ct',
          category: ParameterCategory.GENERAL_CONDITION,
          valueType: ValueType.BOOLEAN,
          unit: '',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Algae/Lumut',
          variableName: 'algae_ct',
          category: ParameterCategory.GENERAL_CONDITION,
          valueType: ValueType.BOOLEAN,
          unit: '',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Cleaning Hot Basin',
          variableName: 'cleaning_hot_basin_ct',
          category: ParameterCategory.JOB_DESCRIPTION,
          valueType: ValueType.BOOLEAN,
          unit: '',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Cleaning Cool Basin',
          variableName: 'cleaning_cool_basin_ct',
          category: ParameterCategory.JOB_DESCRIPTION,
          valueType: ValueType.BOOLEAN,
          unit: '',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Cleaning Filler',
          variableName: 'cleaning_filler_ct',
          category: ParameterCategory.JOB_DESCRIPTION,
          valueType: ValueType.BOOLEAN,
          unit: '',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Cleaning Area',
          variableName: 'cleaning_area_ct',
          category: ParameterCategory.JOB_DESCRIPTION,
          valueType: ValueType.BOOLEAN,
          unit: '',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Before ',
          variableName: 'before_consumption_ct',
          category: ParameterCategory.CONSUMPTION,
          valueType: ValueType.NUMBER,
          unit: '',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'After',
          variableName: 'after_consumption_ct',
          category: ParameterCategory.CONSUMPTION,
          valueType: ValueType.NUMBER,
          unit: '',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Total Consumption',
          variableName: 'total_consumption_ct',
          category: ParameterCategory.CONSUMPTION,
          valueType: ValueType.NUMBER,
          unit: '',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
        {
          name: 'Deposit',
          variableName: 'deposit_ct',
          category: ParameterCategory.GENERAL_CONDITION,
          valueType: ValueType.BOOLEAN,
          unit: '',
          minValue: null,
          maxValue: null,
          rawWaterMinValue: null,
          rawWaterMaxValue: null,
          displayOrder: 0,
          isActive: true,
        },
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

    // Fix: Move Nitrite to LAB_ANALYSIS
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
    console.error('Error seeding parameters:', error);
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
