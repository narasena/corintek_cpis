import 'dotenv/config';
import path from 'path';
import { defineConfig, env, PrismaConfig } from 'prisma/config';

export default defineConfig({
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
  datasource: {
    // provider: 'postgresql',
    url: env('DATABASE_URL'),
    // directUrl: env('DIRECT_URL'),
  },
});
