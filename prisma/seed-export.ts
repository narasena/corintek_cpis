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
  logSheets: any[];
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
    logSheets: [],
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

    // Export Parameters
    console.log('  📦 Exporting parameters...');
    seedData.parameters = await prisma.parameter.findMany({
      where: { deletedAt: null },
    });

    // Export Log Sheets
    console.log('  📦 Exporting log sheets...');
    seedData.logSheets = await prisma.logSheet.findMany({
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
    console.log(`   Log Sheets: ${seedData.logSheets.length}`);
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

    // Seed Parameters
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

    // Seed Log Sheets
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

    // Seed Log Sheet Entries
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

// Main execution
async function main() {
  try {
    const data = await exportSeedData();
    const seedFileContent = generateSeedFile(data);
    
    // Write to seed-data.ts
    const fs = await import('fs');
    const path = await import('path');
    
    const seedFilePath = path.join(process.cwd(), 'prisma', 'seed-data.ts');
    fs.writeFileSync(seedFilePath, seedFileContent, 'utf-8');
    
    console.log(`\n✅ Seed file created: ${seedFilePath}`);
    console.log('\n💡 To restore this data later, run:');
    console.log('   npx tsx prisma/seed-data.ts');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();