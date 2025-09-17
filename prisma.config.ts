import path from 'node:path'
import type { PrismaConfig } from 'prisma'

export default {
  schema: path.join(__dirname, 'src', 'app', 'api', 'prisma'),
  migrations: {
    path: path.join(__dirname, 'src', 'app', 'api', 'prisma', "migrations"),
  },
} satisfies PrismaConfig