import 'dotenv/config';
import path from 'path';
import { defineConfig } from 'prisma/config';

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
    url: process.env.DIRECT_URL!,
  },
});
