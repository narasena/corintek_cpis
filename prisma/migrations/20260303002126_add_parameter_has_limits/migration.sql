-- DropForeignKey
ALTER TABLE "parameter_limits" DROP CONSTRAINT "parameter_limits_profileId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_parameterLimitProfileId_fkey";

-- AlterTable
ALTER TABLE "parameter_limit_profiles" RENAME CONSTRAINT "parameter_limit_categories_pkey" TO "parameter_limit_profiles_pkey";

-- AlterTable
ALTER TABLE "parameters" ADD COLUMN     "hasLimits" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "projects_parameterLimitProfileId_idx" ON "projects"("parameterLimitProfileId");

-- AddForeignKey
ALTER TABLE "parameter_limits" ADD CONSTRAINT "parameter_limits_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "parameter_limit_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_parameterLimitProfileId_fkey" FOREIGN KEY ("parameterLimitProfileId") REFERENCES "parameter_limit_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "parameter_limit_categories_name_key" RENAME TO "parameter_limit_profiles_name_key";
