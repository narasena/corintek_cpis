-- Migration: Rename parameter_limit_categories to parameter_limit_profiles
-- Step 1: Rename table first (no data dependency)
ALTER TABLE "parameter_limit_categories" RENAME TO "parameter_limit_profiles";

-- Step 2: Add profileId column as text first (to match existing categoryId type)
ALTER TABLE "parameter_limits" ADD COLUMN "profileId" TEXT;

-- Step 3: Copy categoryId values to profileId
UPDATE "parameter_limits" SET "profileId" = "categoryId";

-- Step 4: Make profileId not null
ALTER TABLE "parameter_limits" ALTER COLUMN "profileId" SET NOT NULL;

-- Step 5: Add foreign key to new profileId
ALTER TABLE "parameter_limits" ADD CONSTRAINT "parameter_limits_profileId_fkey" 
    FOREIGN KEY ("profileId") REFERENCES "parameter_limit_profiles"(id) ON DELETE CASCADE;

-- Step 6: Drop old foreign key constraint
ALTER TABLE "parameter_limits" DROP CONSTRAINT IF EXISTS "parameter_limits_categoryId_fkey";

-- Step 7: Drop old categoryId column
ALTER TABLE "parameter_limits" DROP COLUMN "categoryId";

-- Step 8: Recreate unique constraint with new column name
ALTER TABLE "parameter_limits" DROP CONSTRAINT IF EXISTS "parameter_limits_categoryId_parameterId_key";
ALTER TABLE "parameter_limits" ADD CONSTRAINT "parameter_limits_profileId_parameterId_key" UNIQUE ("profileId", "parameterId");

-- Step 9: Update index names
DROP INDEX IF EXISTS "parameter_limits_categoryId_idx";
CREATE INDEX IF NOT EXISTS "parameter_limits_profileId_idx" ON "parameter_limits"("profileId");

-- Step 10: Remove minValue/maxValue from parameters table (if column exists)
ALTER TABLE "parameters" DROP COLUMN IF EXISTS "minValue";
ALTER TABLE "parameters" DROP COLUMN IF EXISTS "maxValue";
ALTER TABLE "parameters" DROP COLUMN IF EXISTS "rawWaterMinValue";
ALTER TABLE "parameters" DROP COLUMN IF EXISTS "rawWaterMaxValue";

-- Step 11: Rename column in projects table (keep as TEXT to match existing)
ALTER TABLE "projects" ADD COLUMN "parameterLimitProfileId" TEXT;
UPDATE "projects" SET "parameterLimitProfileId" = "parameterLimitCategoryId";
ALTER TABLE "projects" ALTER COLUMN "parameterLimitProfileId" DROP NOT NULL;
ALTER TABLE "projects" DROP COLUMN IF EXISTS "parameterLimitCategoryId";

-- Step 12: Add foreign key for projects
ALTER TABLE "projects" ADD CONSTRAINT "projects_parameterLimitProfileId_fkey" 
    FOREIGN KEY ("parameterLimitProfileId") REFERENCES "parameter_limit_profiles"(id) ON DELETE SET NULL;
