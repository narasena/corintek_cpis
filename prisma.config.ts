import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default {
  schema: 'src/features/api/prisma/schema/schema.prisma',
  migrations: {
    path: 'src/features/api/prisma/migrations',
  },
  datasource: {
    provider: 'postgresql',
    url: env('DATABASE_URL'),
    directUrl: env('DIRECT_URL'),
  },
};
