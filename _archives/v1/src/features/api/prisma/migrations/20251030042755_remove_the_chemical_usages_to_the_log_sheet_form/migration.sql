/*
  Warnings:

  - You are about to drop the column `coolingTowerLogSheetId` on the `chemical_usages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."chemical_usages" DROP CONSTRAINT "chemical_usages_coolingTowerLogSheetId_fkey";

-- DropIndex
DROP INDEX "public"."chemical_usages_coolingTowerLogSheetId_machineId_idx";

-- DropIndex
DROP INDEX "public"."log_sheet_details_logSheetId_machineId_parameterId_idx";

-- DropIndex
DROP INDEX "public"."log_sheet_details_logSheetId_parameterId_idx";

-- DropIndex
DROP INDEX "public"."log_sheet_details_machineId_parameterId_idx";

-- DropIndex
DROP INDEX "public"."log_sheet_details_parameterId_idx";

-- AlterTable
ALTER TABLE "public"."chemical_usages" DROP COLUMN "coolingTowerLogSheetId",
ADD COLUMN     "logSheetId" TEXT;

-- CreateIndex
CREATE INDEX "chemical_usages_logSheetId_machineId_idx" ON "public"."chemical_usages"("logSheetId", "machineId");

-- CreateIndex
CREATE INDEX "log_sheet_details_logSheetId_machineId_parameterId_groupId_idx" ON "public"."log_sheet_details"("logSheetId", "machineId", "parameterId", "groupId");

-- CreateIndex
CREATE INDEX "log_sheet_details_logSheetId_parameterId_groupId_idx" ON "public"."log_sheet_details"("logSheetId", "parameterId", "groupId");

-- CreateIndex
CREATE INDEX "log_sheet_details_machineId_parameterId_groupId_idx" ON "public"."log_sheet_details"("machineId", "parameterId", "groupId");

-- CreateIndex
CREATE INDEX "log_sheet_details_parameterId_groupId_idx" ON "public"."log_sheet_details"("parameterId", "groupId");

-- AddForeignKey
ALTER TABLE "public"."chemical_usages" ADD CONSTRAINT "chemical_usages_logSheetId_fkey" FOREIGN KEY ("logSheetId") REFERENCES "public"."log_sheets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
