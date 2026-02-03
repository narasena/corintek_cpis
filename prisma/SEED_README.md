# Database Seed Export/Import System

This system allows you to backup and restore your database data during development.

## Why Use This?

During development, you might need to:
- Run `prisma migrate reset` which clears all data
- Test migrations that could affect existing data
- Share current data with team members
- Restore data after accidental deletions

Instead of manually re-entering all data, you can export it once and restore it anytime.

## Usage

### Export Current Data

Export all current data from the database to a seed file:

```bash
npm run seed:export
```

This will:
1. Connect to your development database
2. Export all data from all tables
3. Create/update `prisma/seed-data.ts` with the exported data
4. Show a summary of what was exported

### Import/Restore Data

Restore data from the seed file to the database:

```bash
npm run seed:import
```

This will:
1. Read data from `prisma/seed-data.ts`
2. Insert/update all records in the database
3. Use `upsert` to avoid duplicate key errors
4. Show progress as it imports

## What Gets Exported?

The following tables are exported:

- ✅ Users
- ✅ Clients
- ✅ Client Personnel
- ✅ Projects
- ✅ Project Personnel
- ✅ Machines
- ✅ Parameters
- ✅ Chemicals
- ✅ Log Sheets
- ✅ Log Sheet Entries

## Important Notes

### ⚠️ Soft-Deleted Records

The export only includes records where `deletedAt` is `null`. Soft-deleted records are **not** exported.

### ⚠️ ID Preservation

The seed file preserves all IDs, so relationships between records will be maintained when restored.

### ⚠️ Timestamps

All timestamps (`createdAt`, `updatedAt`) are preserved as-is.

### ⚠️ Environment Variables

The scripts use `.env.development` for database connection. Make sure your `DATABASE_URL` is properly configured.

## Workflow Example

### Before Running Migrations

```bash
# 1. Export current data
npm run seed:export

# 2. Run your migration
npm run prisma:migrate

# 3. If migration reset was used, restore data
npm run seed:import
```

### Sharing Data with Team

```bash
# 1. Export your data
npm run seed:export

# 2. Commit the seed file (if needed)
git add prisma/seed-data.ts
git commit -m "feat: add seed data for development"

# 3. Team member restores data
npm run seed:import
```

## Troubleshooting

### Error: "Cannot find module 'tsx'"

Install tsx:
```bash
npm install -D tsx
```

### Error: "Database connection failed"

Check your `.env.development` file:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Error: "Unique constraint failed"

The import uses `upsert`, so it should handle duplicates. If you still get errors, try:
```bash
# Reset database first
npm run prisma:migrate reset

# Then import
npm run seed:import
```

## Customization

To add more tables to the export:

1. Edit `prisma/seed-export.ts`
2. Add the table to the `SeedData` interface
3. Add the export logic in the `exportSeedData` function
4. Add the import logic in the generated seed file template

## File Structure

```
prisma/
├── seed-export.ts          # Export script
├── seed-data.ts            # Generated seed file (DO NOT EDIT MANUALLY)
└── SEED_README.md          # This file
```

## Best Practices

1. **Export before major changes**: Always export before running risky operations
2. **Commit seed files**: Commit seed files to git for team sharing
3. **Update regularly**: Export after adding important test data
4. **Review before import**: Check the seed file content before importing
5. **Use development only**: These scripts are for development, not production