/**
 * Seed Export Script
 *
 * This script exports all current data from the database to a seed file.
 * Run with: npx tsx prisma/seed-export.ts
 *
 * This will create/update prisma/seed-data.ts with all current data.
 */

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { fileURLToPath } from 'url';

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

interface SeedData {
  users: any[];
  clients: any[];
  projects: any[];
  machines: any[];
  parameters: any[];
  projectParameterOverrides: any[];
  chemicals: any[];
  logSheets: any[];
  logSheetPhotos: any[];
  chemicalUsages: any[];
  logSheetEntries: any[];
}

async function exportSeedData() {
  console.log('🔄 Exporting seed data from database...');

  const seedData: SeedData = {
    users: [],
    clients: [],
    projects: [],
    machines: [],
    parameters: [],
    projectParameterOverrides: [],
    chemicals: [],
    logSheets: [],
    logSheetPhotos: [],
    chemicalUsages: [],
    logSheetEntries: [],
  };

  try {
    // Export Users
    console.log('  📦 Exporting users...');
    seedData.users = await prisma.user.findMany({
      where: { deletedAt: null },
    });

    // Export Clients
    console.log('  📦 Exporting clients...');
    seedData.clients = await prisma.client.findMany({
      where: { deletedAt: null },
    });

    // Export Projects
    console.log('  📦 Exporting projects...');
    seedData.projects = await prisma.project.findMany({
      where: { deletedAt: null },
    });

    // Export Machines
    console.log('  📦 Exporting machines...');
    seedData.machines = await prisma.machine.findMany({
      where: { deletedAt: null },
    });

    console.log('  📦 Exporting parameters...');
    seedData.parameters = await prisma.parameter.findMany({
      where: { deletedAt: null },
    });

    console.log('  📦 Exporting project parameter overrides...');
    seedData.projectParameterOverrides =
      await prisma.projectParameterOverride.findMany();

    console.log('  📦 Exporting chemicals...');
    seedData.chemicals = await prisma.chemical.findMany({
      where: { deletedAt: null },
    });

    console.log('  📦 Exporting log sheets...');
    seedData.logSheets = await prisma.logSheet.findMany({
      where: { deletedAt: null },
    });

    console.log('  📦 Exporting log sheet photos...');
    seedData.logSheetPhotos = await prisma.logSheetPhoto.findMany({
      where: { deletedAt: null },
    });

    console.log('  📦 Exporting chemical usages...');
    seedData.chemicalUsages = await prisma.chemicalUsage.findMany({
      where: { deletedAt: null },
    });

    // Export Log Sheet Entries
    console.log('  📦 Exporting log sheet entries...');
    seedData.logSheetEntries = await prisma.logSheetEntry.findMany();

    console.log('\n✅ Seed data exported successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${seedData.users.length}`);
    console.log(`   Clients: ${seedData.clients.length}`);
    console.log(`   Projects: ${seedData.projects.length}`);
    console.log(`   Machines: ${seedData.machines.length}`);
    console.log(`   Parameters: ${seedData.parameters.length}`);
    console.log(
      `   Project Parameter Overrides: ${seedData.projectParameterOverrides.length}`
    );
    console.log(`   Chemicals: ${seedData.chemicals.length}`);
    console.log(`   Log Sheets: ${seedData.logSheets.length}`);
    console.log(`   Log Sheet Photos: ${seedData.logSheetPhotos.length}`);
    console.log(`   Chemical Usages: ${seedData.chemicalUsages.length}`);
    console.log(`   Log Sheet Entries: ${seedData.logSheetEntries.length}`);

    return seedData;
  } catch (error) {
    console.error('❌ Error exporting seed data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function generateSeedFile(data: SeedData): string {
  const timestamp = new Date().toISOString();

  return `/**
 * Seed Data
 *
 * Generated: ${timestamp}
 *
 * This file contains exported data from the database.
 * To restore this data, run: npx tsx prisma/seed-data.ts
 */

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

export const seedData = ${JSON.stringify(data, null, 2)};

export async function main() {
  console.log('🔄 Seeding database...');

  try {
    // Seed Users
    if (seedData.users.length > 0) {
      console.log('  📦 Seeding users...');
      for (const user of seedData.users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user,
        });
      }
    }

    // Seed Clients
    if (seedData.clients.length > 0) {
      console.log('  📦 Seeding clients...');
      for (const client of seedData.clients) {
        await prisma.client.upsert({
          where: { id: client.id },
          update: client,
          create: client,
        });
      }
    }

    // Seed Projects
    if (seedData.projects.length > 0) {
      console.log('  📦 Seeding projects...');
      for (const project of seedData.projects) {
        await prisma.project.upsert({
          where: { id: project.id },
          update: project,
          create: project,
        });
      }
    }

    // Seed Machines
    if (seedData.machines.length > 0) {
      console.log('  📦 Seeding machines...');
      for (const machine of seedData.machines) {
        await prisma.machine.upsert({
          where: { id: machine.id },
          update: machine,
          create: machine,
        });
      }
    }

    if (seedData.parameters.length > 0) {
      console.log('  📦 Seeding parameters...');
      for (const parameter of seedData.parameters) {
        await prisma.parameter.upsert({
          where: { id: parameter.id },
          update: parameter,
          create: parameter,
        });
      }
    }

    if (seedData.projectParameterOverrides.length > 0) {
      console.log('  📦 Seeding project parameter overrides...');
      for (const override of seedData.projectParameterOverrides) {
        await prisma.projectParameterOverride.upsert({
          where: {
            projectId_parameterId: {
              projectId: override.projectId,
              parameterId: override.parameterId,
            },
          },
          update: override,
          create: override,
        });
      }
    }

    if (seedData.chemicals.length > 0) {
      console.log('  📦 Seeding chemicals...');
      for (const chemical of seedData.chemicals) {
        await prisma.chemical.upsert({
          where: { id: chemical.id },
          update: chemical,
          create: chemical,
        });
      }
    }

    if (seedData.logSheets.length > 0) {
      console.log('  📦 Seeding log sheets...');
      for (const logSheet of seedData.logSheets) {
        await prisma.logSheet.upsert({
          where: { id: logSheet.id },
          update: logSheet,
          create: logSheet,
        });
      }
    }

    if (seedData.logSheetPhotos.length > 0) {
      console.log('  📦 Seeding log sheet photos...');
      for (const photo of seedData.logSheetPhotos) {
        await prisma.logSheetPhoto.upsert({
          where: { id: photo.id },
          update: photo,
          create: photo,
        });
      }
    }

    if (seedData.chemicalUsages.length > 0) {
      console.log('  📦 Seeding chemical usages...');
      for (const usage of seedData.chemicalUsages) {
        await prisma.chemicalUsage.upsert({
          where: { id: usage.id },
          update: usage,
          create: usage,
        });
      }
    }

    if (seedData.logSheetEntries.length > 0) {
      console.log('  📦 Seeding log sheet entries...');
      for (const entry of seedData.logSheetEntries) {
        await prisma.logSheetEntry.upsert({
          where: { id: entry.id },
          update: entry,
          create: entry,
        });
      }
    }

    console.log('\\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
`;
}

export async function exportSeedDataToFile() {
  const data = await exportSeedData();
  const seedFileContent = generateSeedFile(data);
  const fs = await import('fs');
  const path = await import('path');
  const seedFilePath = path.join(process.cwd(), 'prisma', 'seed-data.ts');
  fs.writeFileSync(seedFilePath, seedFileContent, 'utf-8');
  console.log(`\n✅ Seed file created: ${seedFilePath}`);
  console.log('\n💡 To restore this data later, run:');
  console.log('   npx tsx prisma/seed-data.ts');
  return seedFilePath;
}

async function main() {
  try {
    await exportSeedDataToFile();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
