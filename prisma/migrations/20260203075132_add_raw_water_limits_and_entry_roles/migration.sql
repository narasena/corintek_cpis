-- CreateEnum
CREATE TYPE "LogSheetEntryRole" AS ENUM ('VALUE', 'RAW_WATER', 'NOTE');

-- AlterTable
ALTER TABLE "log_sheet_entries" ADD COLUMN     "role" "LogSheetEntryRole" NOT NULL DEFAULT 'VALUE';

-- AlterTable
ALTER TABLE "parameters" ADD COLUMN     "rawWaterMaxValue" DOUBLE PRECISION,
ADD COLUMN     "rawWaterMinValue" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "log_sheet_entries_role_idx" ON "log_sheet_entries"("role");
