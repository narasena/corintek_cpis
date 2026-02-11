import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Singleton pattern to prevent multiple instances in development
const cachedPrisma = globalForPrisma.prisma;
const prismaIsOutdated =
  cachedPrisma &&
  typeof cachedPrisma === 'object' &&
  !('attendance' in cachedPrisma);

export const prisma =
  (!prismaIsOutdated ? cachedPrisma : undefined) ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['info', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
