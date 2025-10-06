import path from 'node:path';
import type { PrismaConfig } from 'prisma';

export default {
  schema: path.join(__dirname, 'src', 'features', 'api', 'prisma', 'schema'),
  migrations: {
    path: path.join(
      __dirname,
      'src',
      'features',
      'api',
      'prisma',
      'migrations'
    ),
  },
} satisfies PrismaConfig;
