# Prisma 7+ & Supabase Connection Troubleshooting

## The Issue
After upgrading to Prisma 7+, many users experience "hanging" connections when using the Supabase pooled database URL (Port 6543).

## Root Cause Analysis
The hang occurs primarily due to a mismatch between Prisma 7's connection handling and Supabase's **Supavisor** pooler in **Transaction Mode**.

1.  **Transaction Mode (Port 6543)**: This mode is designed for high concurrency but **does not support prepared statements**.
2.  **Prisma CLI & Migrations**: Prisma Migrate requires features like advisory locks and session-level state, which are only supported in **Session Mode (Port 5432)** or via a direct connection.
3.  **Hanging**: When Prisma tries to use prepared statements or advisory locks on a Transaction Mode connection (6543), the pooler may drop the request or hang indefinitely waiting for a session-level state that never arrives.

## Configuration Differences

| Feature | Pooled URL (Port 6543) | Direct/Session URL (Port 5432) |
| :--- | :--- | :--- |
| **Supavisor Mode** | Transaction | Session |
| **Prepared Statements** | Not Supported | Supported |
| **Advisory Locks** | Not Supported | Supported |
| **Use Case** | Application Runtime (High scale) | Migrations & CLI commands |
| **Prisma Param** | `?pgbouncer=true` required | None required |

## Solution Implementation

### 1. Update `prisma.config.ts`
The Prisma CLI must always use the `DIRECT_URL` (Port 5432) to ensure migrations can acquire the necessary locks.

```typescript
// prisma.config.ts
export default defineConfig({
  // ...
  datasource: {
    url: process.env.DIRECT_URL!, // Force CLI to use direct connection
  },
});
```

### 2. Configure `DATABASE_URL` with Query Parameters
The pooled URL used for the application runtime needs specific parameters to work with Supavisor:

- `pgbouncer=true`: Tells Prisma to disable prepared statements.
- `connect_timeout=30`: Prevents indefinite hangs during network hiccups.

**Recommended `.env` format:**
```env
DATABASE_URL="postgresql://user:pass@db.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30"
DIRECT_URL="postgresql://user:pass@db.pooler.supabase.com:5432/postgres"
```

### 3. Use explicit `pg` Pool with Adapter
When using `@prisma/adapter-pg`, passing a pre-configured `pg.Pool` can provide better stability.

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Add additional pg-specific config here if needed
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
```

## Migration Guidelines for Existing Projects
1.  Update `prisma.config.ts` to use `DIRECT_URL`.
2.  Append `?pgbouncer=true&connect_timeout=30` to your `DATABASE_URL`.
3.  Run `npx prisma generate` to sync the client.
4.  If hangs persist in serverless environments, add `&connection_limit=1` to the `DATABASE_URL`.
