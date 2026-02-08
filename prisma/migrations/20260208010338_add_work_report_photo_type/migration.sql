-- CreateEnum
CREATE TYPE "WorkReportPhotoType" AS ENUM ('BEFORE', 'AFTER', 'GENERAL');

-- AlterTable
ALTER TABLE "work_report_photos" ADD COLUMN     "type" "WorkReportPhotoType" NOT NULL DEFAULT 'GENERAL';
